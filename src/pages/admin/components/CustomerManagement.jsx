import { useState, useEffect } from "react";
import customerService from "../../../api/customerService";
import authService from "../../../api/authService";
import logger from "../../../utils/logger";
import "../../../styles/CustomerManagement.css";

const CustomerManagement = () => {
  const [customers, setCustomers] = useState([]);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState({
    id: "",
    fullName: "",
    username: "",
    email: "",
    phone: "",
    gender: "MALE",
  });
  const [addFormData, setAddFormData] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    gender: "MALE",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Load customers from API
  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    setIsLoading(true);
    try {
      const result = await customerService.getAllCustomers();

      if (result.success && result.data) {
        const customersWithJoinDate = result.data.map((customer) => ({
          ...customer,
          joinDate: new Date(customer.createdAt).toISOString().split("T")[0],
        }));

        // Sort by creation date (newest first)
        customersWithJoinDate.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        setCustomers(customersWithJoinDate);
        logger.log("Loaded customers:", customersWithJoinDate);
      } else {
        logger.error("Failed to load customers:", result.message);
        alert(result.message || "Failed to load customers");
      }
    } catch (error) {
      logger.error("Error loading customers:", error);
      alert("Failed to load customers. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddInputChange = (e) => {
    const { name, value } = e.target;
    setAddFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      id: "",
      fullName: "",
      username: "",
      email: "",
      phone: "",
      gender: "MALE",
    });
    setEditingCustomer(null);
    setShowEditForm(false);
  };

  const resetAddForm = () => {
    setAddFormData({
      fullName: "",
      phoneNumber: "",
      email: "",
      gender: "MALE",
    });
    setShowAddForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!editingCustomer) {
      alert("This form is for editing only. Customers register themselves.");
      return;
    }

    try {
      // Prepare update data (only editable fields)
      const updateData = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        gender: formData.gender,
      };
      logger.log("Updating customer with data:", updateData);

      const result = await customerService.updateCustomer(
        editingCustomer.id,
        updateData
      );

      if (result && result.success) {
        alert(`${formData.fullName} updated successfully!`);
        resetForm();
        // Refresh the customer list
        loadCustomers();
      } else {
        alert(
          `Failed to update customer: ${result?.message || "Unknown error"}`
        );
      }
    } catch (error) {
      logger.error("Error updating customer:", error);
      alert("An error occurred while updating customer");
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();

    if (
      !addFormData.fullName ||
      !addFormData.phoneNumber ||
      !addFormData.email
    ) {
      alert("Vui lòng điền đầy đủ thông tin khách hàng!");
      return;
    }

    try {
      // Create customer account using register API from authService
      const registerData = {
        username: addFormData.phoneNumber, // Phone number as username
        password: addFormData.phoneNumber, // Default password = phone number
        fullName: addFormData.fullName,
        email: addFormData.email,
        phone: addFormData.phoneNumber,
        gender: addFormData.gender,
      };

      logger.log("Creating customer with data:", registerData);
      const result = await authService.register(registerData);

      if (result.success) {
        alert(
          `Tài khoản đã được tạo thành công!\n\nThông tin đăng nhập:\nUsername: ${addFormData.phoneNumber}\nPassword: ${addFormData.phoneNumber}\n\nVui lòng thông báo cho khách hàng.`
        );
        resetAddForm();
        // Refresh the customer list
        loadCustomers();
      } else {
        alert(`Lỗi: ${result.message}`);
      }
    } catch (error) {
      logger.error("Error creating customer:", error);
      alert("Có lỗi xảy ra khi tạo tài khoản!");
    }
  };

  const handleEdit = (customer) => {
    setFormData(customer);
    setEditingCustomer(customer);
    setShowEditForm(true);
  };

  const handleDelete = async (customer) => {
    if (
      !window.confirm(
        `Are you sure you want to delete customer ${customer.fullName}?`
      )
    ) {
      return;
    }

    try {
      const result = await customerService.deleteCustomer(customer.id);

      if (result && result.success) {
        alert(`${customer.fullName} deleted successfully!`);
        // Refresh the customer list
        loadCustomers();
      } else {
        alert(
          `Failed to delete customer: ${result?.message || "Unknown error"}`
        );
      }
    } catch (error) {
      logger.error("Error deleting customer:", error);
      alert("An error occurred while deleting customer");
    }
  };

  // Filter customers
  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.phone &&
        customer.phone.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  return (
    <div className="customer-management">
      {/* Header Actions */}
      <div className="management-header">
        <div className="search-filters">
          <input
            type="text"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />

          <button
            className="refresh-btn"
            onClick={loadCustomers}
            disabled={isLoading}
            title="Refresh customer list"
          >
            {isLoading ? "" : "↻"}
          </button>
        </div>

        <button
          className="add-customer-btn"
          onClick={() => setShowAddForm(true)}
          title="Add new customer"
        >
          + Add Customer
        </button>
      </div>

      {/* Customer Add Form Modal */}
      {showAddForm && (
        <div className="modal-overlay">
          <div className="customer-form-modal">
            <div className="modal-header">
              <h3>Tạo Tài Khoản Khách Hàng</h3>
              <button className="close-btn" onClick={resetAddForm}>
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="customer-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="add-fullName">Họ và Tên *</label>
                  <input
                    type="text"
                    id="add-fullName"
                    name="fullName"
                    value={addFormData.fullName}
                    onChange={handleAddInputChange}
                    required
                    placeholder="Nguyễn Văn A"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="add-phoneNumber">Số Điện Thoại *</label>
                  <input
                    type="tel"
                    id="add-phoneNumber"
                    name="phoneNumber"
                    value={addFormData.phoneNumber}
                    onChange={handleAddInputChange}
                    required
                    placeholder="0123456789"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="add-email">Email *</label>
                  <input
                    type="email"
                    id="add-email"
                    name="email"
                    value={addFormData.email}
                    onChange={handleAddInputChange}
                    required
                    placeholder="email@example.com"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="add-gender">Giới Tính *</label>
                  <select
                    id="add-gender"
                    name="gender"
                    value={addFormData.gender}
                    onChange={handleAddInputChange}
                    required
                  >
                    <option value="MALE">Nam</option>
                    <option value="FEMALE">Nữ</option>
                    <option value="OTHER">Khác</option>
                  </select>
                </div>
              </div>

              <div className="info-note" style={{ 
                background: "#e3f2fd", 
                border: "1px solid #2196f3", 
                padding: "12px", 
                borderRadius: "6px",
                marginBottom: "20px"
              }}>
                <p style={{ margin: 0, fontSize: "0.9rem", color: "#1976d2" }}>
                  <strong>📝 Lưu ý:</strong> Tài khoản sẽ được tạo với thông tin:<br/>
                  • Username: Số điện thoại<br/>
                  • Password: Số điện thoại<br/>
                  • Khách hàng nên đổi mật khẩu sau khi đăng nhập lần đầu
                </p>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={resetAddForm}
                  className="cancel-btn"
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

      {/* Customer Edit Form Modal */}
      {showEditForm && editingCustomer && (
        <div className="modal-overlay">
          <div className="customer-form-modal">
            <div className="modal-header">
              <h3>Edit Customer</h3>
              <button className="close-btn" onClick={resetForm}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="customer-form">
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
                  <label htmlFor="username">Username</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    disabled
                    style={{
                      background: "#f0f4f8",
                      cursor: "not-allowed",
                    }}
                  />
                  <small
                    style={{
                      color: "#666",
                      fontSize: "0.85rem",
                      marginTop: "4px",
                      display: "block",
                    }}
                  >
                    Username cannot be changed
                  </small>
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
              </div>

              <div className="form-row">
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

                <div className="form-group">
                  <label htmlFor="joinDate">Join Date</label>
                  <input
                    type="text"
                    id="joinDate"
                    value={formData.joinDate || "N/A"}
                    disabled
                    className="disabled-input"
                    style={{ background: "#f0f4f8", cursor: "not-allowed" }}
                  />
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
                  Update Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer List */}
      <div className="customer-list">
        <div className="list-header">
          <h3>Customers ({filteredCustomers.length})</h3>
        </div>

        {isLoading ? (
          <div className="loading-state">
            <p> Loading customers...</p>
          </div>
        ) : (
          <div className="customer-table">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Gender</th>
                  <th>Join Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id}>
                    <td>{customer.id}</td>
                    <td>{customer.fullName}</td>
                    <td>{customer.username}</td>
                    <td>{customer.email}</td>
                    <td>{customer.phone || "N/A"}</td>
                    <td>
                      <span className="gender-badge">
                        {customer.gender === "MALE"
                          ? " Male"
                          : customer.gender === "FEMALE"
                          ? " Female"
                          : " Other"}
                      </span>
                    </td>
                    <td>{customer.joinDate}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="edit-btn"
                          onClick={() => handleEdit(customer)}
                          title="Edit Customer"
                        >
                          Edit
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => handleDelete(customer)}
                          title="Delete Customer"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredCustomers.length === 0 && (
              <div className="empty-state">
                <p>No customers found matching your criteria.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerManagement;
