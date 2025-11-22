import { useState, useEffect } from "react";
import appointmentService from "../../../api/appointmentService";
import logger from "../../../utils/logger";
import "../../../styles/AppointmentManagement.css";

const AppointmentManagement = () => {
  const [appointments, setAppointments] = useState([]);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [appointmentsPerPage] = useState(10);

  // Load appointments from API
  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    setIsLoading(true);
    try {
      const result = await appointmentService.getAllAppointments();

      if (result.success && result.data) {
        // Sort by appointment date (newest first)
        const sortedAppointments = result.data.sort(
          (a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate)
        );

        setAppointments(sortedAppointments);
        logger.log("Loaded appointments:", sortedAppointments);
      } else {
        logger.error("Failed to load appointments:", result.message);
        alert(result.message || "Failed to load appointments");
      }
    } catch (error) {
      logger.error("Error loading appointments:", error);
      alert("Failed to load appointments. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetail = (appointment) => {
    // Directly use the appointment data from the list since it already contains all details
    setSelectedAppointment(appointment);
    setShowDetailModal(true);
  };

  const handleStatusChange = async (appointmentId, newStatus) => {
    if (!window.confirm(`Are you sure you want to change status to ${newStatus}?`)) {
      return;
    }

    try {
      const result = await appointmentService.updateAppointmentStatus(appointmentId, newStatus);

      if (result.success) {
        alert("Status updated successfully!");
        loadAppointments(); // Reload appointments
      } else {
        alert(`Failed to update status: ${result.message}`);
      }
    } catch (error) {
      logger.error("Error updating appointment status:", error);
      alert("An error occurred while updating status");
    }
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedAppointment(null);
  };

  // Filter appointments
  const filteredAppointments = appointments.filter((appointment) => {
    const matchesSearch =
      appointment.id?.toString().includes(searchTerm) ||
      appointment.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.vehicleLicensePlate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.nameCenter?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || appointment.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate pagination
  const indexOfLastAppointment = currentPage * appointmentsPerPage;
  const indexOfFirstAppointment = indexOfLastAppointment - appointmentsPerPage;
  const currentAppointments = filteredAppointments.slice(
    indexOfFirstAppointment,
    indexOfLastAppointment
  );
  const totalPages = Math.ceil(filteredAppointments.length / appointmentsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      PENDING: "status-pending",
      CONFIRMED: "status-confirmed",
      IN_PROGRESS: "status-in-progress",
      COMPLETED: "status-completed",
      CANCELLED: "status-cancelled",
    };
    return statusClasses[status] || "status-default";
  };

  const getStatusLabel = (status) => {
    const statusLabels = {
      PENDING: "Pending",
      CONFIRMED: "Confirmed",
      IN_PROGRESS: "In Progress",
      COMPLETED: "Completed",
      CANCELLED: "Cancelled",
    };
    return statusLabels[status] || status;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="appointment-management">
      {/* Header Actions */}
      <div className="management-header">
        <div className="search-filters">
          <input
            type="text"
            placeholder="Search by ID, customer, vehicle, center..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="search-input"
          />

          <select
            value={statusFilter}
            onChange={(e) => handleStatusFilterChange(e.target.value)}
            className="status-filter"
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <button
            className="refresh-btn"
            onClick={loadAppointments}
            disabled={isLoading}
            title="Refresh appointment list"
          >
            {isLoading ? "⟳" : "↻"}
          </button>
        </div>
      </div>

      {/* Appointment Detail Modal */}
      {showDetailModal && selectedAppointment && (
        <div className="modal-overlay" onClick={closeDetailModal}>
          <div
            className="appointment-detail-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>Appointment Details #{selectedAppointment.id}</h3>
              <button className="close-btn" onClick={closeDetailModal}>
                ✕
              </button>
            </div>

            <div className="appointment-detail-content">
              {/* Basic Info */}
              <div className="detail-section">
                <h4>Basic Information</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Appointment ID:</label>
                    <span>{selectedAppointment.id}</span>
                  </div>
                  <div className="detail-item">
                    <label>Status:</label>
                    <span className={`status-badge ${getStatusBadgeClass(selectedAppointment.status)}`}>
                      {getStatusLabel(selectedAppointment.status)}
                    </span>
                  </div>
                  {selectedAppointment.recordStatus && (
                    <div className="detail-item">
                      <label>Record Status:</label>
                      <span className={`status-badge ${selectedAppointment.recordStatus === 'ACTIVE' ? 'status-confirmed' : 'status-default'}`}>
                        {selectedAppointment.recordStatus}
                      </span>
                    </div>
                  )}
                  <div className="detail-item">
                    <label>Appointment Date:</label>
                    <span>{formatDateTime(selectedAppointment.appointmentDate)}</span>
                  </div>
                  {selectedAppointment.createdAt && (
                    <div className="detail-item">
                      <label>Created At:</label>
                      <span>{formatDateTime(selectedAppointment.createdAt)}</span>
                    </div>
                  )}
                  {selectedAppointment.updatedAt && (
                    <div className="detail-item">
                      <label>Updated At:</label>
                      <span>{formatDateTime(selectedAppointment.updatedAt)}</span>
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

              {/* Customer Info */}
              {(selectedAppointment.customerId || selectedAppointment.customerName || selectedAppointment.customerEmail || selectedAppointment.customerPhone) && (
                <div className="detail-section">
                  <h4>Customer Information</h4>
                  <div className="detail-grid">
                    {selectedAppointment.customerId && (
                      <div className="detail-item">
                        <label>Customer ID:</label>
                        <span>{selectedAppointment.customerId}</span>
                      </div>
                    )}
                    {selectedAppointment.customerName && (
                      <div className="detail-item">
                        <label>Name:</label>
                        <span>{selectedAppointment.customerName}</span>
                      </div>
                    )}
                    {selectedAppointment.customerEmail && (
                      <div className="detail-item">
                        <label>Email:</label>
                        <span>{selectedAppointment.customerEmail}</span>
                      </div>
                    )}
                    {selectedAppointment.customerPhone && (
                      <div className="detail-item">
                        <label>Phone:</label>
                        <span>{selectedAppointment.customerPhone}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Vehicle Info */}
              {(selectedAppointment.vehicleId || selectedAppointment.vehicleLicensePlate || selectedAppointment.vehicleModel || selectedAppointment.milestoneKm) && (
                <div className="detail-section">
                  <h4>Vehicle Information</h4>
                  <div className="detail-grid">
                    {selectedAppointment.vehicleId && (
                      <div className="detail-item">
                        <label>Vehicle ID:</label>
                        <span>{selectedAppointment.vehicleId}</span>
                      </div>
                    )}
                    {selectedAppointment.vehicleLicensePlate && (
                      <div className="detail-item">
                        <label>License Plate:</label>
                        <span>{selectedAppointment.vehicleLicensePlate}</span>
                      </div>
                    )}
                    {selectedAppointment.vehicleModel && (
                      <div className="detail-item">
                        <label>Model:</label>
                        <span>{selectedAppointment.vehicleModel}</span>
                      </div>
                    )}
                    {selectedAppointment.milestoneKm && (
                      <div className="detail-item">
                        <label>Milestone (km):</label>
                        <span>{selectedAppointment.milestoneKm.toLocaleString()} km</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Service Package Info */}
              {(selectedAppointment.servicePackageName || selectedAppointment.estimatedCost) && (
                <div className="detail-section">
                  <h4>Service Package</h4>
                  <div className="detail-grid">
                    {selectedAppointment.servicePackageName && (
                      <div className="detail-item">
                        <label>Package Name:</label>
                        <span>{selectedAppointment.servicePackageName}</span>
                      </div>
                    )}
                    {selectedAppointment.estimatedCost && (
                      <div className="detail-item">
                        <label>Estimated Cost:</label>
                        <span className="estimated-cost">
                          {selectedAppointment.estimatedCost.toLocaleString()} VND
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Service Center Info */}
              {(selectedAppointment.nameCenter || selectedAppointment.addressCenter || selectedAppointment.districtCenter) && (
                <div className="detail-section">
                  <h4>Service Center</h4>
                  <div className="detail-grid">
                    {selectedAppointment.nameCenter && (
                      <div className="detail-item">
                        <label>Center Name:</label>
                        <span>{selectedAppointment.nameCenter}</span>
                      </div>
                    )}
                    {selectedAppointment.addressCenter && (
                      <div className="detail-item">
                        <label>Address:</label>
                        <span>{selectedAppointment.addressCenter}</span>
                      </div>
                    )}
                    {selectedAppointment.districtCenter && (
                      <div className="detail-item">
                        <label>District:</label>
                        <span>{selectedAppointment.districtCenter}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Technician Info */}
              {selectedAppointment.technicianId && (
                <div className="detail-section">
                  <h4>Technician Information</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Technician ID:</label>
                      <span>{selectedAppointment.technicianId}</span>
                    </div>
                    {selectedAppointment.technicianName && (
                      <div className="detail-item">
                        <label>Technician Name:</label>
                        <span>{selectedAppointment.technicianName}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Service Items */}
              {selectedAppointment.serviceItems && selectedAppointment.serviceItems.length > 0 && (
                <div className="detail-section">
                  <h4>Service Items ({selectedAppointment.serviceItems.length})</h4>
                  <div className="service-items-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Service Name</th>
                          <th>Action Type</th>
                          <th>Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedAppointment.serviceItems.map((item, index) => (
                          <tr key={index}>
                            <td>{item.serviceItem.name || "N/A"}</td>
                            <td>
                              <span className="action-type-badge">
                                {item.actionType || "N/A"}
                              </span>
                            </td>
                            <td>{item.price ? `${item.price.toLocaleString()} VND` : "N/A"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Appointment List */}
      <div className="appointment-list">
        <div className="list-header">
          <h3>Appointments ({filteredAppointments.length})</h3>
        </div>

        {isLoading ? (
          <div className="loading-state">
            <p>⏳ Loading appointments...</p>
          </div>
        ) : (
          <div className="appointment-table">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Customer</th>
                  <th>Vehicle</th>
                  <th>Service Center</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentAppointments.map((appointment) => (
                  <tr key={appointment.id}>
                    <td>{appointment.id}</td>
                    <td>
                        <div className="customer-name">{appointment.customerName || "N/A"}</div>
                    </td>
                    <td>
                      <div className="vehicle-info">
                        <div className="vehicle-plate">{appointment.vehicleLicensePlate || "N/A"}</div>
                        <div className="vehicle-model">{appointment.vehicleModel || ""}</div>
                      </div>
                    </td>
                    <td>
                      <div className="center-info">
                        <div className="center-name">{appointment.nameCenter || "N/A"}</div>
                        <div className="center-district">{appointment.districtCenter || ""}</div>
                      </div>
                    </td>
                    <td>{formatDate(appointment.appointmentDate)}</td>
                    <td>
                      <span className={`status-badge ${getStatusBadgeClass(appointment.status)}`}>
                        {getStatusLabel(appointment.status)}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="view-btn"
                          onClick={() => handleViewDetail(appointment)}
                          title="View Details"
                        >
                          👁 View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredAppointments.length === 0 && (
              <div className="empty-state">
                <p>No appointments found matching your criteria.</p>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="pagination-container">
                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  ← Previous
                </button>

                <div className="pagination-info">
                  <span>
                    Page {currentPage} of {totalPages}
                  </span>
                  <span className="pagination-details">
                    Showing {indexOfFirstAppointment + 1} -{" "}
                    {Math.min(indexOfLastAppointment, filteredAppointments.length)} of{" "}
                    {filteredAppointments.length}
                  </span>
                </div>

                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentManagement;
