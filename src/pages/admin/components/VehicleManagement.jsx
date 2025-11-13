import { useState, useEffect } from "react";
import vehicleService from "../../../api/vehicleService";
import customerService from "../../../api/customerService";
import logger from "../../../utils/logger";
import "../../../styles/VehicleManagement.css";

const VehicleManagement = () => {
  const [vehicles, setVehicles] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [vehicleModels, setVehicleModels] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [formData, setFormData] = useState({
    id: "",
    licensePlate: "",
    vin: "",
    currentKm: "",
    purchaseYear: "",
    customerId: "",
    customerUsername: "",
    customerName: "",
    vehicleModelId: "",
  });
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [viewingVehicle, setViewingVehicle] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
  const [isLoadingModels, setIsLoadingModels] = useState(false);

  // Load vehicles, customers, and models from API
  useEffect(() => {
    loadVehicles();
    loadCustomers();
    loadVehicleModels();
  }, []);

  const loadVehicles = async () => {
    setIsLoading(true);
    try {
      const result = await vehicleService.getAllVehicles();
      logger.log("Raw vehicle result:", result);

      if (result.success && result.data) {
        // API returns paginated data with 'content' array
        let vehiclesArray = [];
        
        if (Array.isArray(result.data)) {
          // If data is directly an array
          vehiclesArray = result.data;
        } else if (result.data.content && Array.isArray(result.data.content)) {
          // If data is paginated object with 'content' array
          vehiclesArray = result.data.content;
        }
        
        // Sort by creation date (newest first)
        const sortedVehicles = vehiclesArray.sort(
          (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        );

        setVehicles(sortedVehicles);
        logger.log("Loaded vehicles:", sortedVehicles);
        if (sortedVehicles.length > 0) {
          logger.log("Sample vehicle object:", sortedVehicles[0]);
        }
      } else {
        logger.log("Failed to load vehicles:", result.message);
        alert(result.message || "Failed to load vehicles");
      }
    } catch (error) {
      logger.error("Error loading vehicles:", error);
      alert("Failed to load vehicles. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadCustomers = async () => {
    setIsLoadingCustomers(true);
    try {
      const result = await customerService.getAllCustomers();

      if (result.success && result.data) {
        const customersArray = Array.isArray(result.data) ? result.data : [];
        setCustomers(customersArray);
        logger.log("Loaded customers:", customersArray);
      } else {
        logger.log("Failed to load customers:", result.message);
      }
    } catch (error) {
      logger.error("Error loading customers:", error);
    } finally {
      setIsLoadingCustomers(false);
    }
  };

  const loadVehicleModels = async () => {
    setIsLoadingModels(true);
    try {
      const result = await vehicleService.getAllVehicleModels();

      // vehicleService.getAllVehicleModels() returns {success, data, message}
      if (result.success && result.data) {
        const modelsArray = Array.isArray(result.data) ? result.data : [];
        setVehicleModels(modelsArray);
        logger.log("Loaded vehicle models:", modelsArray);
      } else {
        logger.log("Failed to load vehicle models:", result?.message || "Unknown error");
      }
    } catch (error) {
      logger.error("Error loading vehicle models:", error);
    } finally {
      setIsLoadingModels(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Convert IDs from string to number
    let processedValue = value;
    if (name === "customerId" || name === "vehicleModelId") {
      processedValue = value === "" ? "" : Number(value);
    }
    if (name === "currentKm") {
      processedValue = value === "" ? "" : Number(value);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));
  };

  // Handle customer username change to find customer
  const handleCustomerUsernameChange = (username) => {
    setFormData((prev) => ({
      ...prev,
      customerUsername: username,
      customerName: "",
      customerId: "",
    }));

    if (username.trim() === "") {
      return;
    }

    // Find customer by username
    const foundCustomer = customers.find((c) => c.username === username.trim());

    if (foundCustomer) {
      setFormData((prev) => ({
        ...prev,
        customerUsername: username,
        customerName: foundCustomer.fullName,
        customerId: foundCustomer.id,
      }));
    }
  };

  const resetForm = () => {
    setFormData({
      id: "",
      licensePlate: "",
      vin: "",
      currentKm: "",
      purchaseYear: "",
      customerId: "",
      customerUsername: "",
      customerName: "",
      vehicleModelId: "",
    });
    setEditingVehicle(null);
    setShowAddForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editingVehicle) {
      // Update existing vehicle
      try {
        const updateData = {
          licensePlate: formData.licensePlate,
          vin: formData.vin,
          currentKm: formData.currentKm || 0,
          purchaseYear: formData.purchaseYear,
          customerId: formData.customerId,
          modelId: formData.vehicleModelId,
        };
        logger.log("Updating vehicle with data:", updateData);

        const result = await vehicleService.updateVehicle(
          editingVehicle.id,
          updateData
        );

        if (result && result.success) {
          alert(`Vehicle ${formData.licensePlate} updated successfully!`);
          resetForm();
          loadVehicles();
        } else {
          alert(
            `Failed to update vehicle: ${result?.message || "Unknown error"}`
          );
        }
      } catch (error) {
        logger.error("Error updating vehicle:", error);
        alert("An error occurred while updating vehicle");
      }
    } else {
      // Add new vehicle
      try {
        const createData = {
          licensePlate: formData.licensePlate,
          vin: formData.vin,
          currentKm: formData.currentKm || 0,
          purchaseYear: formData.purchaseYear,
          customerId: formData.customerId,
          modelId: formData.vehicleModelId,
        };
        logger.log("Creating vehicle with data:", createData);

        const result = await vehicleService.createVehicle(createData);

        if (result && result.success) {
          alert(`Vehicle ${formData.licensePlate} created successfully!`);
          resetForm();
          loadVehicles();
        } else {
          alert(
            `Failed to create vehicle: ${result?.message || "Unknown error"}`
          );
        }
      } catch (error) {
        logger.error("Error creating vehicle:", error);
        alert("An error occurred while creating vehicle");
      }
    }
  };

  const getCustomerName = (customerId) => {
    if (!customerId) return "N/A";
    const customer = customers.find((c) => c.id === customerId);
    return customer ? customer.fullName : `Customer #${customerId}`;
  };

  const getVehicleModelName = (vehicle) => {
    // Support both modelId and vehicleModelId
    const modelId = vehicle?.modelId || vehicle?.vehicleModelId;
    if (!modelId) return "N/A";
    
    const model = vehicleModels.find((m) => m.id === modelId);
    if (!model) return `Model #${modelId}`;
    
    // Return model name (as per StaffDashboard)
    return model.name || `Model #${modelId}`;
  };

  const handleEdit = (vehicle) => {
    // Find customer info for editing
    const customer = customers.find((c) => c.id === vehicle.customerId);
    
    setFormData({
      ...vehicle,
      customerId: vehicle.customerId || "",
      customerUsername: customer?.username || "",
      customerName: customer?.fullName || "",
      vehicleModelId: vehicle.modelId || vehicle.vehicleModelId || "",
      vin: vehicle.vin || "",
      currentKm: vehicle.currentKm || "",
      purchaseYear: vehicle.purchaseYear || "",
    });
    setEditingVehicle(vehicle);
    setShowAddForm(true);
  };

  const handleViewDetail = (vehicle) => {
    setViewingVehicle(vehicle);
    setShowDetailModal(true);
  };

  const handleCloseDetail = () => {
    setViewingVehicle(null);
    setShowDetailModal(false);
  };

  const handleDelete = async (vehicle) => {
    if (
      !window.confirm(
        `Are you sure you want to delete vehicle ${vehicle.licensePlate}?`
      )
    ) {
      return;
    }

    try {
      const result = await vehicleService.deleteVehicle(vehicle.id);

      if (result && result.success) {
        alert(`Vehicle ${vehicle.licensePlate} deleted successfully!`);
        loadVehicles();
      } else {
        alert(
          `Failed to delete vehicle: ${result?.message || "Unknown error"}`
        );
      }
    } catch (error) {
      logger.error("Error deleting vehicle:", error);
      alert("An error occurred while deleting vehicle");
    }
  };

  // Filter vehicles
  const filteredVehicles = vehicles.filter((vehicle) => {
    const customerName = getCustomerName(vehicle.customerId);
    const modelName = getVehicleModelName(vehicle);

    const matchesSearch =
      vehicle.licensePlate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      modelName.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  return (
    <div className="vehicle-management">
      {/* Header Actions */}
      <div className="management-header">
        <div className="search-filters">
          <input
            type="text"
            placeholder="Search vehicles by license plate, customer, model..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />

          <button
            className="refresh-btn"
            onClick={loadVehicles}
            disabled={isLoading}
            title="Refresh vehicle list"
          >
            {isLoading ? "⌛" : "↻"}
          </button>
        </div>

        <button
          className="add-vehicle-btn"
          onClick={() => setShowAddForm(true)}
        >
          + Add Vehicle
        </button>
      </div>

      {/* Vehicle Form Modal */}
      {showAddForm && (
        <div className="modal-overlay">
          <div className="vehicle-form-modal">
            <div className="modal-header">
              <h3>{editingVehicle ? "Edit Vehicle" : "Add New Vehicle"}</h3>
              <button className="close-btn" onClick={resetForm}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="vehicle-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="licensePlate">License Plate *</label>
                  <input
                    type="text"
                    id="licensePlate"
                    name="licensePlate"
                    value={formData.licensePlate}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., 51A-12345"
                    style={{ textTransform: "uppercase" }}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="vin">VIN Number *</label>
                  <input
                    type="text"
                    id="vin"
                    name="vin"
                    value={formData.vin}
                    onChange={handleInputChange}
                    required
                    placeholder="VF12345678901234"
                    maxLength={17}
                    style={{ textTransform: "uppercase" }}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="currentKm">Current Kilometers *</label>
                  <input
                    type="number"
                    id="currentKm"
                    name="currentKm"
                    value={formData.currentKm}
                    onChange={handleInputChange}
                    required
                    placeholder="5000"
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="purchaseYear">Purchase Date</label>
                  <input
                    type="month"
                    id="purchaseYear"
                    name="purchaseYear"
                    value={formData.purchaseYear}
                    onChange={handleInputChange}
                    max={`${new Date().getFullYear()}-${String(
                      new Date().getMonth() + 1
                    ).padStart(2, "0")}`}
                  />
                  <small
                    style={{
                      color: "#666",
                      fontSize: "0.85rem",
                      marginTop: "4px",
                      display: "block",
                    }}
                  >
                    Month and year (e.g., 2025-11)
                  </small>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="customerUsername">
                    {editingVehicle ? "Customer" : "Customer Username *"}
                  </label>
                  {editingVehicle ? (
                    // Show customer name (read-only) when editing
                    <input
                      type="text"
                      value={getCustomerName(formData.customerId)}
                      disabled
                      style={{
                        background: "#f0f4f8",
                        cursor: "not-allowed",
                      }}
                    />
                  ) : (
                    // Show username input when adding new
                    <>
                      <input
                        type="text"
                        id="customerUsername"
                        name="customerUsername"
                        value={formData.customerUsername}
                        onChange={(e) =>
                          handleCustomerUsernameChange(e.target.value)
                        }
                        placeholder="Enter customer username"
                        required
                      />
                      {formData.customerName && (
                        <small
                          style={{
                            color: "#4caf50",
                            fontSize: "0.85rem",
                            marginTop: "4px",
                            display: "block",
                          }}
                        >
                          ✓ Customer: <strong>{formData.customerName}</strong>
                        </small>
                      )}
                      {formData.customerUsername &&
                        !formData.customerName && (
                          <small
                            style={{
                              color: "#f44336",
                              fontSize: "0.85rem",
                              marginTop: "4px",
                              display: "block",
                            }}
                          >
                            ⚠ Customer not found with this username
                          </small>
                        )}
                    </>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="vehicleModelId">Vehicle Model *</label>
                  {isLoadingModels ? (
                    <div style={{ padding: "0.75rem", color: "#666" }}>
                      Loading models...
                    </div>
                  ) : (
                    <select
                      id="vehicleModelId"
                      name="vehicleModelId"
                      value={formData.vehicleModelId}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">-- Select Vehicle Model --</option>
                      {vehicleModels.map((model) => (
                        <option key={model.id} value={model.id}>
                          {model.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={resetForm}
                  className="cancel-btn"
                >
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  {editingVehicle ? "Update" : "Add"} Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Vehicle List */}
      <div className="vehicle-list">
        <div className="list-header">
          <h3>Vehicles ({filteredVehicles.length})</h3>
        </div>

        {isLoading ? (
          <div className="loading-state">
            <p>⏳ Loading vehicles...</p>
          </div>
        ) : (
          <div className="vehicle-table">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>License Plate</th>
                  <th>Customer</th>
                  <th>Model</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVehicles.map((vehicle) => (
                  <tr key={vehicle.id}>
                    <td>{vehicle.id}</td>
                    <td>
                      <span className="license-plate">
                        {vehicle.licensePlate}
                      </span>
                    </td>
                    <td>{getCustomerName(vehicle.customerId)}</td>
                    <td>{getVehicleModelName(vehicle)}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="view-btn"
                          onClick={() => handleViewDetail(vehicle)}
                          title="View Details"
                        >
                          View
                        </button>
                        <button
                          className="edit-btn"
                          onClick={() => handleEdit(vehicle)}
                          title="Edit Vehicle"
                        >
                          Edit
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => handleDelete(vehicle)}
                          title="Delete Vehicle"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredVehicles.length === 0 && (
              <div className="empty-state">
                <p>No vehicles found matching your criteria.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Vehicle Detail Modal */}
      {showDetailModal && viewingVehicle && (
        <div className="modal-overlay" onClick={handleCloseDetail}>
          <div
            className="vehicle-detail-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="detail-modal-header">
              <div className="header-icon">🚗</div>
              <div className="header-text">
                <h3>Vehicle Information</h3>
                <p className="header-subtitle">Complete vehicle details</p>
              </div>
              <button className="close-btn" onClick={handleCloseDetail}>
                ✕
              </button>
            </div>

            <div className="detail-content">
              {/* License Plate Hero Section */}
              <div className="detail-hero">
                <div className="hero-license-plate">
                  {viewingVehicle.licensePlate}
                </div>
                <div className="hero-model">
                  {getVehicleModelName(viewingVehicle)}
                </div>
              </div>

              {/* Info Cards Grid */}
              <div className="detail-cards">
                {/* Vehicle Info Card */}
                <div className="info-card">
                  <div className="card-header">
                    <span className="card-icon">🔧</span>
                    <h4>Vehicle Details</h4>
                  </div>
                  <div className="card-body">
                    <div className="info-row">
                      <span className="info-label">
                        <span className="label-icon">🆔</span>
                        Vehicle ID
                      </span>
                      <span className="info-value">#{viewingVehicle.id}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">
                        <span className="label-icon">📋</span>
                        VIN Number
                      </span>
                      <span className="info-value vin-number">
                        {viewingVehicle.vin || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Owner Info Card */}
                <div className="info-card">
                  <div className="card-header">
                    <span className="card-icon">👤</span>
                    <h4>Owner Information</h4>
                  </div>
                  <div className="card-body">
                    <div className="info-row">
                      <span className="info-label">
                        <span className="label-icon">👨‍💼</span>
                        Customer Name
                      </span>
                      <span className="info-value">
                        {getCustomerName(viewingVehicle.customerId)}
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">
                        <span className="label-icon">🔢</span>
                        Customer ID
                      </span>
                      <span className="info-value">
                        #{viewingVehicle.customerId}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Info Card */}
                <div className="info-card full-width">
                  <div className="card-header">
                    <span className="card-icon">📊</span>
                    <h4>Vehicle Status</h4>
                  </div>
                  <div className="card-body">
                    <div className="info-row">
                      <span className="info-label">
                        <span className="label-icon">🛣️</span>
                        Current Mileage
                      </span>
                      <span className="info-value">
                        {viewingVehicle.currentKm
                          ? `${parseInt(
                              viewingVehicle.currentKm
                            ).toLocaleString()} km`
                          : "N/A"}
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">
                        <span className="label-icon">📅</span>
                        Purchase Date
                      </span>
                      <span className="info-value">
                        {viewingVehicle.purchaseYear
                          ? new Date(
                              viewingVehicle.purchaseYear + "-01"
                            ).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                            })
                          : "N/A"}
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">
                        <span className="label-icon">⏰</span>
                        Registered On
                      </span>
                      <span className="info-value">
                        {viewingVehicle.createdAt
                          ? new Date(
                              viewingVehicle.createdAt
                            ).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="detail-actions">
                <button
                  className="action-edit-btn"
                  onClick={() => {
                    handleCloseDetail();
                    handleEdit(viewingVehicle);
                  }}
                >
                  <span className="btn-icon">✏️</span>
                  Edit Vehicle
                </button>
                <button
                  className="action-close-btn"
                  onClick={handleCloseDetail}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleManagement;
