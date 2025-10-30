import { useState, useEffect } from 'react'
import technicianService from '../../../api/technicianService'
import staffService from '../../../api/staffService'
import logger from '../../../utils/logger'
import '../../../styles/EmployeeManagement.css'

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState(null)
  const [formData, setFormData] = useState({
    id: '',
    fullName: '',
    username: '',
    email: '',
    password: '',
    phone: '',
    role: 'TECHNICIAN', // TECHNICIAN or STAFF
    gender: 'MALE'
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Load employees from API
  useEffect(() => {
    loadEmployees()
  }, [])

  const loadEmployees = async () => {
    setIsLoading(true)
    try {
      // Fetch both technicians and staff in parallel
      const [techniciansResult, staffResult] = await Promise.all([
        technicianService.getAllTechnicians(),
        staffService.getAllStaff()
      ])

      const allEmployees = []

      // Add technicians
      if (techniciansResult.success && techniciansResult.data) {
        const technicians = techniciansResult.data.map(tech => ({
          ...tech,
          role: 'TECHNICIAN',
          joinDate: new Date(tech.createdAt).toISOString().split('T')[0]
        }))
        allEmployees.push(...technicians)
      } else {
        logger.error('Failed to load technicians:', techniciansResult.message)
      }

      // Add staff
      if (staffResult.success && staffResult.data) {
        const staff = staffResult.data.map(s => ({
          ...s,
          role: 'STAFF',
          joinDate: new Date(s.createdAt).toISOString().split('T')[0]
        }))
        allEmployees.push(...staff)
      } else {
        logger.error('Failed to load staff:', staffResult.message)
      }

      // Sort by creation date (newest first)
      allEmployees.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

      setEmployees(allEmployees)
      logger.log('Loaded employees:', allEmployees)
    } catch (error) {
      logger.error('Error loading employees:', error)
      alert('Failed to load employees. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const resetForm = () => {
    setFormData({
      id: '',
      fullName: '',
      username: '',
      email: '',
      password: '',
      phone: '',
      role: 'TECHNICIAN',
      gender: 'MALE'
    })
    setEditingEmployee(null)
    setShowAddForm(false)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (editingEmployee) {
      // Update existing employee
      setEmployees(prev => prev.map(emp => 
        emp.id === editingEmployee.id ? { ...formData, id: editingEmployee.id } : emp
      ))
    } else {
      // Add new employee
      const newEmployee = {
        ...formData,
        id: Date.now(), // Simple ID generation
        joinDate: new Date().toISOString().split('T')[0] // Current date
      }
      setEmployees(prev => [...prev, newEmployee])
    }
    
    resetForm()
  }

  const handleEdit = (employee) => {
    setFormData(employee)
    setEditingEmployee(employee)
    setShowAddForm(true)
  }

  const handleDelete = async (employee) => {
    if (!window.confirm(`Are you sure you want to delete ${employee.fullName}?`)) {
      return
    }

    try {
      let result
      
      // Call appropriate delete API based on role
      if (employee.role === 'TECHNICIAN') {
        result = await technicianService.deleteTechnician(employee.id)
      } else if (employee.role === 'STAFF') {
        result = await staffService.deleteStaff(employee.id)
      }

      if (result && result.success) {
        alert(`${employee.fullName} deleted successfully!`)
        // Refresh the employee list
        loadEmployees()
      } else {
        alert(`Failed to delete employee: ${result?.message || 'Unknown error'}`)
      }
    } catch (error) {
      logger.error('Error deleting employee:', error)
      alert('An error occurred while deleting employee')
    }
  }



  // Filter employees
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === 'all' || emp.role === filterRole.toUpperCase()
    return matchesSearch && matchesRole
  })

  return (
    <div className="employee-management">
      {/* Header Actions */}
      <div className="management-header">
        <div className="search-filters">
          <input
            type="text"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="role-filter"
          >
            <option value="all">All Roles</option>
            <option value="technician">Technicians</option>
            <option value="staff">Staff</option>
          </select>
          
          <button
            className="refresh-btn"
            onClick={loadEmployees}
            disabled={isLoading}
            title="Refresh employee list"
          >
            {isLoading ? '⏳' : '🔄'}
          </button>
        </div>
        
        <button
          className="add-employee-btn"
          onClick={() => setShowAddForm(true)}
        >
          + Add Employee
        </button>
      </div>

      {/* Employee Form Modal */}
      {showAddForm && (
        <div className="modal-overlay">
          <div className="employee-form-modal">
            <div className="modal-header">
              <h3>{editingEmployee ? 'Edit Employee' : 'Add New Employee'}</h3>
              <button className="close-btn" onClick={resetForm}>✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="employee-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="fullName">Full Name *</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter full name"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="username">Username *</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter username"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter email address"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="password">Password *</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter password"
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone">Phone Number *</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter phone number"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="gender">Gender *</label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              {!editingEmployee && (
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="role">Role *</label>
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="TECHNICIAN">Technician</option>
                      <option value="STAFF">Staff</option>
                    </select>
                  </div>
                </div>
              )}

              {editingEmployee && (
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="currentRole">Current Role</label>
                    <input
                      type="text"
                      id="currentRole"
                      value={formData.role === 'TECHNICIAN' ? '🔧 Technician' : '👥 Staff'}
                      disabled
                      className="disabled-input"
                      style={{ background: '#f0f4f8', cursor: 'not-allowed' }}
                    />
                    <small style={{ color: '#666', fontSize: '0.85rem' }}>
                      Role cannot be changed after creation
                    </small>
                  </div>
                </div>
              )}

              <div className="form-actions">
                <button type="button" onClick={resetForm} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  {editingEmployee ? 'Update' : 'Add'} Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Employee List */}
      <div className="employee-list">
        <div className="list-header">
          <h3>Employees ({filteredEmployees.length})</h3>
        </div>

        {isLoading ? (
          <div className="loading-state">
            <p>⏳ Loading employees...</p>
          </div>
        ) : (
          <div className="employee-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Join Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map(employee => (
                <tr key={employee.id}>
                  <td>
                    <div className="employee-name">
                      <div className="employee-avatar">
                        {employee.fullName.charAt(0).toUpperCase()}
                      </div>
                      <span>{employee.fullName}</span>
                    </div>
                  </td>
                  <td>{employee.username}</td>
                  <td>{employee.email}</td>
                  <td>
                    <span className={`role-badge ${employee.role.toLowerCase()}`}>
                      {employee.role === 'TECHNICIAN' ? '🔧 Technician' : '👥 Staff'}
                    </span>
                  </td>
                  <td>{employee.joinDate}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="edit-btn"
                        onClick={() => handleEdit(employee)}
                        title="Edit Employee"
                      >
                        ✏️
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(employee)}
                        title="Delete Employee"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredEmployees.length === 0 && (
            <div className="empty-state">
              <p>No employees found matching your criteria.</p>
            </div>
          )}
          </div>
        )}
      </div>
    </div>
  )
}

export default EmployeeManagement