import { useState, useEffect } from 'react'
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
    role: 'technician', // technician or staff
    status: 'active'
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [showPassword, setShowPassword] = useState(false)

  // Mock data - replace with API call
  useEffect(() => {
    const mockEmployees = [
      {
        id: 1,
        fullName: 'John Doe',
        username: 'johndoe',
        email: 'john@electriccare.com',
        phone: '0123456789',
        role: 'technician',
        joinDate: '2024-01-15',
        status: 'active'
      },
      {
        id: 2,
        fullName: 'Jane Smith',
        username: 'janesmith',
        email: 'jane@electriccare.com',
        phone: '0987654321',
        role: 'staff',
        joinDate: '2024-02-01',
        status: 'active'
      }
    ]
    setEmployees(mockEmployees)
  }, [])

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
      role: 'technician',
      status: 'active'
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

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      setEmployees(prev => prev.filter(emp => emp.id !== id))
    }
  }

  const handleStatusToggle = (id) => {
    setEmployees(prev => prev.map(emp => 
      emp.id === id 
        ? { ...emp, status: emp.status === 'active' ? 'inactive' : 'active' }
        : emp
    ))
  }

  // Filter employees
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === 'all' || emp.role === filterRole
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
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

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
                    <option value="technician">Technician</option>
                    <option value="staff">Staff</option>
                  </select>
                </div>
                

              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="status">Status</label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

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

        <div className="employee-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Join Date</th>
                <th>Status</th>
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
                    <span className={`role-badge ${employee.role}`}>
                      {employee.role === 'technician' ? '🔧 Technician' : '👥 Staff'}
                    </span>
                  </td>
                  <td>{employee.joinDate}</td>
                  <td>
                    <button
                      className={`status-badge ${employee.status}`}
                      onClick={() => handleStatusToggle(employee.id)}
                    >
                      {employee.status === 'active' ? '✅ Active' : '❌ Inactive'}
                    </button>
                  </td>
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
                        onClick={() => handleDelete(employee.id)}
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
      </div>
    </div>
  )
}

export default EmployeeManagement