import { useState, useEffect } from "react";
import vehicleModelService from "../../../api/vehicleModelService";
import "../../../styles/VehicleModelManagement.css";

const VehicleModelManagement = () => {
  const [vehicleModels, setVehicleModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

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

  const filteredModels = vehicleModels.filter(
    (model) =>
      model.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      model.modelYear?.toString().includes(searchTerm)
  );

  return (
    <div className="vehicle-model-management">
      <div className="management-header">
        <div className="header-info">
          <h2>Vehicle Model Management</h2>
          <p>View all available vehicle models in the system</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="search-section">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by model name or year..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
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
              <div className="stat-icon">🚗</div>
              <div className="stat-details">
                <p className="stat-label">Total Models</p>
                <h3 className="stat-value">{vehicleModels.length}</h3>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🔍</div>
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
                  <th>Created By</th>
                  <th>Updated By</th>
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
                      <td>{model.createdBy || "N/A"}</td>
                      <td>{model.updatedBy || "N/A"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="no-data">
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
    </div>
  );
};

export default VehicleModelManagement;
