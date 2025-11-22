import { useState, useEffect } from 'react'
import authService from '../../api/authService'
import vehicleService from '../../api/vehicleService'
import appointmentService from '../../api/appointmentService'
import invoiceService from '../../api/invoiceService'
import logger from '../../utils/logger'
import BookMaintenance from './BookMaintenance'
import AppointmentDetail from './AppointmentDetail'
import AllAppointments from './AllAppointments'
import EditProfile from './EditProfile'
import ChangePassword from './ChangePassword'
import InvoiceList from './InvoiceList'
import CustomerInvoiceDetail from './CustomerInvoiceDetail'
import Footer from '../../components/layout/Footer'
import '../../styles/CustomerDashboard.css'
import customerService from '../../api/customerService'
import { useNavigate } from 'react-router-dom'
import { ChatProvider, useChatNotifications } from '../../contexts/ChatContext'
import CustomerSidebar from '../../components/layout/CustomerSidebar'

const SIDEBAR_WIDTH = 260;

const CustomerDashboardContent = () => {
  const navigate = useNavigate()
  const { unreadCount, clearUnreadCount } = useChatNotifications()
  const [customer, setCustomer] = useState(null)
  const [vehicles, setVehicles] = useState([])
  const [vehicleModels, setVehicleModels] = useState([])
  const [recentAppointments, setRecentAppointments] = useState([])
  const [invoices, setInvoices] = useState([])
  const [activeSection, setActiveSection] = useState('your-vehicle')
  const [showBookMaintenance, setShowBookMaintenance] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState(null)
  const [showAppointmentDetail, setShowAppointmentDetail] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [showAllAppointments, setShowAllAppointments] = useState(false)
  const [showEditProfile, setShowEditProfile] = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [showInvoiceList, setShowInvoiceList] = useState(false)
  const [showInvoiceDetail, setShowInvoiceDetail] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState(null)

  // Load customer data from auth service
  useEffect(() => {
    const loadCustomerData = async () => {
      try {
        // Get user info from token/localStorage
        const userResult = await customerService.getMyInfo()

        if (userResult.success) {
          // Mock customer data based on user info - later replace with API call
          const mockCustomer = {
            id: userResult.data.id,
            fullName: userResult.data.fullName,
            username: userResult.data.username,
            email: userResult.data.email,
            phone: userResult.data.phone,
            joinDate: '2024-01-15'
          }
          setCustomer(mockCustomer)
        } else {
          // Fallback to default data
          const mockCustomer = {
            id: 1,
            fullName: 'Valued Customer',
            username: 'customer',
            email: 'customer@example.com',
            phone: '0123456789',
            joinDate: '2024-01-15'
          }
          setCustomer(mockCustomer)
        }
      } catch (error) {
        logger.error('Error loading customer data:', error)
        // Fallback to default data
        const mockCustomer = {
          id: 1,
          fullName: 'Valued Customer',
          username: 'customer',
          email: 'customer@example.com',
          phone: '0123456789',
          joinDate: '2024-01-15'
        }
        setCustomer(mockCustomer)
      }
    }

    loadCustomerData()
    loadVehicleModels()
    loadVehicles()
    loadAppointments()
    loadInvoices()
  }, [])

  const loadAppointments = async () => {
    try {
      // Get current user info first
      const userResult = await authService.getUserProfile()
      const customerId = userResult.data?.userId
      
      if (!customerId) {
        logger.error('No customer ID found')
        setRecentAppointments([])
        return
      }
      
      // Get appointments for this customer only
      const result = await appointmentService.getAppointmentsByCustomerId(customerId)
      
      if (result.success) {
        const customerAppointments = Array.isArray(result.data) ? result.data : []
        
        // Sort by date (newest first)
        const sortedAppointments = customerAppointments
          .sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate))
        
        setRecentAppointments(sortedAppointments)
        logger.log('Customer appointments loaded:', sortedAppointments)
      } else {
        logger.error('Failed to load appointments:', result.message)
        setRecentAppointments([])
      }
    } catch (error) {
      logger.error('Error loading appointments:', error)
      setRecentAppointments([])
    }
  }

  const loadInvoices = async () => {
    try {
      const result = await invoiceService.getMyInvoices()
      
      if (result.success) {
        const customerInvoices = Array.isArray(result.data) ? result.data : []
        
        // Sort by date (newest first)
        const sortedInvoices = customerInvoices
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        
        setInvoices(sortedInvoices)
        logger.log('Customer invoices loaded:', sortedInvoices)
      } else {
        logger.error('Failed to load invoices:', result.message)
        setInvoices([])
      }
    } catch (error) {
      logger.error('Error loading invoices:', error)
      setInvoices([])
    }
  }

  const loadVehicleModels = async () => {
    try {
      const result = await vehicleService.getAllVehicleModels()
      
      if (result.success) {
        setVehicleModels(result.data || [])
      } else {
        logger.error('Failed to load vehicle models:', result.message)
        setVehicleModels([])
      }
    } catch (error) {
      logger.error('Error loading vehicle models:', error)
      setVehicleModels([])
    }
  }

  const loadVehicles = async () => {
    try {
      const userResult = await authService.getUserProfile()
      const customerId = userResult.data?.userId

      if (customerId) {
        const result = await vehicleService.getVehiclesByCustomerId(customerId)
        
        if (result.success) {
          setVehicles(result.data || [])
        } else {
          logger.error('Failed to load vehicles:', result.message)
          setVehicles([])
        }
      }
    } catch (error) {
      logger.error('Error loading vehicles:', error)
      setVehicles([])
    }
  }

  // Helper function to get vehicle model by ID
  const getVehicleModel = (modelId) => {
    return vehicleModels.find(model => model.id === modelId)
  }

  const handleBookMaintenance = (vehicle) => {
    setSelectedVehicle(vehicle)
    setShowBookMaintenance(true)
  }

  const handleCloseBookMaintenance = () => {
    setShowBookMaintenance(false)
    setSelectedVehicle(null)
  }

  const handleAppointmentCreated = (appointment) => {
    // Refresh appointments list
    loadAppointments()
    logger.log('Appointment created:', appointment)
  }

  const handleDeleteVehicle = async (vehicleId, licensePlate) => {
    if (window.confirm(`Are you sure you want to delete vehicle ${licensePlate}?`)) {
      try {
        const result = await vehicleService.deleteVehicle(vehicleId)
        
        if (result.success) {
          alert('Vehicle deleted successfully!')
          loadVehicles() // Refresh the vehicle list
        } else {
          alert(`Failed to delete vehicle: ${result.message}`)
        }
      } catch (error) {
        logger.error('Error deleting vehicle:', error)
        alert('An error occurred while deleting the vehicle')
      }
    }
  }

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      authService.logout()
    }
  }

  const handleViewAppointment = (appointment) => {
    setSelectedAppointment(appointment)
    setShowAppointmentDetail(true)
  }

  const handleCloseAppointmentDetail = () => {
    setShowAppointmentDetail(false)
    setSelectedAppointment(null)
  }

  const handleViewAllAppointments = () => {
    setShowAllAppointments(true)
  }

  const handleCloseAllAppointments = () => {
    setShowAllAppointments(false)
  }

  const handleViewDetailFromAll = (appointment) => {
    setShowAllAppointments(false)
    setSelectedAppointment(appointment)
    setShowAppointmentDetail(true)
  }

  const handleEditProfile = () => {
    setShowEditProfile(true)
  }

  const handleCloseEditProfile = () => {
    setShowEditProfile(false)
  }

  const handleProfileUpdated = (updatedProfile) => {
    // Update customer state with new info
    setCustomer(prev => ({
      ...prev,
      fullName: updatedProfile.fullName,
      email: updatedProfile.email,
      phone: updatedProfile.phone,
      gender: updatedProfile.gender
    }))
  }

  const handleChangePassword = () => {
    setShowChangePassword(true)
  }

  const handleCloseChangePassword = () => {
    setShowChangePassword(false)
  }

  const handlePasswordChanged = () => {
    // Optional: Could show a success notification or log out user
    logger.log('Password changed successfully')
  }

  const handleViewInvoices = () => {
    setShowInvoiceList(true)
  }

  const handleCloseInvoiceList = () => {
    setShowInvoiceList(false)
  }

  const handleViewInvoiceDetail = (invoice) => {
    setSelectedInvoice(invoice)
    setShowInvoiceList(false)
    setShowInvoiceDetail(true)
  }

  const handleCloseInvoiceDetail = () => {
    setShowInvoiceDetail(false)
    setSelectedInvoice(null)
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      PENDING: { text: 'Pending', class: 'pending', icon: '' },
      CONFIRMED: { text: 'Confirmed', class: 'confirmed', icon: '' },
      COMPLETED: { text: 'Completed', class: 'completed', icon: '' },
      CANCELLED: { text: 'Cancelled', class: 'cancelled', icon: '' },
      IN_PROGRESS: { text: 'In Progress', class: 'in-progress', icon: '' },
      WAITING_FOR_APPROVAL: { text: 'Waiting for Approval', class: 'waiting', icon: '' },
      CUSTOMER_APPROVED: { text: 'Customer Approved', class: 'approved', icon: '' } 
    }
    return statusMap[status] || statusMap.PENDING
  }

  const handleSidebarNavigate = (section) => {
    setActiveSection(section);
  };
  const handleSidebarEditProfile = () => setShowEditProfile(true);
  const handleSidebarChangePassword = () => setShowChangePassword(true);
  const handleSidebarSupportChat = () => {
    clearUnreadCount();
    navigate('/customer/chat');
  };
  const handleSidebarLogout = () => {
    authService.logout();
    window.location.reload();
  };

  if (!customer) {
    return <div className="loading">Loading...</div>
  }

  const customerName = customer?.fullName || 'User';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f6fa' }}>
      <CustomerSidebar
        active={true}
        activeSection={activeSection}
        onNavigate={handleSidebarNavigate}
        onEditProfile={handleSidebarEditProfile}
        onChangePassword={handleSidebarChangePassword}
        onSupportChat={handleSidebarSupportChat}
        onLogout={handleSidebarLogout}
        greeting={`Hello ${customerName}, How's your day?`}
        unreadCount={unreadCount}
      />
      <main style={{ flex: 1, marginLeft: SIDEBAR_WIDTH, padding: '32px 24px 24px 24px', maxWidth: '1800px' }}>
        <div className="customer-dashboard-content-bg">
          <div className="customer-dashboard">
            {/* Welcome Header */}
            <div className="customer-welcome-banner">
              <div className="customer-details">
                <h1>Welcome back, {customer.fullName}!</h1>
                <p>Ready to take care of your electric vehicle today?</p>
                <div className="customer-meta">
                  <span>Member since {new Date(customer.joinDate).getFullYear()}</span>
                  <span>•</span>
                  <span>Customer ID: #{customer.id}</span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="quick-stats">
              <div className="customer-dashboard-stat-card" onClick={() => setActiveSection('your-vehicle')} style={{ cursor: 'pointer' }}>
                <span className="stat-number">{vehicles.length}</span>
                <span className="stat-label">Your Vehicles</span>
              </div>
              <div className="customer-dashboard-stat-card stat-appointments" onClick={() => setActiveSection('appointment')} style={{ cursor: 'pointer' }}>
                <span className="stat-number">
                  {recentAppointments.filter(a => a.status === 'PENDING' || a.status === 'CONFIRMED').length}
                </span>
                <span className="stat-label">Upcoming Appointments</span>
              </div>
              <div className="customer-dashboard-stat-card" onClick={() => setActiveSection('appointment')} style={{ cursor: 'pointer' }}>
                <span className="stat-number">{recentAppointments.filter(a => a.status === 'COMPLETED').length}</span>
                <span className="stat-label">Completed Services</span>
              </div>
              <div className="customer-dashboard-stat-card" onClick={() => setActiveSection('invoice')} style={{ cursor: 'pointer' }}>
                <span className="stat-number">{invoices.length}</span>
                <span className="stat-label">Invoices</span>
                <div className="stat-badge">
                  {invoices.filter(i => i.status === 'UNPAID').length > 0 && (
                    <span className="unpaid-invoice-badge-custom">{invoices.filter(i => i.status === 'UNPAID').length} not paid yet</span>
                  )}
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="dashboard-content">
              {/* Vehicles Section */}
              {activeSection === 'your-vehicle' && (
              <div className="section vehicles-section" id="your-electric-vehicles">
                <div className="vehicles-header-black">
                  <h2>Your Electric Vehicles</h2>
                </div>
                <div className="vehicles-content">
                  <div className="vehicles-grid">
                    {vehicles.length === 0 ? (
                      <div className="no-vehicles">
                        <p>You haven't added any vehicles yet.</p>
                      </div>
                    ) : (
                    vehicles.map(vehicle => {
                      const model = getVehicleModel(vehicle.modelId)
                      return (
                        <div key={vehicle.id} className="vehicle-card">
                          <div className="vehicle-header">
                            <h3>{model?.name || 'Unknown Model'}</h3>
                            <span className="vehicle-year">{model?.modelYear || 'N/A'}</span>
                          </div>
                          <div className="vehicle-details">
                            <div className="detail-item">
                              <span className="label">License Plate:</span>
                              <span className="value">{vehicle.licensePlate}</span>
                            </div>
                            <div className="detail-item">
                              <span className="label">VIN:</span>
                              <span className="value">{vehicle.vin}</span>
                            </div>
                            <div className="detail-item">
                              <span className="label">Mileage:</span>
                              <span className="value">{parseInt(vehicle.currentKm).toLocaleString()} km</span>
                            </div>
                            <div className="detail-item">
                              <span className="label">Basic Maintenance:</span>
                              <span className="value">{model?.basicMaintenance || 'N/A'} km</span>
                            </div>
                          </div>
                          <div className="vehicle-actions">
                            <button 
                              className="action-btn primary"
                              onClick={() => handleBookMaintenance(vehicle)}
                            >
                              Book Maintenance
                            </button>
                            <button 
                              className="action-btn danger" 
                              onClick={() => handleDeleteVehicle(vehicle.id, vehicle.licensePlate)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      )
                    })
                  )}
                  </div>
                </div>
              </div>
              )}

              {/* Invoice Section */}
              {activeSection === 'invoice' && (
              <div className="section invoice-section" id="customer-invoice-section">
                {/* Invoice Header */}
                <div className="customer-invoice-header">
                  <h1 style={{ color: '#fff', fontWeight: 800, fontSize: '2.4rem', margin: 0 }}>Invoices</h1>
                  <button className="view-all-invoices-btn" onClick={handleViewInvoices}>View All</button>
                </div>
                <div className="invoices-list">
                  {invoices.length === 0 ? (
                    <div className="no-invoices">
                      <p>You have no invoices.</p>
                    </div>
                  ) : (
                    invoices.slice(0, 3).map(invoice => {
                      const statusInfo = invoice.status === 'PAID' 
                        ? { text: 'Paid', class: 'paid', icon: '✅' }
                        : { text: 'Unpaid', class: 'unpaid', icon: '⏳' }
                    
                      const maintenanceRecord = invoice.maintenanceRecord
                    
                      return (
                        <div 
                          key={invoice.id} 
                          className="invoice-card"
                          onClick={() => handleViewInvoiceDetail(invoice)}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="invoice-header">
                            <div className="invoice-id">
                              <span className="label">Invoice ID:</span>
                              <span className="value">#{invoice.id}</span>
                            </div>
                            <span className={`status-badge ${statusInfo.class}`}>
                              {statusInfo.icon} {statusInfo.text}
                            </span>
                          </div>
                          <div className="invoice-details">
                            <div className="invoice-info">
                              <span className="info-label">Vehicle:</span>
                              <span className="info-value">
                                {maintenanceRecord?.vehicleModel} - {maintenanceRecord?.vehicleLicensePlate}
                              </span>
                            </div>
                            <div className="invoice-info">
                              <span className="info-label">Service Center:</span>
                              <span className="info-value">{invoice.serviceCenterName}</span>
                            </div>
                            {maintenanceRecord?.servicePackageName && (
                              <div className="invoice-info">
                                <span className="info-label">Service Package:</span>
                                <span className="info-value">{maintenanceRecord.servicePackageName}</span>
                              </div>
                            )}
                            <div className="invoice-info">
                              <span className="info-label">Created Date:</span>
                              <span className="info-value">
                                {new Date(invoice.createdAt).toLocaleDateString('vi-VN')}
                              </span>
                            </div>
                          </div>
                          <div className="invoice-footer">
                            <span className="total-label">Total Amount:</span>
                            <span className="total-amount">{formatCurrency(invoice.totalAmount)}</span>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
              )}

              {/* View All Appointments Section */}
              {activeSection === 'appointment' && (
              <div className="section vehicles-section" id="view-all-appointments">
                <div className="vehicles-header-black" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2>Recent Appointments</h2>
                  <button 
                    className="view-all-appointments-btn"
                    onClick={handleViewAllAppointments}
                  >
                    View All
                  </button>
                </div>
                <div className="appointments-list">
                  {recentAppointments.length === 0 ? (
                    <div className="no-appointments">
                      <p>You don't have any appointments yet.</p>
                      <p>Book your first maintenance service now!</p>
                    </div>
                  ) : (
                    recentAppointments.slice(0, 5).map(appointment => {
                      const statusInfo = getStatusBadge(appointment.status)
                    
                      // Format date and time from appointmentDate
                      const appointmentDateTime = new Date(appointment.appointmentDate)
                      const dateStr = appointmentDateTime.toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })
                      const timeStr = appointmentDateTime.toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        hour12: true
                      })
                    
                      return (
                        <div 
                          key={appointment.id} 
                          className="appointment-card"
                          onClick={() => handleViewAppointment(appointment)}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="appointment-date">
                            <span className="date">{dateStr}</span>
                            <span className="time">{timeStr}</span>
                          </div>
                          <div className="appointment-details">
                            <h4>
                              {appointment.servicePackageName || 'Maintenance Service'}
                              {appointment.serviceItems && appointment.serviceItems.length > 0 && 
                                ` + ${appointment.serviceItems.length} service(s)`}
                            </h4>
                            <p>{appointment.vehicleModel} - {appointment.vehicleLicensePlate}</p>
                            <p>Technician: {appointment.technicianName || 'Not assigned yet'}</p>
                          </div>
                          <div className="appointment-status">
                            <span className={`status-badge ${statusInfo.class}`}>
                              {statusInfo.icon} {statusInfo.text}
                            </span>
                            <span className="price">{formatCurrency(appointment.estimatedCost)}</span>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
              )}
            </div>

            {/* Book Maintenance Modal */}
            {showBookMaintenance && selectedVehicle && (
              <BookMaintenance
                vehicle={selectedVehicle}
                vehicleModel={getVehicleModel(selectedVehicle.modelId)}
                onClose={handleCloseBookMaintenance}
                onAppointmentCreated={handleAppointmentCreated}
              />
            )}

            {/* Appointment Detail Modal */}
            {showAppointmentDetail && selectedAppointment && (
              <AppointmentDetail
                appointment={selectedAppointment}
                onClose={handleCloseAppointmentDetail}
                onAppointmentUpdated={loadAppointments}
              />
            )}

            {/* All Appointments Modal */}
            {showAllAppointments && (
              <AllAppointments
                appointments={recentAppointments}
                onClose={handleCloseAllAppointments}
                onViewDetail={handleViewDetailFromAll}
              />
            )}

            {/* Edit Profile Modal */}
            {showEditProfile && (
              <EditProfile
                onClose={handleCloseEditProfile}
                onProfileUpdated={handleProfileUpdated}
              />
            )}

            {/* Change Password Modal */}
            {showChangePassword && (
              <ChangePassword
                onClose={handleCloseChangePassword}
                onPasswordChanged={handlePasswordChanged}
              />
            )}

            {/* Invoice List Modal */}
            {showInvoiceList && (
              <InvoiceList
                invoices={invoices}
                onClose={handleCloseInvoiceList}
                onViewDetail={handleViewInvoiceDetail}
              />
            )}

            {/* Invoice Detail Modal */}
            {showInvoiceDetail && selectedInvoice && (
              <CustomerInvoiceDetail
                invoice={selectedInvoice}
                onClose={handleCloseInvoiceDetail}
              />
            )}

          </div>
        </div>
      </main>
    </div>
  )
}

const CustomerDashboard = () => {
  const [customer, setCustomer] = useState(null)
  const [userId, setUserId] = useState(null)

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userResult = await customerService.getMyInfo()
        if (userResult.success) {
          setCustomer(userResult.data)
          setUserId(userResult.data.id)
        }
      } catch (error) {
        logger.error('Error loading user:', error)
      }
    }
    loadUser()
  }, [])

  if (!userId) {
    return <div className="loading">Loading...</div>
  }

  return (
    <ChatProvider userRole="ROLE_CUSTOMER" userId={userId}>
      <CustomerDashboardContent />
    </ChatProvider>
  )
}

export default CustomerDashboard