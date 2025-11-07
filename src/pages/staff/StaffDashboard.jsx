import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../../components/layout/Header'
import Footer from '../../components/layout/Footer'
import appointmentService from '../../api/appointmentService'
import technicianService from '../../api/technicianService'
import customerService from '../../api/customerService'
import vehicleService from '../../api/vehicleService'
import logger from '../../utils/logger'
import '../../styles/StaffDashboard.css'
import authService from '../../api/authService'

const StaffDashboard = () => {
  const navigate = useNavigate()
  const [appointments, setAppointments] = useState([])
  const [technicians, setTechnicians] = useState([])
  const [customers, setCustomers] = useState([])
  const [vehicleModels, setVehicleModels] = useState([])
  const [loading, setLoading] = useState(true)
  const [assignLoading, setAssignLoading] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedTechnician, setSelectedTechnician] = useState('')
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [searchTerm, setSearchTerm] = useState('')
  const [staffName, setStaffName] = useState('')
  
  // Modal states for new workflows
  const [showCreateCustomerModal, setShowCreateCustomerModal] = useState(false)
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false)
  const [showServiceRecommendationModal, setShowServiceRecommendationModal] = useState(false)
  const [showAdditionalServiceModal, setShowAdditionalServiceModal] = useState(false)
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [activeTab, setActiveTab] = useState('appointments') // appointments, walk-ins, invoices
  
  // Form states
  const [customerForm, setCustomerForm] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    gender: 'MALE'
  })
  const [vehicleForm, setVehicleForm] = useState({
    customerId: '',
    customerUsername: '',
    customerName: '',
    vinNumber: '',
    licensePlate: '',
    model: '',
    currentKilometers: '',
    purchaseYear: ''
  })
  const [selectedVehicleForService, setSelectedVehicleForService] = useState(null)
  const [recommendedServices, setRecommendedServices] = useState([])
  const [additionalServices, setAdditionalServices] = useState([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Get staff name from localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      setStaffName(user.fullName || 'Staff')
      
      const [appointmentsResult, techniciansResult, customersResult, vehicleModelsResult] = await Promise.all([
        appointmentService.getAllAppointments(),
        technicianService.getAllTechnicians(),
        customerService.getAllCustomers(),
        vehicleService.getAllVehicleModels()
      ])

      if (appointmentsResult.success) {
        const appointmentsData = appointmentsResult.data || []
        if (appointmentsData.length > 0) {
          logger.log('Sample appointment data:', appointmentsData[0])
        }
        setAppointments(appointmentsData)
      } else {
        logger.error('Failed to fetch appointments:', appointmentsResult.message)
      }

      if (techniciansResult.success) {
        setTechnicians(techniciansResult.data || [])
      } else {
        logger.error('Failed to fetch technicians:', techniciansResult.message)
      }

      if (customersResult.success) {
        setCustomers(customersResult.data || [])
      } else {
        logger.error('Failed to fetch customers:', customersResult.message)
      }

      if (vehicleModelsResult.success) {
        setVehicleModels(vehicleModelsResult.data || [])
      } else {
        logger.error('Failed to fetch vehicle models:', vehicleModelsResult.message)
      }
    } catch (error) {
      logger.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  // ===== NEW WORKFLOW FUNCTIONS =====
  
  // Step 1: Create customer account (walk-in customer)
  const handleCreateCustomer = async (e) => {
    e.preventDefault()
    
    if (!customerForm.fullName || !customerForm.phoneNumber || !customerForm.email) {
      alert('Vui lòng điền đầy đủ thông tin khách hàng!')
      return
    }

    try {
      // Create customer account using register API from authService
      const registerData = {
        username: customerForm.phoneNumber, // Phone number as username
        password: customerForm.phoneNumber, // Default password = phone number
        fullName: customerForm.fullName,
        email: customerForm.email,
        phone: customerForm.phoneNumber,
        gender: customerForm.gender
      }

      const result = await authService.register(registerData)

      if (result.success) {
        alert(`Tài khoản đã được tạo thành công!\nUsername: ${customerForm.phoneNumber}\nPassword: ${customerForm.phoneNumber}\n\nVui lòng thông báo cho khách hàng.`)
        setShowCreateCustomerModal(false)
        setCustomerForm({ 
          fullName: '', 
          phoneNumber: '', 
          email: '',
          gender: 'MALE'
        })
        fetchData()
      } else {
        alert(`Lỗi: ${result.message}`)
      }
    } catch (error) {
      logger.error('Error creating customer:', error)
      alert('Có lỗi xảy ra khi tạo tài khoản!')
    }
  }

  // Function to find customer by username
  const handleCustomerUsernameChange = async (username) => {
    setVehicleForm({
      ...vehicleForm,
      customerUsername: username,
      customerName: '',
      customerId: ''
    })

    if (username.trim() === '') {
      return
    }

    // Find customer by username
    const foundCustomer = customers.find(c => c.username === username.trim())
    
    if (foundCustomer) {
      setVehicleForm({
        ...vehicleForm,
        customerUsername: username,
        customerName: foundCustomer.fullName,
        customerId: foundCustomer.customerId || foundCustomer.id
      })
    }
  }

  // Step 2: Add vehicle for customer (Staff only)
  const handleAddVehicle = async (e) => {
    e.preventDefault()
    
    if (!vehicleForm.customerId || !vehicleForm.vinNumber || !vehicleForm.licensePlate || !vehicleForm.model) {
      alert('Vui lòng điền đầy đủ thông tin xe!')
      return
    }

    try {
      // Format request body theo API yêu cầu
      const vehicleData = {
        licensePlate: vehicleForm.licensePlate,
        vin: vehicleForm.vinNumber,
        currentKm: parseInt(vehicleForm.currentKilometers) || 0,
        purchaseYear: vehicleForm.purchaseYear,
        modelId: parseInt(vehicleForm.model), // model ID from select box
        customerId: parseInt(vehicleForm.customerId)
      }

      const result = await vehicleService.createVehicle(vehicleData)

      if (result.success) {
        alert('Xe đã được thêm thành công!')
        
        // Fetch service recommendations based on km/time
        const vehicleId = result.data.id || result.data.vehicleId
        if (vehicleId) {
          await fetchServiceRecommendations(vehicleId)
        }
        
        setShowAddVehicleModal(false)
        setVehicleForm({
          customerId: '',
          customerUsername: '',
          customerName: '',
          vinNumber: '',
          licensePlate: '',
          model: '',
          currentKilometers: '',
          purchaseYear: ''
        })
      } else {
        alert(`Lỗi: ${result.message}`)
      }
    } catch (error) {
      logger.error('Error adding vehicle:', error)
      alert('Có lỗi xảy ra khi thêm xe!')
    }
  }

  // Step 3: Fetch service recommendations
  const fetchServiceRecommendations = async (vehicleId) => {
    try {
      const result = await vehicleService.getServiceRecommendations(vehicleId)
      
      if (result.success) {
        setRecommendedServices(result.data)
        setSelectedVehicleForService(vehicleId)
        setShowServiceRecommendationModal(true)
      } else {
        alert('Không có gói dịch vụ đề xuất cho xe này.')
      }
    } catch (error) {
      logger.error('Error fetching recommendations:', error)
    }
  }

  // Step 4: Confirm service package
  const handleConfirmServicePackage = async () => {
    if (!selectedVehicleForService) return
    
    try {
      // Notify customer to login and confirm booking
      alert(`Vui lòng liên hệ khách hàng:\n\n"Xe của anh/chị sau khi kiểm tra dựa trên số km đi được / thời gian mua xe, bên em có đề xuất gói dịch vụ như đã hiển thị. Anh/chị vui lòng đăng nhập vào hệ thống để xác nhận đặt lịch bảo dưỡng."\n\nUsername: [số điện thoại khách hàng]`)
      
      setShowServiceRecommendationModal(false)
      setRecommendedServices([])
      setSelectedVehicleForService(null)
    } catch (error) {
      logger.error('Error confirming service:', error)
    }
  }

  // Step 5: Assign technician to appointment
  const handleAssignClick = (appointment) => {
    logger.log('Selected appointment:', appointment)
    setSelectedAppointment(appointment)
    setSelectedTechnician('')
    setShowAssignModal(true)
  }

  const handleAssignSubmit = async () => {
    if (!selectedTechnician) {
      alert('Vui lòng chọn kỹ thuật viên!')
      return
    }

    const appointmentId = selectedAppointment.appointmentId || 
                         selectedAppointment.id || 
                         selectedAppointment.appointmentID

    if (!appointmentId) {
      logger.error('Appointment ID not found:', selectedAppointment)
      alert('Lỗi: Không tìm thấy ID appointment')
      return
    }

    logger.log('Assigning technician:', { appointmentId, technicianId: selectedTechnician })

    setAssignLoading(true)
    try {
      const result = await technicianService.assignTechnicianToAppointment(
        appointmentId,
        selectedTechnician
      )

      if (result.success) {
        alert('Đã assign kỹ thuật viên thành công!\nHệ thống sẽ gửi thông báo đến kỹ thuật viên và khách hàng.')
        setShowAssignModal(false)
        fetchData()
      } else {
        alert(`Lỗi: ${result.message}`)
      }
    } catch (error) {
      logger.error('Error assigning technician:', error)
      alert('Có lỗi xảy ra khi assign kỹ thuật viên!')
    } finally {
      setAssignLoading(false)
    }
  }

  // Step 6: Handle INCOMPLETED appointments (need additional services)
  const handleIncompletedAppointment = (appointment) => {
    setSelectedAppointment(appointment)
    // Fetch additional services needed for this appointment
    // This would typically come from technician's notes
    setAdditionalServices([
      { name: 'Thay phanh', price: 500000 },
      { name: 'Thay lốp', price: 1200000 }
    ])
    setShowAdditionalServiceModal(true)
  }

  const handleConfirmAdditionalServices = async (approved) => {
    const appointmentId = selectedAppointment.appointmentId || 
                         selectedAppointment.id || 
                         selectedAppointment.appointmentID

    if (!approved) {
      // Customer declined additional services
      try {
        const result = await appointmentService.updateAppointmentStatus(
          appointmentId,
          'COMPLETED'
        )
        
        if (result.success) {
          alert('Đã cập nhật trạng thái appointment thành COMPLETED.')
          setShowAdditionalServiceModal(false)
          fetchData()
        }
      } catch (error) {
        logger.error('Error updating status:', error)
      }
    } else {
      // Customer approved - create ticket for technician
      try {
        const result = await technicianService.createAdditionalServiceTicket({
          appointmentId: appointmentId,
          technicianId: selectedAppointment.technicianId,
          services: additionalServices
        })
        
        if (result.success) {
          alert('Đã tạo ticket cho kỹ thuật viên thực hiện dịch vụ bổ sung.')
          setShowAdditionalServiceModal(false)
          fetchData()
        } else {
          alert(`Lỗi: ${result.message}`)
        }
      } catch (error) {
        logger.error('Error creating ticket:', error)
        alert('Có lỗi xảy ra khi tạo ticket!')
      }
    }
  }

  // Step 7: Generate invoice for completed appointment
  const handleGenerateInvoice = async (appointment) => {
    const appointmentId = appointment.appointmentId || 
                         appointment.id || 
                         appointment.appointmentID

    try {
      const result = await appointmentService.generateInvoice(appointmentId)
      
      if (result.success) {
        alert(`Hoá đơn đã được tạo thành công!\n\nVui lòng liên hệ khách hàng:\n"Anh/chị vui lòng đăng nhập vào hệ thống, vào phần My Invoice để xem chi tiết và thanh toán."`)
        fetchData()
      } else {
        alert(`Lỗi: ${result.message}`)
      }
    } catch (error) {
      logger.error('Error generating invoice:', error)
      alert('Có lỗi xảy ra khi tạo hoá đơn!')
    }
  }

  const formatTimeFromDate = (dateString) => {
    if (!dateString) return 'N/A'
    // Extract time from ISO format "2025-11-01T14:36:00"
    const timePart = dateString.split('T')[1]
    return timePart.substring(0, 5) // HH:mm (14:36)
  }

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      PENDING: 'status-pending',
      CONFIRMED: 'status-confirmed',
      INCOMPLETED: 'status-incompleted',
      COMPLETED: 'status-completed',
      CANCELLED: 'status-cancelled'
    }
    return statusMap[status] || 'status-default'
  }

  const getStatusText = (status) => {
    const statusTextMap = {
      PENDING: 'Chờ xử lý',
      CONFIRMED: 'Đã xác nhận',
      INCOMPLETED: 'Cần bổ sung',
      COMPLETED: 'Hoàn thành',
      CANCELLED: 'Đã huỷ'
    }
    return statusTextMap[status] || status
  }

  const filteredAppointments = appointments.filter(appointment => {
    const matchesStatus = filterStatus === 'ALL' || appointment.status === filterStatus
    const appointmentId = appointment.appointmentId || appointment.id || appointment.appointmentID
    const matchesSearch = 
      appointment.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.vehiclePlate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointmentId?.toString().includes(searchTerm)
    return matchesStatus && matchesSearch
  })

  const handleLogout = () => {
    if (window.confirm('Bạn có chắc muốn đăng xuất?')) {
        authService.logout()
    }
  }

  if (loading) {
    return (
      <div className="staff-dashboard">
        <Header />
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="staff-dashboard">
      <Header />
      <div className="staff-container">
        <div className="staff-header">
          <div className="header-content">
            <h1> Staff Dashboard - Quản Lý Bảo Dưỡng</h1>
            <p>Quản lý khách hàng walk-in, xe, appointment và hoá đơn</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span style={{ color: '#ffffff', fontSize: '0.95rem' }}>
              Hi {staffName}, Hope you find your day!
            </span>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="tabs-navigation">
          <button 
            className={`tab-btn ${activeTab === 'walk-in' ? 'active' : ''}`}
            onClick={() => setActiveTab('walk-in')}
          >
            Khách Hàng Walk-in
          </button>
          <button 
            className={`tab-btn ${activeTab === 'appointments' ? 'active' : ''}`}
            onClick={() => setActiveTab('appointments')}
          >
            Quản Lý Appointments
          </button>
          <button 
            className={`tab-btn ${activeTab === 'invoices' ? 'active' : ''}`}
            onClick={() => setActiveTab('invoices')}
          >
            Hoá Đơn & Thanh Toán
          </button>
        </div>

        {/* TAB: WALK-IN CUSTOMERS */}
        {activeTab === 'walk-in' && (
          <div className="walk-in-section">
            <div className="section-header">
              <h2>Đăng Ký Khách Hàng Walk-in</h2>
              <p>Khách hàng đến trực tiếp trung tâm, ghi nhận thông tin và tạo tài khoản</p>
            </div>

            <div className="action-buttons">
              <button 
                className="primary-btn"
                onClick={() => setShowCreateCustomerModal(true)}
              >
                 Tạo Tài Khoản Khách Hàng
              </button>
              <button 
                className="secondary-btn"
                onClick={() => setShowAddVehicleModal(true)}
              >
                 Thêm Xe Cho Khách Hàng
              </button>
            </div>

            <div className="info-card">
              <h3> Quy Trình Tiếp Nhận Khách Walk-in:</h3>
              <ol>
                <li><strong>Ghi nhận thông tin:</strong> Họ tên, Số điện thoại, Email, Giới tính</li>
                <li><strong>Tạo tài khoản:</strong> Username = Số điện thoại, Password = Số điện thoại</li>
                <li><strong>Kiểm tra xe:</strong> Số VIN, Biển số, Số km hiện tại, Giấy tờ xe</li>
                <li><strong>Thêm xe:</strong> Staff thêm xe vào tài khoản khách hàng</li>
                <li><strong>Đề xuất dịch vụ:</strong> Hệ thống đề xuất gói dịch vụ dựa trên km/thời gian</li>
                <li><strong>Liên hệ khách:</strong> Thông báo khách đăng nhập và xác nhận đặt lịch</li>
              </ol>
            </div>

            <div className="customers-list">
              <h3>Danh Sách Khách Hàng ({customers.length})</h3>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Họ Tên</th>
                    <th>Số Điện Thoại</th>
                    <th>Email</th>
                    <th>Ngày Tạo</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.slice(0, 10).map((customer) => (
                    <tr key={customer.customerId || customer.id}>
                      <td>#{customer.customerId || customer.id}</td>
                      <td>{customer.fullName}</td>
                      <td>{customer.phone}</td>
                      <td>{customer.email}</td>
                      <td>{customer.createdAt ? new Date(customer.createdAt).toLocaleDateString('vi-VN') : 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: APPOINTMENTS MANAGEMENT */}
        {activeTab === 'appointments' && (
          <>
            {/* Filters */}
            <div className="filters-section">
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Tìm theo tên khách hàng, biển số xe, ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="status-filters">
                <button 
                  className={`filter-btn ${filterStatus === 'ALL' ? 'active' : ''}`}
                  onClick={() => setFilterStatus('ALL')}
                >
                  Tất cả ({appointments.length})
                </button>
                <button 
                  className={`filter-btn ${filterStatus === 'PENDING' ? 'active' : ''}`}
                  onClick={() => setFilterStatus('PENDING')}
                >
                  Chờ xử lý ({appointments.filter(a => a.status === 'PENDING').length})
                </button>
                <button 
                  className={`filter-btn ${filterStatus === 'CONFIRMED' ? 'active' : ''}`}
                  onClick={() => setFilterStatus('CONFIRMED')}
                >
                  Đã xác nhận ({appointments.filter(a => a.status === 'CONFIRMED').length})
                </button>
                <button 
                  className={`filter-btn ${filterStatus === 'INCOMPLETED' ? 'active' : ''}`}
                  onClick={() => setFilterStatus('INCOMPLETED')}
                >
                  Cần bổ sung ({appointments.filter(a => a.status === 'INCOMPLETED').length})
                </button>
                <button 
                  className={`filter-btn ${filterStatus === 'COMPLETED' ? 'active' : ''}`}
                  onClick={() => setFilterStatus('COMPLETED')}
                >
                  Hoàn thành ({appointments.filter(a => a.status === 'COMPLETED').length})
                </button>
                <button 
                  className={`filter-btn ${filterStatus === 'CANCELLED' ? 'active' : ''}`}
                  onClick={() => setFilterStatus('CANCELLED')}
                >
                  Đã huỷ ({appointments.filter(a => a.status === 'CANCELLED').length})
                </button>
              </div>
            </div>

            {/* Appointments Table */}
            <div className="appointments-table-container">
              {filteredAppointments.length === 0 ? (
                <div className="no-data">
                  <p>Không có appointment nào</p>
                </div>
              ) : (
                <table className="appointments-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Khách Hàng</th>
                      <th>Biển Số</th>
                      <th>Xe</th>
                      <th>Ngày</th>
                      <th>Giờ</th>
                      <th>Dịch Vụ</th>
                      <th>Trạng Thái</th>
                      <th>Kỹ Thuật Viên</th>
                      <th>Hành Động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAppointments.map((appointment) => {
                      const appointmentId = appointment.appointmentId || appointment.id || appointment.appointmentID
                      return (
                        <tr key={appointmentId}>
                          <td>#{appointmentId}</td>
                          <td>{appointment.customerName || 'N/A'}</td>  
                          <td>{appointment.vehicleLicensePlate || 'N/A'}</td>
                          <td>{appointment.vehicleModel || 'N/A'}</td>
                          <td>{new Date(appointment.appointmentDate).toLocaleDateString('vi-VN')}</td>
                          <td>{formatTimeFromDate(appointment.appointmentDate)}</td>
                          <td>
                            <div className="service-info">
                              {appointment.servicePackageName || 'Dịch vụ lẻ'}
                            </div>
                          </td>
                          <td>
                            <span className={`status-badge ${getStatusBadgeClass(appointment.status)}`}>
                              {getStatusText(appointment.status)}
                            </span>
                          </td>
                          <td>
                            {appointment.technicianName ? (
                              <div className="technician-assigned">
                                {appointment.technicianName}
                              </div>
                            ) : (
                              <span className="no-technician">Chưa assign</span>
                            )}
                          </td>
                          <td>
                            <div className="action-btns">
                              {appointment.status === 'PENDING' && (
                                <button
                                  className="assign-btn"
                                  onClick={() => handleAssignClick(appointment)}
                                >
                                  Assign KTV
                                </button>
                              )}
                              {appointment.status === 'INCOMPLETED' && (
                                <button
                                  className="additional-btn"
                                  onClick={() => handleIncompletedAppointment(appointment)}
                                >
                                  Xử lý bổ sung
                                </button>
                              )}
                              {appointment.status === 'COMPLETED' && !appointment.invoiceGenerated && (
                                <button
                                  className="invoice-btn"
                                  onClick={() => handleGenerateInvoice(appointment)}
                                >
                                  Xuất hoá đơn
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Statistics */}
            <div className="statistics-section">
              <div className="stat-card">
                <div className="stat-icon"></div>
                <div className="stat-info">
                  <h3>{appointments.length}</h3>
                  <p>Tổng Appointments</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon"></div>
                <div className="stat-info">
                  <h3>{appointments.filter(a => a.status === 'PENDING').length}</h3>
                  <p>Chờ xử lý</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon"></div>
                <div className="stat-info">
                  <h3>{appointments.filter(a => a.status === 'INCOMPLETED').length}</h3>
                  <p>Cần bổ sung</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon"></div>
                <div className="stat-info">
                  <h3>{appointments.filter(a => a.status === 'COMPLETED').length}</h3>
                  <p>Hoàn thành</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon"></div>
                <div className="stat-info">
                  <h3>{technicians.length}</h3>
                  <p>Kỹ Thuật Viên</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* MODAL: Create Customer */}
      {showCreateCustomerModal && (
        <div className="modal-overlay" onClick={() => setShowCreateCustomerModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Tạo Tài Khoản Khách Hàng</h2>
              <button className="close-btn" onClick={() => setShowCreateCustomerModal(false)}>
                ×
              </button>
            </div>
            
            <form className="modal-body" onSubmit={handleCreateCustomer}>
              <div className="form-group">
                <label htmlFor="fullName">Họ và Tên *</label>
                <input
                  type="text"
                  id="fullName"
                  value={customerForm.fullName}
                  onChange={(e) => setCustomerForm({...customerForm, fullName: e.target.value})}
                  placeholder="Nguyễn Văn A"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="phoneNumber">Số Điện Thoại *</label>
                <input
                  type="tel"
                  id="phoneNumber"
                  value={customerForm.phoneNumber}
                  onChange={(e) => setCustomerForm({...customerForm, phoneNumber: e.target.value})}
                  placeholder="0123456789"
                  required
                />
                <small>Số điện thoại sẽ được dùng làm Username và Password</small>
              </div>

              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  value={customerForm.email}
                  onChange={(e) => setCustomerForm({...customerForm, email: e.target.value})}
                  placeholder="email@example.com"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="gender">Giới Tính *</label>
                <select
                  id="gender"
                  value={customerForm.gender}
                  onChange={(e) => setCustomerForm({...customerForm, gender: e.target.value})}
                  required
                >
                  <option value="MALE">Nam</option>
                  <option value="FEMALE">Nữ</option>
                  <option value="OTHER">Khác</option>
                </select>
              </div>

              <div className="modal-footer">
                <button 
                  type="button"
                  className="cancel-btn" 
                  onClick={() => setShowCreateCustomerModal(false)}
                >
                  Huỷ
                </button>
                <button type="submit" className="submit-btn">
                  Tạo Tài Khoản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Add Vehicle */}
      {showAddVehicleModal && (
        <div className="modal-overlay" onClick={() => setShowAddVehicleModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Thêm Xe Cho Khách Hàng</h2>
              <button className="close-btn" onClick={() => setShowAddVehicleModal(false)}>
                ×
              </button>
            </div>
            
            <form className="modal-body" onSubmit={handleAddVehicle}>
              <div className="form-group">
                <label htmlFor="customerUsername">Username Khách Hàng *</label>
                <input
                  type="text"
                  id="customerUsername"
                  value={vehicleForm.customerUsername}
                  onChange={(e) => handleCustomerUsernameChange(e.target.value)}
                  placeholder="Nhập username (số điện thoại)"
                  required
                />
                {vehicleForm.customerName && (
                  <div className="customer-found">
                    ✓ Khách hàng: <strong>{vehicleForm.customerName}</strong>
                  </div>
                )}
                {vehicleForm.customerUsername && !vehicleForm.customerName && (
                  <div className="customer-not-found">
                    ⚠ Không tìm thấy khách hàng với username này
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="vinNumber">Số VIN *</label>
                <input
                  type="text"
                  id="vinNumber"
                  value={vehicleForm.vinNumber}
                  onChange={(e) => setVehicleForm({...vehicleForm, vinNumber: e.target.value})}
                  placeholder="VF12345678901234"
                  maxLength={17}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="licensePlate">Biển Số Xe *</label>
                <input
                  type="text"
                  id="licensePlate"
                  value={vehicleForm.licensePlate}
                  onChange={(e) => setVehicleForm({...vehicleForm, licensePlate: e.target.value})}
                  placeholder="29A-12345"
                  maxLength={10}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="model">Model Xe *</label>
                <select
                  id="model"
                  value={vehicleForm.model}
                  onChange={(e) => setVehicleForm({...vehicleForm, model: e.target.value})}
                  required
                >
                  <option value="">-- Chọn model xe --</option>
                  {vehicleModels.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="currentKilometers">Số Km Hiện Tại *</label>
                <input
                  type="number"
                  id="currentKilometers"
                  value={vehicleForm.currentKilometers}
                  onChange={(e) => setVehicleForm({...vehicleForm, currentKilometers: e.target.value})}
                  placeholder="5000"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="purchaseYear">Ngày Mua Xe</label>
                <input
                  type="month"
                  id="purchaseYear"
                  value={vehicleForm.purchaseYear}
                  max={`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`}
                  onChange={(e) => setVehicleForm({...vehicleForm, purchaseYear: e.target.value})}
                />
                <small className="field-hint">Tháng và năm mua xe (ví dụ: 2025-11)</small>
              </div>

              <div className="modal-footer">
                <button 
                  type="button"
                  className="cancel-btn" 
                  onClick={() => setShowAddVehicleModal(false)}
                >
                  Huỷ
                </button>
                <button type="submit" className="submit-btn">
                  Thêm Xe
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Service Recommendation */}
      {showServiceRecommendationModal && (
        <div className="modal-overlay" onClick={() => setShowServiceRecommendationModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Gói Dịch Vụ Đề Xuất</h2>
              <button className="close-btn" onClick={() => setShowServiceRecommendationModal(false)}>
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <p><strong>Hệ thống đề xuất gói dịch vụ dựa trên:</strong></p>
              <ul>
                <li>Số km hiện tại của xe</li>
                <li>Thời gian từ lần bảo dưỡng cuối (hoặc từ khi mua xe)</li>
              </ul>

              <div className="recommended-services">
                <h3>Các Gói Dịch Vụ:</h3>
                {recommendedServices.map((service, index) => (
                  <div key={index} className="service-item">
                    <h4>{service.name}</h4>
                    <p>{service.description}</p>
                    <p><strong>Giá:</strong> {service.price?.toLocaleString('vi-VN')} VNĐ</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="cancel-btn" 
                onClick={() => setShowServiceRecommendationModal(false)}
              >
                Đóng
              </button>
              <button 
                className="submit-btn" 
                onClick={handleConfirmServicePackage}
              >
                Xác Nhận & Thông Báo Khách
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Assign Technician */}
      {showAssignModal && (
        <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Assign Kỹ Thuật Viên</h2>
              <button className="close-btn" onClick={() => setShowAssignModal(false)}>
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="appointment-info">
                <h3>Thông Tin Appointment</h3>
                <p><strong>ID:</strong> #{selectedAppointment?.appointmentId || selectedAppointment?.id}</p>
                <p><strong>Khách hàng:</strong> {selectedAppointment?.customerName}</p>
                <p><strong>Biển số:</strong> {selectedAppointment?.vehicleLicensePlate}</p>
                <p><strong>Xe:</strong> {selectedAppointment?.vehicleModel || 'N/A'}</p>
                <p><strong>Ngày:</strong> {selectedAppointment?.appointmentDate ? new Date(selectedAppointment.appointmentDate).toLocaleDateString('vi-VN') : 'N/A'}</p>
              </div>

              <div className="technician-select">
                <label htmlFor="technician">Chọn Kỹ Thuật Viên:</label>
                <select
                  id="technician"
                  value={selectedTechnician}
                  onChange={(e) => setSelectedTechnician(e.target.value)}
                >
                  <option value="">-- Chọn kỹ thuật viên --</option>
                  {technicians.map((tech) => {
                    const techId = tech.technicianId || tech.id
                    return (
                      <option key={techId} value={techId}>
                        {tech.fullName}
                      </option>
                    )
                  })}
                </select>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="cancel-btn" 
                onClick={() => setShowAssignModal(false)}
                disabled={assignLoading}
              >
                Huỷ
              </button>
              <button 
                className="submit-btn" 
                onClick={handleAssignSubmit}
                disabled={assignLoading || !selectedTechnician}
              >
                {assignLoading ? 'Đang xử lý...' : 'Xác Nhận'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Additional Services */}
      {showAdditionalServiceModal && (
        <div className="modal-overlay" onClick={() => setShowAdditionalServiceModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Xử Lý Dịch Vụ Bổ Sung</h2>
              <button className="close-btn" onClick={() => setShowAdditionalServiceModal(false)}>
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <p><strong>Appointment #{selectedAppointment?.appointmentId || selectedAppointment?.id}</strong></p>
              <p>Kỹ thuật viên đã hoàn thành các quy trình cơ bản nhưng phát hiện các bộ phận cần thay thế:</p>
              
              <div className="additional-services-list">
                <h3>Các Dịch Vụ Cần Bổ Sung:</h3>
                {additionalServices.map((service, index) => (
                  <div key={index} className="service-item">
                    <p><strong>{service.name}</strong></p>
                    <p>Giá: {service.price?.toLocaleString('vi-VN')} VNĐ</p>
                  </div>
                ))}
              </div>

              <p><strong>Vui lòng liên hệ khách hàng để xác nhận:</strong></p>
              <div className="contact-message">
                "Xe của anh/chị đã hoàn thành các quy trình cần thiết. Tuy nhiên, kỹ thuật viên nhận thấy một số bộ phận cần thay thế. Anh/chị có muốn chúng tôi thay thế ngay không? Nếu có, chúng tôi sẽ cộng thêm chi phí vào hoá đơn."
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="cancel-btn" 
                onClick={() => handleConfirmAdditionalServices(false)}
              >
                Khách Từ Chối
              </button>
              <button 
                className="submit-btn" 
                onClick={() => handleConfirmAdditionalServices(true)}
              >
                Khách Đồng Ý
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}

export default StaffDashboard
