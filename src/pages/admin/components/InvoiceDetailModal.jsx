import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import invoiceService from "../../../api/invoiceService";
import appointmentService from "../../../api/appointmentService";
import logger from "../../../utils/logger";
import "../../../styles/InvoiceDetailModal.css";

const InvoiceDetailModal = ({ appointmentId, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  const [appointmentData, setAppointmentData] = useState(null);

  useEffect(() => {
    if (appointmentId) {
      fetchInvoiceData();
    }
  }, [appointmentId]);

  const fetchInvoiceData = async () => {
    setLoading(true);
    try {
      // Fetch appointment details (same as "Chi tiết" button)
      const result = await appointmentService.getAppointmentById(appointmentId);

      if (result.success && result.data) {
        setAppointmentData(result.data);
      } else {
        logger.error("Failed to fetch appointment:", result.message);
        alert("Không tìm thấy thông tin appointment này!");
      }
    } catch (error) {
      logger.error("Error fetching invoice data:", error);
      alert("Có lỗi xảy ra khi tải thông tin!");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateInvoice = async () => {
    if (!appointmentId) return;

    const confirmed = window.confirm(
      "Bạn có chắc chắn muốn tạo hóa đơn cho appointment này?\n\nHóa đơn sẽ được gửi đến khách hàng để thanh toán."
    );

    if (!confirmed) return;

    setGenerating(true);
    try {
      const result = await invoiceService.generateInvoice(appointmentId);

      if (result.success) {
        setInvoiceData(result.data);
        alert(
          "Hóa đơn đã được tạo thành công!\n\nVui lòng thông báo khách hàng đăng nhập hệ thống để thanh toán."
        );
        if (onSuccess) {
          onSuccess(result.data);
        }
      } else {
        alert(`Lỗi: ${result.message}`);
      }
    } catch (error) {
      logger.error("Error generating invoice:", error);
      alert("Có lỗi xảy ra khi tạo hóa đơn!");
    } finally {
      setGenerating(false);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return "0 VND";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("vi-VN");
  };

  const calculateTotalAmount = () => {
    if (!appointmentData) return 0;

    let total = 0;

    // Add service items price
    if (appointmentData.serviceItems) {
      total += appointmentData.serviceItems.reduce(
        (sum, item) => sum + (item.price || 0),
        0
      );
    }

    // Add total cost if available
    if (appointmentData.totalCost) {
      total = appointmentData.totalCost;
    }

    return total;
  };

  if (loading) {
    return (
      <div className="modal-overlay">
        <div className="invoice-modal">
          <div className="modal-header">
            <h2>Chi Tiết Hóa Đơn</h2>
            <button className="close-btn" onClick={onClose}>
              &times;
            </button>
          </div>
          <div className="modal-body">
            <div className="loading-message">Đang tải thông tin...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!appointmentData) {
    return (
      <div className="modal-overlay">
        <div className="invoice-modal">
          <div className="modal-header">
            <h2>Chi Tiết Hóa Đơn</h2>
            <button className="close-btn" onClick={onClose}>
              &times;
            </button>
          </div>
          <div className="modal-body">
            <div className="error-message">
              Không tìm thấy thông tin appointment!
            </div>
          </div>
          <div className="modal-footer">
            <button className="cancel-btn" onClick={onClose}>
              Đóng
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="invoice-modal">
        <div className="modal-header">
          <h2>🧾 Chi Tiết Hóa Đơn</h2>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="modal-body">
          {/* Invoice Status */}
          {invoiceData && (
            <div className="invoice-status-banner success">
              ✅ Hóa đơn đã được tạo thành công!
              <div className="invoice-id">Mã hóa đơn: #{invoiceData.id}</div>
            </div>
          )}

          {/* Customer Information */}
          <div className="invoice-section">
            <h3>👤 Thông Tin Khách Hàng</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Tên Khách Hàng:</label>
                <span>{appointmentData.customerName || "N/A"}</span>
              </div>
              <div className="info-item">
                <label>Mã Khách Hàng:</label>
                <span>#{appointmentData.customerId}</span>
              </div>
            </div>
          </div>

          {/* Vehicle Information */}
          <div className="invoice-section">
            <h3>🚗 Thông Tin Xe</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Biển Số:</label>
                <span>
                  {appointmentData.vehiclePlate ||
                    appointmentData.vehicleLicensePlate ||
                    "N/A"}
                </span>
              </div>
              <div className="info-item">
                <label>Model:</label>
                <span>{appointmentData.vehicleModel || "N/A"}</span>
              </div>
              {appointmentData.vehicleId && (
                <div className="info-item">
                  <label>Mã Xe:</label>
                  <span>#{appointmentData.vehicleId}</span>
                </div>
              )}
            </div>
          </div>

          {/* Service Center Information */}
          <div className="invoice-section">
            <h3>🏢 Thông Tin Appointment</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Mã Appointment:</label>
                <span>
                  #{appointmentData.appointmentId || appointmentData.id}
                </span>
              </div>
              <div className="info-item">
                <label>Ngày Hẹn:</label>
                <span>{formatDate(appointmentData.appointmentDate)}</span>
              </div>
              <div className="info-item">
                <label>Trạng Thái:</label>
                <span
                  className={`status-badge ${appointmentData.status?.toLowerCase()}`}
                >
                  {appointmentData.status}
                </span>
              </div>
              {appointmentData.centerName && (
                <div className="info-item">
                  <label>Trung Tâm:</label>
                  <span>{appointmentData.centerName}</span>
                </div>
              )}
            </div>
          </div>

          {/* Technician Information */}
          {appointmentData.technicianName && (
            <div className="invoice-section">
              <h3>🔧 Kỹ Thuật Viên</h3>
              <div className="info-grid">
                <div className="info-item">
                  <label>Tên Kỹ Thuật Viên:</label>
                  <span>{appointmentData.technicianName}</span>
                </div>
                <div className="info-item">
                  <label>Mã KTV:</label>
                  <span>#{appointmentData.technicianId}</span>
                </div>
              </div>
            </div>
          )}

          {/* Service Package */}
          {appointmentData.servicePackageName && (
            <div className="invoice-section">
              <h3>📦 Gói Dịch Vụ</h3>
              <div className="info-grid">
                <div className="info-item">
                  <label>Tên Gói:</label>
                  <span>{appointmentData.servicePackageName}</span>
                </div>
              </div>
            </div>
          )}

          {/* Service Items */}
          {appointmentData.serviceItems &&
            appointmentData.serviceItems.length > 0 && (
              <div className="invoice-section">
                <h3>🔨 Các Hạng Mục Dịch Vụ</h3>
                <div className="service-table">
                  <table>
                    <thead>
                      <tr>
                        <th>STT</th>
                        <th>Tên Dịch Vụ</th>
                        <th>Mô Tả</th>
                        <th>Loại</th>
                        <th className="text-right">Giá</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointmentData.serviceItems.map((item, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>
                            {item.serviceItem?.name || item.name || "N/A"}
                          </td>
                          <td>
                            <small>
                              {item.serviceItem?.description ||
                                item.description ||
                                "N/A"}
                            </small>
                          </td>
                          <td>
                            <span
                              className={`action-badge ${item.actionType?.toLowerCase()}`}
                            >
                              {item.actionType || "N/A"}
                            </span>
                          </td>
                          <td className="text-right">
                            {formatCurrency(item.price)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan="4" className="text-right">
                          <strong>Tổng Dịch Vụ:</strong>
                        </td>
                        <td className="text-right">
                          <strong>
                            {formatCurrency(
                              appointmentData.serviceItems.reduce(
                                (sum, item) => sum + (item.price || 0),
                                0
                              )
                            )}
                          </strong>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}

          {/* Notes */}
          {appointmentData.notes && (
            <div className="invoice-section">
              <h3>📝 Ghi Chú</h3>
              <div className="notes-content">{appointmentData.notes}</div>
            </div>
          )}

          {/* Total Amount */}
          <div className="invoice-section total-section">
            <div className="total-row">
              <span className="total-label">💰 TỔNG CỘNG:</span>
              <span className="total-amount">
                {formatCurrency(
                  invoiceData?.totalAmount || calculateTotalAmount()
                )}
              </span>
            </div>
            {invoiceData && (
              <div className="invoice-status">
                <span className="status-label">Trạng thái:</span>
                <span
                  className={`status-badge ${invoiceData.status?.toLowerCase()}`}
                >
                  {invoiceData.status}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          {!invoiceData && (
            <button
              className="generate-invoice-btn"
              onClick={handleGenerateInvoice}
              disabled={generating}
            >
              {generating ? "⏳ Đang tạo..." : "✅ Xác Nhận Tạo Hóa Đơn"}
            </button>
          )}
          <button className="cancel-btn" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

InvoiceDetailModal.propTypes = {
  appointmentId: PropTypes.number.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
};

export default InvoiceDetailModal;
