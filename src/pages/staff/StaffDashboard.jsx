// Staff Sidebar (no nav buttons yet)
const StaffSidebar = ({ sidebarTab, setSidebarTab, navigate, unreadCount = 0, clearUnreadCount = () => {} }) => (
  <aside className="staff-sidebar">
    <div className="sidebar-header">
      <h2>ElectricCare Staff</h2>
      <p className="sidebar-desc"></p>
    </div>
    <div className="sidebar-section">
      <nav className="sidebar-tabs">
        <button
          className={`sidebar-tab${
            sidebarTab === "walk-in" ? " active" : ""
          }`}
          onClick={() => setSidebarTab("walk-in")}
        >
          Customers
        </button>
        <button
          className={`sidebar-tab${
            sidebarTab === "appointments" ? " active" : ""
          }`}
          onClick={() => setSidebarTab("appointments")}
        >
          Appointments
        </button>
        <button
          className={`sidebar-tab${
            sidebarTab === "invoices" ? " active" : ""
          }`}
          onClick={() => setSidebarTab("invoices")}
        >
          Invoices & Payment
        </button>
        <button
          className="sidebar-tab chat-tab"
          onClick={() => {
            clearUnreadCount()
            navigate('/staff/chat')
          }}
        >
           Support Chat
          {unreadCount > 0 && (
            <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
          )}
        </button>
      </nav>
    </div>
  </aside>
);
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import InvoiceDetailModal from "../admin/components/InvoiceDetailModal";
import appointmentService from "../../api/appointmentService";
import technicianService from "../../api/technicianService";
import customerService from "../../api/customerService";
import vehicleService from "../../api/vehicleService";
import logger from "../../utils/logger";
import "../../styles/StaffDashboard.css";
import authService from "../../api/authService";
import invoiceService from "../../api/invoiceService";
import { ChatProvider, useChatNotifications } from "../../contexts/ChatContext";

const StaffDashboardContent = () => {
  const navigate = useNavigate();
  const { unreadCount, clearUnreadCount } = useChatNotifications();
  const [appointments, setAppointments] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [vehicleModels, setVehicleModels] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assignLoading, setAssignLoading] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTechnician, setSelectedTechnician] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [staffName, setStaffName] = useState("");

  // Modal states for new workflows
  const [showCreateCustomerModal, setShowCreateCustomerModal] = useState(false);
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [showServiceRecommendationModal, setShowServiceRecommendationModal] =
    useState(false);
  const [showAdditionalServiceModal, setShowAdditionalServiceModal] =
    useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showInvoiceDetailModal, setShowInvoiceDetailModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [sidebarTab, setSidebarTab] = useState("appointments"); // appointments, walk-ins, invoices
  const [invoiceAppointmentId, setInvoiceAppointmentId] = useState(null);
  const [invoiceFilterStatus, setInvoiceFilterStatus] = useState("ALL"); // Filter for invoices: ALL, PAID, UNPAID

  // Approval state for service items
  const [serviceItemApprovals, setServiceItemApprovals] = useState({}); // { [detailId]: boolean }
  const [approvingItems, setApprovingItems] = useState(false);

  // Pagination and search for customers
  const [customerSearchTerm, setCustomerSearchTerm] = useState("");
  const [customerCurrentPage, setCustomerCurrentPage] = useState(1);
  const [customersPerPage] = useState(10);

  // Form states
  const [customerForm, setCustomerForm] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    gender: "MALE",
  });
  const [vehicleForm, setVehicleForm] = useState({
    customerId: "",
    customerUsername: "",
    customerName: "",
    vinNumber: "",
    licensePlate: "",
    model: "",
    currentKilometers: "",
    purchaseYear: "",
  });
  const [selectedVehicleForService, setSelectedVehicleForService] =
    useState(null);
  const [recommendedServices, setRecommendedServices] = useState([]);
  const [additionalServices, setAdditionalServices] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Get staff name from localStorage
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      setStaffName(user.fullName || "Staff");

      const [
        appointmentsResult,
        techniciansResult,
        customersResult,
        vehicleModelsResult,
        invoicesResult,
      ] = await Promise.all([
        appointmentService.getAllAppointments(),
        technicianService.getAllTechnicians(),
        customerService.getAllCustomers(),
        vehicleService.getAllVehicleModels(),
        invoiceService.getAllInvoices(),
      ]);

      if (appointmentsResult.success) {
        const appointmentsData = appointmentsResult.data || [];
        if (appointmentsData.length > 0) {
          logger.log("Sample appointment data:", appointmentsData[0]);
        }
        setAppointments(appointmentsData);
      } else {
        logger.error(
          "Failed to fetch appointments:",
          appointmentsResult.message
        );
      }

      if (techniciansResult.success) {
        setTechnicians(techniciansResult.data || []);
      } else {
        logger.error("Failed to fetch technicians:", techniciansResult.message);
      }

      if (customersResult.success) {
        setCustomers(customersResult.data || []);
      } else {
        logger.error("Failed to fetch customers:", customersResult.message);
      }

      if (vehicleModelsResult.success) {
        setVehicleModels(vehicleModelsResult.data || []);
      } else {
        logger.error(
          "Failed to fetch vehicle models:",
          vehicleModelsResult.message
        );
      }

      if (invoicesResult.success) {
        setInvoices(invoicesResult.data || []);
        logger.log("Invoices fetched:", invoicesResult.data?.length || 0);
      } else {
        logger.error("Failed to fetch invoices:", invoicesResult.message);
      }
    } catch (error) {
      logger.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // ===== NEW WORKFLOW FUNCTIONS =====

  // Step 1: Create customer account (walk-in customer)
  const handleCreateCustomer = async (e) => {
    e.preventDefault();

    if (
      !customerForm.fullName ||
      !customerForm.phoneNumber ||
      !customerForm.email
    ) {
      alert("Please fill in all customer information!");
      return;
    }

    try {
      // Create customer account using register API from authService
      const registerData = {
        username: customerForm.phoneNumber, // Phone number as username
        password: customerForm.phoneNumber, // Default password = phone number
        fullName: customerForm.fullName,
        email: customerForm.email,
        phone: customerForm.phoneNumber,
        gender: customerForm.gender,
      };

      const result = await authService.register(registerData);

      if (result.success) {
        alert(
          `Account created successfully!\nUsername: ${customerForm.phoneNumber}\nPassword: ${customerForm.phoneNumber}\n\nPlease inform the customer.`
        );
        setShowCreateCustomerModal(false);
        setCustomerForm({
          fullName: "",
          phoneNumber: "",
          email: "",
          gender: "MALE",
        });
        fetchData();
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      logger.error("Error creating customer:", error);
      alert("An error occurred while creating account!");
    }
  };

  // Function to find customer by username
  const handleCustomerUsernameChange = async (username) => {
    setVehicleForm({
      ...vehicleForm,
      customerUsername: username,
      customerName: "",
      customerId: "",
    });

    if (username.trim() === "") {
      return;
    }

    // Find customer by username
    const foundCustomer = customers.find((c) => c.username === username.trim());

    if (foundCustomer) {
      setVehicleForm({
        ...vehicleForm,
        customerUsername: username,
        customerName: foundCustomer.fullName,
        customerId: foundCustomer.customerId || foundCustomer.id,
      });
    }
  };

  // Step 2: Add vehicle for customer (Staff only)
  const handleAddVehicle = async (e) => {
    e.preventDefault();

    if (
      !vehicleForm.customerId ||
      !vehicleForm.vinNumber ||
      !vehicleForm.licensePlate ||
      !vehicleForm.model
    ) {
      alert("Please fill in all vehicle information!");
      return;
    }

    try {
      // Format request body according to API requirements
      const vehicleData = {
        licensePlate: vehicleForm.licensePlate,
        vin: vehicleForm.vinNumber,
        currentKm: parseInt(vehicleForm.currentKilometers) || 0,
        purchaseYear: vehicleForm.purchaseYear,
        modelId: parseInt(vehicleForm.model), // model ID from select box
        customerId: parseInt(vehicleForm.customerId),
      };

      const result = await vehicleService.createVehicle(vehicleData);

      if (result.success) {
        alert("Vehicle added successfully!");

        // Fetch service recommendations based on km/time
        const vehicleId = result.data.id || result.data.vehicleId;
        if (vehicleId) {
          await fetchServiceRecommendations(vehicleId);
        }

        setShowAddVehicleModal(false);
        setVehicleForm({
          customerId: "",
          customerUsername: "",
          customerName: "",
          vinNumber: "",
          licensePlate: "",
          model: "",
          currentKilometers: "",
          purchaseYear: "",
        });
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      logger.error("Error adding vehicle:", error);
      alert("An error occurred while adding vehicle!");
    }
  };

  // Step 3: Fetch service recommendations
  const fetchServiceRecommendations = async (vehicleId) => {
    try {
      const result = await vehicleService.getServiceRecommendations(vehicleId);

      if (result.success) {
        setRecommendedServices(result.data);
        setSelectedVehicleForService(vehicleId);
        setShowServiceRecommendationModal(true);
      } else {
        alert("No service package recommendations available for this vehicle.");
      }
    } catch (error) {
      logger.error("Error fetching recommendations:", error);
    }
  };

  // Step 4: Confirm service package
  const handleConfirmServicePackage = async () => {
    if (!selectedVehicleForService) return;

    try {
      // Notify customer to login and confirm booking
      alert(
        `Please contact customer:\n\n"Based on your vehicle's mileage/purchase time, we recommend the displayed service package. Please login to the system to confirm your maintenance appointment."\n\nUsername: [customer phone number]`
      );

      setShowServiceRecommendationModal(false);
      setRecommendedServices([]);
      setSelectedVehicleForService(null);
    } catch (error) {
      logger.error("Error confirming service:", error);
    }
  };

  // Step 5: Assign technician to appointment
  const handleAssignClick = (appointment) => {
    logger.log("Selected appointment:", appointment);
    setSelectedAppointment(appointment);
    setSelectedTechnician("");
    setShowAssignModal(true);
  };

  const formatCurrency = (amount) => {
    if (!amount) return "0 VND";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };
  const handleAssignSubmit = async () => {
    if (!selectedTechnician) {
      alert("Please select a technician!");
      return;
    }

    const appointmentId =
      selectedAppointment.appointmentId ||
      selectedAppointment.id ||
      selectedAppointment.appointmentID;

    if (!appointmentId) {
      logger.error("Appointment ID not found:", selectedAppointment);
      alert("Error: Appointment ID not found");
      return;
    }

    logger.log("Assigning technician:", {
      appointmentId,
      technicianId: selectedTechnician,
    });

    setAssignLoading(true);
    try {
      const result = await technicianService.assignTechnicianToAppointment(
        appointmentId,
        selectedTechnician
      );

      if (result.success) {
        alert(
          "Technician assigned successfully!\nThe system will notify the technician and customer."
        );
        setShowAssignModal(false);
        fetchData();
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      logger.error("Error assigning technician:", error);
      alert("An error occurred while assigning technician!");
    } finally {
      setAssignLoading(false);
    }
  };

  // View appointment details
  const handleViewDetails = async (appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailModal(true);

    // If appointment is WAITING_FOR_APPROVAL, fetch detailed service items with technician notes
    if (appointment.status === "WAITING_FOR_APPROVAL") {
      try {
        const result = await appointmentService.getAppointmentDetails(
          appointment.id
        );
        if (result.success) {
          // Store the detailed service items in the appointment object
          setSelectedAppointment({
            ...appointment,
            detailedServiceItems: result.data,
          });

          // Initialize approval state - default all customerApproved=true items to checked
          const initialApprovals = {};
          result.data.forEach((item) => {
            initialApprovals[item.id] = item.customerApproved;
          });
          setServiceItemApprovals(initialApprovals);
        } else {
          logger.error("Failed to fetch appointment details:", result.message);
        }
      } catch (error) {
        logger.error("Error fetching appointment details:", error);
      }
    }
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedAppointment(null);
    setServiceItemApprovals({}); // Reset approvals
  };

  // Toggle service item approval
  const handleToggleServiceItemApproval = (detailId) => {
    setServiceItemApprovals((prev) => ({
      ...prev,
      [detailId]: !prev[detailId],
    }));
  };

  // Submit service item approvals
  const handleSubmitApprovals = async () => {
    if (!selectedAppointment) return;

    setApprovingItems(true);
    try {
      // Build approval items array
      const approvalItems = selectedAppointment.detailedServiceItems.map(
        (item) => ({
          appointmentServiceDetailId: item.id,
          approved: serviceItemApprovals[item.id] || false,
        })
      );

      const result = await appointmentService.approveServiceItems(
        selectedAppointment.id,
        approvalItems
      );

      if (result.success) {
        alert("✅ Service approval status updated successfully!");
        handleCloseDetailModal();
        // Refresh appointments list
        fetchData();
      } else {
        alert("❌ Error: " + result.message);
      }
    } catch (error) {
      logger.error("Error submitting approvals:", error);
      alert("❌ An error occurred while approving services");
    } finally {
      setApprovingItems(false);
    }
  };

  // Step 6: Handle INCOMPLETED appointments (need additional services)
  const handleIncompletedAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    // Fetch additional services needed for this appointment
    // This would typically come from technician's notes
    setAdditionalServices([
      { name: "Replace brake", price: 500000 },
      { name: "Replace tire", price: 1200000 },
    ]);
    setShowAdditionalServiceModal(true);
  };

  const handleConfirmAdditionalServices = async (approved) => {
    const appointmentId =
      selectedAppointment.appointmentId ||
      selectedAppointment.id ||
      selectedAppointment.appointmentID;

    if (!approved) {
      // Customer declined additional services
      try {
        const result = await appointmentService.updateAppointmentStatus(
          appointmentId,
          "COMPLETED"
        );

        if (result.success) {
          alert("Appointment status updated to COMPLETED.");
          setShowAdditionalServiceModal(false);
          fetchData();
        }
      } catch (error) {
        logger.error("Error updating status:", error);
      }
    } else {
      // Customer approved - create ticket for technician
      try {
        const result = await technicianService.createAdditionalServiceTicket({
          appointmentId: appointmentId,
          technicianId: selectedAppointment.technicianId,
          services: additionalServices,
        });

        if (result.success) {
          alert("Ticket created for technician to perform additional services.");
          setShowAdditionalServiceModal(false);
          fetchData();
        } else {
          alert(`Error: ${result.message}`);
        }
      } catch (error) {
        logger.error("Error creating ticket:", error);
        alert("An error occurred while creating ticket!");
      }
    }
  };

  // Step 7: Generate invoice for completed appointment
  const handleGenerateInvoice = (appointment) => {
    const appointmentId =
      appointment.appointmentId || appointment.id || appointment.appointmentID;

    setInvoiceAppointmentId(appointmentId);
    setShowInvoiceModal(true);
  };

  const handleInvoiceSuccess = (invoiceData) => {
    logger.log("Invoice generated successfully:", invoiceData);
    setShowInvoiceModal(false);
    setInvoiceAppointmentId(null);
    fetchData(); // Refresh the appointments list
  };

  const handleCloseInvoiceModal = () => {
    setShowInvoiceModal(false);
    setInvoiceAppointmentId(null);
  };

  const handleViewInvoiceDetail = async (invoiceId) => {
    try {
      const result = await invoiceService.getInvoiceById(invoiceId);
      if (result.success) {
        logger.log("Invoice details:", result.data);
        setSelectedInvoice(result.data);
        setShowInvoiceDetailModal(true);
      } else {
        alert("Unable to load invoice information!");
      }
    } catch (error) {
      logger.error("Error viewing invoice:", error);
      alert("An error occurred while viewing invoice!");
    }
  };

  const handleCloseInvoiceDetailModal = () => {
    setShowInvoiceDetailModal(false);
    setSelectedInvoice(null);
  };

  const formatTimeFromDate = (dateString) => {
    if (!dateString) return "N/A";
    // Extract time from ISO format "2025-11-01T14:36:00"
    const timePart = dateString.split("T")[1];
    return timePart.substring(0, 5); // HH:mm (14:36)
  };

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      PENDING: "status-pending",
      CONFIRMED: "status-confirmed",
      INCOMPLETED: "status-incompleted",
      COMPLETED: "status-completed",
      CANCELLED: "status-cancelled",
    };
    return statusMap[status] || "status-default";
  };

  const getStatusText = (status) => {
    const statusTextMap = {
      PENDING: "Pending",
      CONFIRMED: "Confirmed",
      INCOMPLETED: "Incomplete",
      COMPLETED: "Completed",
      CANCELLED: "Cancelled",
      WAITING_FOR_APPROVAL: "Awaiting Approval",
    };
    return statusTextMap[status] || status;
  };

  const getInvoiceStatusBadgeClass = (status) => {
    const statusMap = {
      UNPAID: "invoice-status-pending",
      PAID: "invoice-status-paid",
      CANCELLED: "invoice-status-cancelled",
      REFUNDED: "invoice-status-refunded",
    };
    return statusMap[status] || "invoice-status-default";
  };

  const getInvoiceStatusText = (status) => {
    const statusTextMap = {
      UNPAID: "Pending Payment",
      PAID: "Paid",
      CANCELLED: "Cancelled",
      REFUNDED: "Refunded",
    };
    return statusTextMap[status] || status;
  };

  const filteredAppointments = appointments.filter((appointment) => {
    const matchesStatus =
      filterStatus === "ALL" || appointment.status === filterStatus;
    const appointmentId =
      appointment.appointmentId || appointment.id || appointment.appointmentID;
    const matchesSearch =
      appointment.customerName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      appointment.vehiclePlate
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      appointmentId?.toString().includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

  // Filter and paginate customers
  const filteredCustomers = customers.filter((customer) => {
    const customerId = customer.customerId || customer.id;
    const matchesSearch =
      customerId?.toString().includes(customerSearchTerm) ||
      customer.phone?.toLowerCase().includes(customerSearchTerm.toLowerCase());
    return matchesSearch;
  });

  // Calculate pagination for customers
  const indexOfLastCustomer = customerCurrentPage * customersPerPage;
  const indexOfFirstCustomer = indexOfLastCustomer - customersPerPage;
  const currentCustomers = filteredCustomers.slice(indexOfFirstCustomer, indexOfLastCustomer);
  const totalCustomerPages = Math.ceil(filteredCustomers.length / customersPerPage);

  const handleCustomerPageChange = (pageNumber) => {
    setCustomerCurrentPage(pageNumber);
  };

  const handleCustomerSearchChange = (searchValue) => {
    setCustomerSearchTerm(searchValue);
    setCustomerCurrentPage(1); // Reset to first page when searching
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      authService.logout();
    }
  };

  if (loading) {
    return (
      <div className="staff-dashboard">
        {/* Header removed as requested */}
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading data...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="staff-dashboard">
      <StaffSidebar 
        sidebarTab={sidebarTab} 
        setSidebarTab={setSidebarTab} 
        navigate={navigate} 
        unreadCount={unreadCount}
        clearUnreadCount={clearUnreadCount}
      />
      {/* Header removed as requested */}
      <div className="staff-container">
        <div className="staff-header">
          <div className="header-content">
            <h1> Staff Dashboard - Maintenance Management</h1>
            <p>Manage walk-in customers, vehicles, appointments and invoices</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <span style={{ color: "#ffffff", fontSize: "0.95rem" }}>
              Hi {staffName}, Hope you find your day!
            </span>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>

        {/* Tabs navigation removed, now handled by sidebar */}

        {/* TAB: WALK-IN CUSTOMERS */}
        {sidebarTab === "walk-in" && (
          <div className="walk-in-section">
            <div className="section-header">
              <h2>Customer Management</h2>
              <p>
                Walk-in customers at the center, record information and create
                accounts
              </p>
            </div>

            <div className="action-buttons">
              <button
                className="primary-btn"
                onClick={() => setShowCreateCustomerModal(true)}
              >
                Create Customer Account
              </button>
              <button
                className="secondary-btn"
                onClick={() => setShowAddVehicleModal(true)}
              >
                Add Vehicle for Customer
              </button>
            </div>

            <div className="info-card">
              <h3> Walk-in Customer Reception Process:</h3>
              <ol>
                <li>
                  <strong>Record information:</strong> Full name, Phone number,
                  Email, Gender
                </li>
                <li>
                  <strong>Create account:</strong> Username = Phone number,
                  Password = Phone number
                </li>
                <li>
                  <strong>Check vehicle:</strong> VIN number, License plate, Current km,
                  Vehicle documents
                </li>
                <li>
                  <strong>Add vehicle:</strong> Staff adds vehicle to customer
                  account
                </li>
                <li>
                  <strong>Service recommendation:</strong> System recommends service package
                  based on km/time
                </li>
                <li>
                  <strong>Contact customer:</strong> Notify customer to login and
                  confirm booking
                </li>
              </ol>
            </div>

            <div className="customers-list">
              <div className="customers-header">
                <h3>Customer List ({filteredCustomers.length})</h3>
                <div className="customer-search-box">
                  <input
                    type="text"
                    placeholder="Search by ID or phone number..."
                    value={customerSearchTerm}
                    onChange={(e) => handleCustomerSearchChange(e.target.value)}
                    className="search-input"
                  />
                </div>
              </div>
              
              {currentCustomers.length === 0 ? (
                <div className="no-data">
                  <p>No customers found</p>
                </div>
              ) : (
                <>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Full Name</th>
                        <th>Phone Number</th>
                        <th>Email</th>
                        <th>Created Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentCustomers.map((customer) => (
                        <tr key={customer.customerId || customer.id}>
                          <td>#{customer.customerId || customer.id}</td>
                          <td>{customer.fullName}</td>
                          <td>{customer.phone}</td>
                          <td>{customer.email}</td>
                          <td>
                            {customer.createdAt
                              ? new Date(customer.createdAt).toLocaleDateString(
                                  "vi-VN"
                                )
                              : "N/A"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {/* Pagination Controls */}
                  {totalCustomerPages > 1 && (
                    <div className="pagination-container">
                      <button
                        className="pagination-btn"
                        onClick={() => handleCustomerPageChange(customerCurrentPage - 1)}
                        disabled={customerCurrentPage === 1}
                      >
                        ← Previous
                      </button>
                      
                      <div className="pagination-info">
                        <span>
                          Page {customerCurrentPage} of {totalCustomerPages}
                        </span>
                        <span className="pagination-details">
                          Showing {indexOfFirstCustomer + 1} - {Math.min(indexOfLastCustomer, filteredCustomers.length)} of {filteredCustomers.length}
                        </span>
                      </div>
                      
                      <button
                        className="pagination-btn"
                        onClick={() => handleCustomerPageChange(customerCurrentPage + 1)}
                        disabled={customerCurrentPage === totalCustomerPages}
                      >
                        Next →
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* TAB: APPOINTMENTS MANAGEMENT */}
        {sidebarTab === "appointments" && (
          <>
            {/* Filters */}
            <div className="search-status-container">
              <div className="search-bar-row">
                <div className="search-box">
                  <input
                    type="text"
                    placeholder="Search by customer name, license plate, ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                </div>
              </div>
              <div className="status-row">
                <button
                  className={`status-btn ${filterStatus === "ALL" ? "active" : ""}`}
                  onClick={() => setFilterStatus("ALL")}
                >
                  All ({appointments.length})
                </button>
                <button
                  className={`status-btn ${filterStatus === "PENDING" ? "active" : ""}`}
                  onClick={() => setFilterStatus("PENDING")}
                >
                  Pending ({appointments.filter((a) => a.status === "PENDING").length})
                </button>
                <button
                  className={`status-btn ${filterStatus === "CONFIRMED" ? "active" : ""}`}
                  onClick={() => setFilterStatus("CONFIRMED")}
                >
                  Confirmed ({appointments.filter((a) => a.status === "CONFIRMED").length})
                </button>
                <button
                  className={`status-btn ${filterStatus === "IN_PROGRESS" ? "active" : ""}`}
                  onClick={() => setFilterStatus("IN_PROGRESS")}
                >
                  In Progress ({appointments.filter((a) => a.status === "IN_PROGRESS").length})
                </button>
                <button
                  className={`status-btn ${filterStatus === "COMPLETED" ? "active" : ""}`}
                  onClick={() => setFilterStatus("COMPLETED")}
                >
                  Completed ({appointments.filter((a) => a.status === "COMPLETED").length})
                </button>
                <button
                  className={`status-btn ${filterStatus === "CANCELLED" ? "active" : ""}`}
                  onClick={() => setFilterStatus("CANCELLED")}
                >
                  Cancelled ({appointments.filter((a) => a.status === "CANCELLED").length})
                </button>
              </div>
            </div>

            {/* Appointments Table */}
            <div className="appointments-table-container">
              {filteredAppointments.length === 0 ? (
                <div className="no-data">
                  <p>No appointments found</p>
                </div>
              ) : (
                <table className="appointments-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Customer</th>
                      <th>License Plate</th>
                      <th>Vehicle</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Service</th>
                      <th>Status</th>
                      <th>Technician</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAppointments.map((appointment) => {
                      const appointmentId =
                        appointment.appointmentId ||
                        appointment.id ||
                        appointment.appointmentID;
                      return (
                        <tr key={appointmentId}>
                          <td>#{appointmentId}</td>
                          <td>{appointment.customerName || "N/A"}</td>
                          <td>{appointment.vehicleLicensePlate || "N/A"}</td>
                          <td>{appointment.vehicleModel || "N/A"}</td>
                          <td>
                            {new Date(
                              appointment.appointmentDate
                            ).toLocaleDateString("vi-VN")}
                          </td>
                          <td>
                            {formatTimeFromDate(appointment.appointmentDate)}
                          </td>
                          <td>
                            <div className="service-info">
                              {appointment.servicePackageName || "Individual service"}
                            </div>
                          </td>
                          <td>
                            <span
                              className={`status-badge ${getStatusBadgeClass(
                                appointment.status
                              )}`}
                            >
                              {getStatusText(appointment.status)}
                            </span>
                          </td>
                          <td>
                            {appointment.technicianName ? (
                              <div className="technician-assigned">
                                {appointment.technicianName}
                              </div>
                            ) : (
                              <span className="no-technician">Not assigned</span>
                            )}
                          </td>
                          <td>
                            <div className="appointment-action-group">
                              <button
                                className="appointment-action-btn detail"
                                onClick={() => handleViewDetails(appointment)}
                                title="View details"
                              >
                                 Details
                              </button>
                              {appointment.status === "PENDING" && (
                                <button
                                  className="appointment-action-btn assign"
                                  onClick={() => handleAssignClick(appointment)}
                                >
                                  Assign Technician
                                </button>
                              )}
                              {appointment.status === "INCOMPLETED" && (
                                <button
                                  className="appointment-action-btn additional"
                                  onClick={() =>
                                    handleIncompletedAppointment(appointment)
                                  }
                                >
                                  Handle Additional
                                </button>
                              )}
                              {appointment.status === "COMPLETED" &&
                                !appointment.invoiceGenerated && (
                                  <button
                                    className="appointment-action-btn invoice"
                                    onClick={() =>
                                      handleGenerateInvoice(appointment)
                                    }
                                  >
                                    View Invoice
                                  </button>
                                )}
                            </div>
                          </td>
                        </tr>
                      );
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
                  <p>Total Appointments</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon"></div>
                <div className="stat-info">
                  <h3>
                    {appointments.filter((a) => a.status === "PENDING").length}
                  </h3>
                  <p>Pending</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon"></div>
                <div className="stat-info">
                  <h3>
                    {
                      appointments.filter((a) => a.status === "INCOMPLETED")
                        .length
                    }
                  </h3>
                  <p>Incomplete</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon"></div>
                <div className="stat-info">
                  <h3>
                    {
                      appointments.filter((a) => a.status === "COMPLETED")
                        .length
                    }
                  </h3>
                  <p>Completed</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon"></div>
                <div className="stat-info">
                  <h3>{technicians.length}</h3>
                  <p>Technicians</p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* TAB: INVOICES */}
        {sidebarTab === "invoices" && (
          <div className="invoices-section">
            <div className="section-header">
              <h2>Invoice Management</h2>
              <p>View and manage issued invoices</p>
            </div>

            <div className="invoices-stats">
              <div 
                className={`stat-card ${invoiceFilterStatus === "ALL" ? "active" : ""}`}
                onClick={() => setInvoiceFilterStatus("ALL")}
                style={{ cursor: "pointer" }}
              >
                <div className="stat-info">
                  <h3>{invoices.length}</h3>
                  <p>Total Invoices</p>
                </div>
              </div>
              <div 
                className={`stat-card ${invoiceFilterStatus === "PAID" ? "active" : ""}`}
                onClick={() => setInvoiceFilterStatus("PAID")}
                style={{ cursor: "pointer" }}
              >
                <div className="stat-info">
                  <h3>
                    {invoices.filter((inv) => inv.status === "PAID").length}
                  </h3>
                  <p>Paid</p>
                </div>
              </div>
              <div 
                className={`stat-card ${invoiceFilterStatus === "UNPAID" ? "active" : ""}`}
                onClick={() => setInvoiceFilterStatus("UNPAID")}
                style={{ cursor: "pointer" }}
              >
                <div className="stat-info">
                  <h3>
                    {invoices.filter((inv) => inv.status === "UNPAID").length}
                  </h3>
                  <p>Pending Payment</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-info">
                  <h3>
                    {formatCurrency(
                      invoices
                        .filter((inv) => inv.status === "PAID")
                        .reduce((sum, inv) => sum + (inv.totalAmount || 0), 0)
                    )}
                  </h3>
                  <p>Total Revenue</p>
                </div>
              </div>
            </div>

            <div className="invoices-table-container">
              {invoices.filter((inv) => 
                invoiceFilterStatus === "ALL" || inv.status === invoiceFilterStatus
              ).length === 0 ? (
                <div className="no-data">
                  <p>No invoices yet</p>
                </div>
              ) : (
                <table className="invoices-table">
                  <thead>
                    <tr>
                      <th>Invoice ID</th>
                      <th>Appointment ID</th>
                      <th>Customer</th>
                      <th>License Plate</th>
                      <th>Issue Date</th>
                      <th>Total Amount</th>
                      <th>Payment Method</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices
                      .filter((inv) => 
                        invoiceFilterStatus === "ALL" || inv.status === invoiceFilterStatus
                      )
                      .map((invoice) => (
                      <tr key={invoice.invoiceId || invoice.id}>
                        <td>#{invoice.invoiceId || invoice.id}</td>
                        <td>#{invoice.maintenanceRecord.appointmentId || "N/A"}</td>
                        <td>{invoice.maintenanceRecord.customerName || "N/A"}</td>
                        <td>{invoice.maintenanceRecord.vehicleLicensePlate || "N/A"}</td>
                        <td>
                          {invoice.createdAt
                            ? new Date(invoice.createdAt).toLocaleDateString(
                                "vi-VN"
                              )
                            : "N/A"}
                        </td>
                        <td className="price-cell">
                          <strong>{formatCurrency(invoice.totalAmount)}</strong>
                        </td>
                        <td>
                          VNPay
                        </td>
                        <td>
                          <span
                            className={`status-badge ${getInvoiceStatusBadgeClass(
                              invoice.status
                            )}`}
                          >
                            {getInvoiceStatusText(invoice.status)}
                          </span>
                        </td>
                        <td>
                          <button
                            className="appointment-action-btn detail"
                            onClick={() =>
                              handleViewInvoiceDetail(invoice.invoiceId || invoice.id)
                            }
                            title="View invoice details"
                          >
                            📄 Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>

      {/* MODAL: Create Customer */}
      {showCreateCustomerModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowCreateCustomerModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create Customer Account</h2>
              <button
                className="close-btn"
                onClick={() => setShowCreateCustomerModal(false)}
              >
                ×
              </button>
            </div>

            <form className="modal-body" onSubmit={handleCreateCustomer}>
              <div className="form-group">
                <label htmlFor="fullName">Full Name *</label>
                <input
                  type="text"
                  id="fullName"
                  value={customerForm.fullName}
                  onChange={(e) =>
                    setCustomerForm({
                      ...customerForm,
                      fullName: e.target.value,
                    })
                  }
                  placeholder="Nguyễn Văn A"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="phoneNumber">Phone Number *</label>
                <input
                  type="tel"
                  id="phoneNumber"
                  value={customerForm.phoneNumber}
                  onChange={(e) =>
                    setCustomerForm({
                      ...customerForm,
                      phoneNumber: e.target.value,
                    })
                  }
                  placeholder="0123456789"
                  required
                />
                <small>
                  Phone number will be used as Username and Password
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  value={customerForm.email}
                  onChange={(e) =>
                    setCustomerForm({ ...customerForm, email: e.target.value })
                  }
                  placeholder="email@example.com"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="gender">Gender *</label>
                <select
                  id="gender"
                  value={customerForm.gender}
                  onChange={(e) =>
                    setCustomerForm({ ...customerForm, gender: e.target.value })
                  }
                  required
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowCreateCustomerModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Add Vehicle */}
      {showAddVehicleModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowAddVehicleModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Vehicle for Customer</h2>
              <button
                className="close-btn"
                onClick={() => setShowAddVehicleModal(false)}
              >
                ×
              </button>
            </div>

            <form className="modal-body" onSubmit={handleAddVehicle}>
              <div className="form-group">
                <label htmlFor="customerUsername">Customer Username *</label>
                <input
                  type="text"
                  id="customerUsername"
                  value={vehicleForm.customerUsername}
                  onChange={(e) => handleCustomerUsernameChange(e.target.value)}
                  placeholder="Enter username (phone number)"
                  required
                />
                {vehicleForm.customerName && (
                  <div className="customer-found">
                    ✓ Customer: <strong>{vehicleForm.customerName}</strong>
                  </div>
                )}
                {vehicleForm.customerUsername && !vehicleForm.customerName && (
                  <div className="customer-not-found">
                    ⚠ Customer not found with this username
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="vinNumber">VIN Number *</label>
                <input
                  type="text"
                  id="vinNumber"
                  value={vehicleForm.vinNumber}
                  onChange={(e) =>
                    setVehicleForm({
                      ...vehicleForm,
                      vinNumber: e.target.value,
                    })
                  }
                  placeholder="VF12345678901234"
                  maxLength={17}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="licensePlate">License Plate *</label>
                <input
                  type="text"
                  id="licensePlate"
                  value={vehicleForm.licensePlate}
                  onChange={(e) =>
                    setVehicleForm({
                      ...vehicleForm,
                      licensePlate: e.target.value,
                    })
                  }
                  placeholder="29A-12345"
                  maxLength={10}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="model">Vehicle Model *</label>
                <select
                  id="model"
                  value={vehicleForm.model}
                  onChange={(e) =>
                    setVehicleForm({ ...vehicleForm, model: e.target.value })
                  }
                  required
                >
                  <option value="">-- Select vehicle model --</option>
                  {vehicleModels.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="currentKilometers">Current Kilometers *</label>
                <input
                  type="number"
                  id="currentKilometers"
                  value={vehicleForm.currentKilometers}
                  onChange={(e) =>
                    setVehicleForm({
                      ...vehicleForm,
                      currentKilometers: e.target.value,
                    })
                  }
                  placeholder="5000"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="purchaseYear">Purchase Date</label>
                <input
                  type="month"
                  id="purchaseYear"
                  value={vehicleForm.purchaseYear}
                  max={`${new Date().getFullYear()}-${String(
                    new Date().getMonth() + 1
                  ).padStart(2, "0")}`}
                  onChange={(e) =>
                    setVehicleForm({
                      ...vehicleForm,
                      purchaseYear: e.target.value,
                    })
                  }
                />
                <small className="field-hint">
                  Month and year of purchase (e.g.: 2025-11)
                </small>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowAddVehicleModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Add Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Service Recommendation */}
      {showServiceRecommendationModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowServiceRecommendationModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Recommended Service Package</h2>
              <button
                className="close-btn"
                onClick={() => setShowServiceRecommendationModal(false)}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <p>
                <strong>System recommends service package based on:</strong>
              </p>
              <ul>
                <li>Vehicle's current kilometers</li>
                <li>Time since last maintenance (or since purchase)</li>
              </ul>

              <div className="recommended-services">
                <h3>Service Packages:</h3>
                {recommendedServices.map((service, index) => (
                  <div key={index} className="service-item">
                    <h4>{service.name}</h4>
                    <p>{service.description}</p>
                    <p>
                      <strong>Price:</strong>{" "}
                      {service.price?.toLocaleString("vi-VN")} VNĐ
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="cancel-btn"
                onClick={() => setShowServiceRecommendationModal(false)}
              >
                Close
              </button>
              <button
                className="submit-btn"
                onClick={handleConfirmServicePackage}
              >
                Confirm & Notify Customer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Assign Technician */}
      {showAssignModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowAssignModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Assign Technician</h2>
              <button
                className="close-btn"
                onClick={() => setShowAssignModal(false)}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="appointment-info">
                <h3>Appointment Information</h3>
                <p>
                  <strong>ID:</strong> #
                  {selectedAppointment?.appointmentId ||
                    selectedAppointment?.id}
                </p>
                <p>
                  <strong>Customer:</strong>{" "}
                  {selectedAppointment?.customerName}
                </p>
                <p>
                  <strong>License Plate:</strong>{" "}
                  {selectedAppointment?.vehicleLicensePlate}
                </p>
                <p>
                  <strong>Vehicle:</strong>{" "}
                  {selectedAppointment?.vehicleModel || "N/A"}
                </p>
                <p>
                  <strong>Date:</strong>{" "}
                  {selectedAppointment?.appointmentDate
                    ? new Date(
                        selectedAppointment.appointmentDate
                      ).toLocaleDateString("vi-VN")
                    : "N/A"}
                </p>
              </div>

              <div className="technician-select">
                <label htmlFor="technician">Select Technician:</label>
                <select
                  id="technician"
                  value={selectedTechnician}
                  onChange={(e) => setSelectedTechnician(e.target.value)}
                >
                  <option value="">-- Select technician --</option>
                  {technicians.map((tech) => {
                    const techId = tech.technicianId || tech.id;
                    return (
                      <option key={techId} value={techId}>
                        {tech.fullName}
                      </option>
                    );
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
                Cancel
              </button>
              <button
                className="submit-btn"
                onClick={handleAssignSubmit}
                disabled={assignLoading || !selectedTechnician}
              >
                {assignLoading ? "Processing..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Additional Services */}
      {showAdditionalServiceModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowAdditionalServiceModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Handle Additional Services</h2>
              <button
                className="close-btn"
                onClick={() => setShowAdditionalServiceModal(false)}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <p>
                <strong>
                  Appointment #
                  {selectedAppointment?.appointmentId ||
                    selectedAppointment?.id}
                </strong>
              </p>
              <p>
                The technician has completed the basic procedures but discovered
                parts that need replacement:
              </p>

              <div className="additional-services-list">
                <h3>Additional Services Required:</h3>
                {additionalServices.map((service, index) => (
                  <div key={index} className="service-item">
                    <p>
                      <strong>{service.name}</strong>
                    </p>
                    <p>Price: {service.price?.toLocaleString("vi-VN")} VNĐ</p>
                  </div>
                ))}
              </div>

              <p>
                <strong>Please contact customer for confirmation:</strong>
              </p>
              <div className="contact-message">
                "Your vehicle has completed the necessary procedures. However,
                the technician noticed some parts that need replacement. Would
                you like us to replace them now? If yes, we will add the cost to
                the invoice."
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="cancel-btn"
                onClick={() => handleConfirmAdditionalServices(false)}
              >
                Customer Declined
              </button>
              <button
                className="submit-btn"
                onClick={() => handleConfirmAdditionalServices(true)}
              >
                Customer Agreed
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Appointment Detail */}
      {showDetailModal && selectedAppointment && (
        <div className="modal-overlay" onClick={handleCloseDetailModal}>
          <div
            className="modal-content detail-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>📋 Appointment Details</h2>
              <button className="close-btn" onClick={handleCloseDetailModal}>
                ×
              </button>
            </div>

            <div className="modal-body">
              {/* Appointment Information */}
              <div className="detail-section">
                <h3>Appointment Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Appointment ID:</label>
                    <span>
                      #
                      {selectedAppointment.id ||
                        selectedAppointment.appointmentId}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Status:</label>
                    <span
                      className={`status-badge ${getStatusBadgeClass(
                        selectedAppointment.status
                      )}`}
                    >
                      {getStatusText(selectedAppointment.status)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Appointment Date:</label>
                    <span>
                      {new Date(
                        selectedAppointment.appointmentDate
                      ).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Appointment Time:</label>
                    <span>
                      {formatTimeFromDate(selectedAppointment.appointmentDate)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div className="detail-section">
                <h3>Customer Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Customer Name:</label>
                    <span>{selectedAppointment.customerName || "N/A"}</span>
                  </div>
                  <div className="detail-item">
                    <label>Phone Number:</label>
                    <span>{selectedAppointment.customerPhone || "N/A"}</span>
                  </div>
                  <div className="detail-item">
                    <label>Email:</label>
                    <span>{selectedAppointment.customerEmail || "N/A"}</span>
                  </div>
                </div>
              </div>

              {/* Vehicle Information */}
              <div className="detail-section">
                <h3>Vehicle Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>License Plate:</label>
                    <span>
                      {selectedAppointment.vehicleLicensePlate || "N/A"}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Model:</label>
                    <span>{selectedAppointment.vehicleModel || "N/A"}</span>
                  </div>
                  <div className="detail-item">
                    <label>Manufacturer:</label>
                    <span>VinFast</span>
                  </div>
                </div>
              </div>

              {/* Service Information */}
              <div className="detail-section">
                <h3>Service Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Service Package:</label>
                    <span>
                      {selectedAppointment.servicePackageName || "N/A"}
                    </span>
                  </div>
                  {selectedAppointment.milestoneKm && (
                    <div className="detail-item">
                      <label>Milestone Km:</label>
                      <span>
                        {selectedAppointment.milestoneKm.toLocaleString(
                          "vi-VN"
                        )}{" "}
                        km
                      </span>
                    </div>
                  )}
                  <div className="detail-item">
                    <label>Estimated Cost:</label>
                    <span className="price-highlight">
                      {formatCurrency(selectedAppointment.estimatedCost)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Technician Information */}
              {selectedAppointment.technicianName && (
                <div className="detail-section">
                  <h3>Technician</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Technician Name:</label>
                      <span>👨‍🔧 {selectedAppointment.technicianName}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Service Center Information */}
              {selectedAppointment.nameCenter && (
                <div className="detail-section">
                  <h3>Service Center</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Center Name:</label>
                      <span>{selectedAppointment.nameCenter}</span>
                    </div>
                    <div className="detail-item">
                      <label>Address:</label>
                      <span>{selectedAppointment.addressCenter}</span>
                    </div>
                    {selectedAppointment.districtCenter && (
                      <div className="detail-item">
                        <label>District:</label>
                        <span>{selectedAppointment.districtCenter}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Service Items */}
              {selectedAppointment.serviceItems &&
                selectedAppointment.serviceItems.length > 0 && (
                  <div className="detail-section">
                    <h3>Service Items List</h3>
                    <div className="service-items-table">
                      <table>
                        <thead>
                          <tr>
                            <th>Service Name</th>
                            <th>Description</th>
                            <th>Type</th>
                            <th>Price</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedAppointment.serviceItems.map(
                            (item, index) => (
                              <tr key={index}>
                                <td>{item.serviceItem?.name || "N/A"}</td>
                                <td>
                                  <small>
                                    {item.serviceItem?.description || "N/A"}
                                  </small>
                                </td>
                                <td>
                                  <span
                                    className={`action-type-badge ${item.actionType?.toLowerCase()}`}
                                  >
                                    {item.actionType}
                                  </span>
                                </td>
                                <td className="price-cell">
                                  {formatCurrency(item.price)}
                                </td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

              {/* Detailed Service Items for WAITING_FOR_APPROVAL status */}
              {selectedAppointment.status === "WAITING_FOR_APPROVAL" &&
                selectedAppointment.detailedServiceItems &&
                selectedAppointment.detailedServiceItems.length > 0 && (
                  <div className="detail-section">
                    <h3>⚠️ Approve Additional Services</h3>
                    <p
                      style={{
                        marginBottom: "15px",
                        color: "#e67e22",
                        fontWeight: "600",
                      }}
                    >
                      The technician has proposed replacements for some items. Please
                      review and approve:
                    </p>
                    <div className="approval-items-container">
                      {selectedAppointment.detailedServiceItems
                        .filter((item) => item.technicianNotes) // Only show items with notes
                        .map((item) => (
                          <div
                            key={item.id}
                            className={`approval-item ${
                              item.actionType === "REPLACE"
                                ? "needs-approval"
                                : ""
                            }`}
                          >
                            <div className="approval-item-header">
                              <label className="approval-checkbox-label">
                                <input
                                  type="checkbox"
                                  checked={
                                    serviceItemApprovals[item.id] || false
                                  }
                                  onChange={() =>
                                    handleToggleServiceItemApproval(item.id)
                                  }
                                  className="approval-checkbox"
                                />
                                <span className="approval-item-name">
                                  {item.serviceItemName}
                                </span>
                              </label>
                              <div className="approval-item-badges">
                                <span
                                  className={`action-type-badge ${item.actionType?.toLowerCase()}`}
                                >
                                  {item.actionType}
                                </span>
                                <span className="approval-price">
                                  {formatCurrency(item.price)}
                                </span>
                              </div>
                            </div>
                            {item.technicianNotes && (
                              <div className="technician-notes">
                                <strong>📝 Technician notes:</strong>{" "}
                                {item.technicianNotes}
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                    <div className="approval-summary">
                      <p>
                        <strong>Total items to approve:</strong>{" "}
                        {
                          selectedAppointment.detailedServiceItems.filter(
                            (item) => item.technicianNotes
                          ).length
                        }{" "}
                        | <strong>Selected:</strong>{" "}
                        {
                          Object.values(serviceItemApprovals).filter(Boolean)
                            .length
                        }
                      </p>
                    </div>
                  </div>
                )}

              {/* Timestamps */}
              {(selectedAppointment.createdAt ||
                selectedAppointment.updatedAt) && (
                <div className="detail-section">
                  <h3>Timestamps</h3>
                  <div className="detail-grid">
                    {selectedAppointment.createdAt && (
                      <div className="detail-item">
                        <label>Created At:</label>
                        <span>
                          {new Date(
                            selectedAppointment.createdAt
                          ).toLocaleString("vi-VN")}
                        </span>
                      </div>
                    )}
                    {selectedAppointment.updatedAt && (
                      <div className="detail-item">
                        <label>Updated At:</label>
                        <span>
                          {new Date(
                            selectedAppointment.updatedAt
                          ).toLocaleString("vi-VN")}
                        </span>
                      </div>
                    )}
                    {selectedAppointment.createdBy && (
                      <div className="detail-item">
                        <label>Created By:</label>
                        <span>{selectedAppointment.createdBy}</span>
                      </div>
                    )}
                    {selectedAppointment.updatedBy && (
                      <div className="detail-item">
                        <label>Updated By:</label>
                        <span>{selectedAppointment.updatedBy}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              {selectedAppointment.status === "WAITING_FOR_APPROVAL" && (
                <button
                  className="approve-btn"
                  onClick={handleSubmitApprovals}
                  disabled={approvingItems}
                >
                  {approvingItems ? "Processing..." : "✅ Confirm Approval"}
                </button>
              )}
              <button className="cancel-btn" onClick={handleCloseDetailModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Detail Modal */}
      {showInvoiceModal && invoiceAppointmentId && (
        <InvoiceDetailModal
          appointmentId={invoiceAppointmentId}
          onClose={handleCloseInvoiceModal}
          onSuccess={handleInvoiceSuccess}
        />
      )}

      {/* Invoice Detail View Modal */}
      {showInvoiceDetailModal && selectedInvoice && (
        <div className="modal-overlay" onClick={handleCloseInvoiceDetailModal}>
          <div
            className="modal-content detail-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>📋 Invoice Details</h2>
              <button className="close-btn" onClick={handleCloseInvoiceDetailModal}>
                ×
              </button>
            </div>

            <div className="modal-body">
              {/* Invoice Information */}
              <div className="detail-section">
                <h3>Invoice Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Invoice ID:</label>
                    <span>
                      #{selectedInvoice.invoiceId || selectedInvoice.id}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Appointment ID:</label>
                    <span>#{selectedInvoice.maintenanceRecord.appointmentId || "N/A"}</span>
                  </div>
                  <div className="detail-item">
                    <label>Issue Date:</label>
                    <span>
                      {selectedInvoice.createdAt
                       ? new Date(selectedInvoice.createdAt).toLocaleDateString("vi-VN")
                        : "N/A"}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Status:</label>
                    <span
                      className={`status-badge ${getInvoiceStatusBadgeClass(
                        selectedInvoice.status
                      )}`}
                    >
                      {getInvoiceStatusText(selectedInvoice.status)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div className="detail-section">
                <h3>Customer Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Customer Name:</label>
                    <span>{selectedInvoice.maintenanceRecord?.customerName || "N/A"}</span>
                  </div>
                  <div className="detail-item">
                    <label>Customer ID:</label>
                    <span>#{selectedInvoice.maintenanceRecord?.customerId || "N/A"}</span>
                  </div>
                </div>
              </div>

              {/* Vehicle Information */}
              <div className="detail-section">
                <h3>Vehicle Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>License Plate:</label>
                    <span>{selectedInvoice.maintenanceRecord?.vehicleLicensePlate || "N/A"}</span>
                  </div>
                  <div className="detail-item">
                    <label>Model:</label>
                    <span>{selectedInvoice.maintenanceRecord?.vehicleModel || "N/A"}</span>
                  </div>
                  <div className="detail-item">
                    <label>Odometer:</label>
                    <span>{selectedInvoice.maintenanceRecord?.odometer?.toLocaleString("vi-VN") || "N/A"} km</span>
                  </div>
                </div>
              </div>

              {/* Service Package */}
              {selectedInvoice.maintenanceRecord?.servicePackageName && (
                <div className="detail-section">
                  <h3>Service Package</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Package Name:</label>
                      <span>{selectedInvoice.maintenanceRecord.servicePackageName}</span>
                    </div>
                    <div className="detail-item">
                      <label>Service Center:</label>
                      <span>{selectedInvoice.serviceCenterName || selectedInvoice.maintenanceRecord.serviceCenterName || "N/A"}</span>
                    </div>
                    <div className="detail-item">
                      <label>Technician:</label>
                      <span>{selectedInvoice.maintenanceRecord.technicianName || "N/A"}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Service Items */}
              {selectedInvoice.maintenanceRecord?.serviceItems && selectedInvoice.maintenanceRecord.serviceItems.length > 0 && (
                <div className="detail-section">
                  <h3>Danh Sách Dịch Vụ & Phụ Tùng</h3>
                  <div className="service-items-table">
                    <table>
                      <thead>
                        <tr>
                          <th>STT</th>
                          <th>Tên Hạng Mục</th>
                          <th>Mô Tả</th>
                          <th>Loại Thao Tác</th>
                          <th>Đơn Giá</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedInvoice.maintenanceRecord.serviceItems.map((item, index) => (
                          <tr key={index}>
                            <td>{index + 1}</td>
                            <td><strong>{item.serviceItem?.name || "N/A"}</strong></td>
                            <td>
                              <small>{item.serviceItem?.description || "N/A"}</small>
                            </td>
                            <td>
                              <span className={`action-type-badge ${item.actionType?.toLowerCase()}`}>
                                {item.actionType === "CHECK" ? "Kiểm tra" : 
                                 item.actionType === "REPLACE" ? "Thay thế" : 
                                 item.actionType === "REPAIR" ? "Sửa chữa" :
                                 item.actionType || "N/A"}
                              </span>
                            </td>
                            <td className="price-cell">
                              <strong>{formatCurrency(item.price)}</strong>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr style={{ borderTop: "2px solid #26a69a", fontWeight: "bold" }}>
                          <td colSpan="4" style={{ textAlign: "right", paddingRight: "20px" }}>
                            Tổng Cộng:
                          </td>
                          <td className="price-cell" style={{ fontSize: "1.1rem" }}>
                            <strong>{formatCurrency(selectedInvoice.totalAmount)}</strong>
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}

              {/* Payment Information */}
              <div className="detail-section">
                <h3>Payment Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Total Amount:</label>
                    <span className="price-highlight" style={{ fontSize: "1.3rem", fontWeight: "bold", color: "#27ae60" }}>
                      {formatCurrency(selectedInvoice.totalAmount)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Payment Status:</label>
                    <span
                      className={`status-badge ${getInvoiceStatusBadgeClass(
                        selectedInvoice.status
                      )}`}
                    >
                      {getInvoiceStatusText(selectedInvoice.status)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Maintenance Record Details */}
              {selectedInvoice.maintenanceRecord && (
                <div className="detail-section">
                  <h3>Maintenance Details</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Performed At:</label>
                      <span>
                        {selectedInvoice.maintenanceRecord.performedAt
                          ? new Date(selectedInvoice.maintenanceRecord.performedAt).toLocaleString("vi-VN")
                          : "N/A"}
                      </span>
                    </div>
                    {selectedInvoice.maintenanceRecord.notes && (
                      <div className="detail-item" style={{ gridColumn: "1 / -1" }}>
                        <label>Notes:</label>
                        <p style={{ padding: "10px", background: "#f5f9f8", borderRadius: "8px", color: "#555", marginTop: "5px" }}>
                          {selectedInvoice.maintenanceRecord.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Timestamps */}
              {(selectedInvoice.createdAt || selectedInvoice.updatedAt) && (
                <div className="detail-section">
                  <h3>Timestamps</h3>
                  <div className="detail-grid">
                    {selectedInvoice.createdAt && (
                      <div className="detail-item">
                        <label>Created At:</label>
                        <span>
                          {new Date(selectedInvoice.createdAt).toLocaleString("vi-VN")}
                        </span>
                      </div>
                    )}
                    {selectedInvoice.updatedAt && (
                      <div className="detail-item">
                        <label>Updated At:</label>
                        <span>
                          {new Date(selectedInvoice.updatedAt).toLocaleString("vi-VN")}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedInvoice.notes && (
                <div className="detail-section">
                  <h3>Notes</h3>
                  <p style={{ padding: "10px", background: "#f5f9f8", borderRadius: "8px", color: "#555" }}>
                    {selectedInvoice.notes}
                  </p>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="cancel-btn" onClick={handleCloseInvoiceDetailModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

const StaffDashboard = () => {
  const [userId, setUserId] = useState(null)

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userProfile = await authService.getUserProfile()
        if (userProfile.success && userProfile.data) {
          setUserId(userProfile.data.userId)
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
    <ChatProvider userRole="ROLE_STAFF" userId={userId}>
      <StaffDashboardContent />
    </ChatProvider>
  )
}

export default StaffDashboard;
