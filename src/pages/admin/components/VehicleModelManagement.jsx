import { useState, useEffect } from "react";
import vehicleModelService from "../../../api/vehicleModelService";
import ModelPackageConfigModal from "./ModelPackageConfigModal";
import "../../../styles/VehicleModelManagement.css";

const VehicleModelManagement = () => {
  const [vehicleModels, setVehicleModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [selectedModel, setSelectedModel] = useState(null);
  const [formData, setFormData] = useState({ name: "", modelYear: "" });

  useEffect(() => {
    fetchVehicleModels();
  }, []);

  const fetchVehicleModels = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await vehicleModelService.getAllVehicleModels();
      if (response.code === 1000) {
        setVehicleModels(response.result);
      } else {
        setError(response.message || "Failed to fetch vehicle models");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "An error occurred while fetching vehicle models"
      );
      console.error("Error fetching vehicle models:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddModel = () => {
    setFormData({ name: "", modelYear: "" });
    setShowAddModal(true);
  };

  const handleEditModel = (model) => {
    setSelectedModel(model);
    setFormData({ name: model.name, modelYear: model.modelYear });
    setShowEditModal(true);
  };

  const handleConfigModel = (model) => {
    setSelectedModel(model);
    setShowConfigModal(true);
  };

  const handleDeleteModel = async (model) => {
    if (window.confirm(`Are you sure you want to delete "${model.name}"?`)) {
      try {
        const response = await vehicleModelService.deleteVehicleModel(model.id);
        if (response.code === 1000) {
          alert("Vehicle model deleted successfully!");
          fetchVehicleModels();
        } else {
          alert(response.message || "Failed to delete vehicle model");
        }
      } catch (err) {
        alert(err.response?.data?.message || "Failed to delete vehicle model");
      }
    }
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    try {
      const response = await vehicleModelService.createVehicleModel(formData);
      if (response.code === 1000) {
        alert("Vehicle model created successfully!");
        setShowAddModal(false);
        fetchVehicleModels();
      } else {
        alert(response.message || "Failed to create vehicle model");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create vehicle model");
    }
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    try {
      const response = await vehicleModelService.updateVehicleModel(
        selectedModel.id,
        formData
      );
      if (response.code === 1000) {
        alert("Vehicle model updated successfully!");
        setShowEditModal(false);
        fetchVehicleModels();
      } else {
        alert(response.message || "Failed to update vehicle model");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update vehicle model");
    }
  };

  const filteredModels = vehicleModels.filter(
    (model) =>
      model.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      model.modelYear?.toString().includes(searchTerm)
  );

  return (
    <div className="vehicle-model-management">
      <div className="vehicle-model-management-header">
        <h2>Vehicle Model Management</h2>
        <p>Manage vehicle models and configure service packages</p>
      </div>

      {/* Search Bar and Add Button */}
      <div className="search-section">
        <div className="search-box">
          <span className="search-icon"></span>
          <input
            type="text"
            placeholder="Search by model name or year..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <button className="add-model-btn" onClick={handleAddModel}>
          ➕ Add New Model
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading vehicle models...</p>
        </div>
      ) : (
        <>
          {/* Statistics */}
          <div className="stats-container">
            <div className="stat-card">
              {/* <div className="stat-icon"></div> */}
              <div className="stat-details">
                <p className="stat-label">Total Models</p>
                <h3 className="stat-value">{vehicleModels.length}</h3>
              </div>
            </div>
            <div className="stat-card">
              {/* <div className="stat-icon"></div> */}
              <div className="stat-details">
                <p className="stat-label">Filtered Results</p>
                <h3 className="stat-value">{filteredModels.length}</h3>
              </div>
            </div>
          </div>

          {/* Vehicle Models Table */}
          <div className="table-container">
            <table className="vehicle-model-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Model Name</th>
                  <th>Model Year</th>
                  <th>Created At</th>
                  <th>Updated At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredModels.length > 0 ? (
                  filteredModels.map((model) => (
                    <tr key={model.id}>
                      <td>{model.id}</td>
                      <td className="model-name">{model.name}</td>
                      <td>
                        <span className="year-badge">{model.modelYear}</span>
                      </td>
                      <td>{model.createdAt || "N/A"}</td>
                      <td>{model.updatedAt || "N/A"}</td>
                      <td className="actions">
                        <button
                          className="action-btn config"
                          onClick={() => handleConfigModel(model)}
                          title="Configure Service Packages"
                        >
                          ⚙️ Config
                        </button>
                        <button
                          className="action-btn edit"
                          onClick={() => handleEditModel(model)}
                          title="Edit Model"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className="action-btn delete"
                          onClick={() => handleDeleteModel(model)}
                          title="Delete Model"
                        >
                          🗑️ Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="no-data">
                      <div className="no-data-content">
                        <span className="no-data-icon">📭</span>
                        <p>No vehicle models found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Add Model Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Vehicle Model</h3>
              <button
                className="close-btn"
                onClick={() => setShowAddModal(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmitAdd} className="model-form">
              <div className="form-group">
                <label>Model Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  placeholder="e.g., VF 10"
                />
              </div>
              <div className="form-group">
                <label>Model Year *</label>
                <input
                  type="number"
                  value={formData.modelYear}
                  onChange={(e) =>
                    setFormData({ ...formData, modelYear: e.target.value })
                  }
                  required
                  placeholder="e.g., 2025"
                  min="2020"
                  max="2030"
                />
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  Create Model
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Model Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Vehicle Model</h3>
              <button
                className="close-btn"
                onClick={() => setShowEditModal(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmitEdit} className="model-form">
              <div className="form-group">
                <label>Model Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  placeholder="e.g., VF 10"
                />
              </div>
              <div className="form-group">
                <label>Model Year *</label>
                <input
                  type="number"
                  value={formData.modelYear}
                  onChange={(e) =>
                    setFormData({ ...formData, modelYear: e.target.value })
                  }
                  required
                  placeholder="e.g., 2025"
                  min="2020"
                  max="2030"
                />
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  Update Model
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Config Modal */}
      {showConfigModal && selectedModel && (
        <ModelPackageConfigModal
          model={selectedModel}
          allModels={vehicleModels}
          onClose={() => setShowConfigModal(false)}
          onConfigUpdated={fetchVehicleModels}
        />
      )}
    </div>
  );
};

export default VehicleModelManagement;
