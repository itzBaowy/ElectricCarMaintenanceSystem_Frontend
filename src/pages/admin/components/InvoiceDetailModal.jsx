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
      const appointmentResult = await appointmentService.getAppointmentById(
        appointmentId
      );

      if (appointmentResult.success && appointmentResult.data) {
        setAppointmentData(appointmentResult.data);

        // Check if invoice already exists for this appointment
        const invoiceResult = await invoiceService.getInvoiceByAppointmentId(
          appointmentId
        );

        if (invoiceResult.success && invoiceResult.data) {
          // Invoice exists (PAID or UNPAID)
          setInvoiceData(invoiceResult.data);
          logger.log("Existing invoice found:", invoiceResult.data);
        } else {
          // No invoice exists yet - status will be "NOT CREATED"
          logger.log("No invoice found for this appointment");
        }
      } else {
        logger.error("Failed to fetch appointment:", appointmentResult.message);
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

  const getTotalAmount = () => {
    // Invoice totalAmount (if exists)
    if (invoiceData?.totalAmount) {
      return invoiceData.totalAmount;
    }

    // Appointment totalCost (fallback)
    return appointmentData?.estimatedCost;
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
          {/* Invoice Status Banner */}
          <div
            className={`invoice-status-banner ${
              invoiceData
                ? invoiceData.status === "PAID"
                  ? "success"
                  : "warning"
                : "info"
            }`}
          >
            {invoiceData ? (
              <>
                {invoiceData.status === "PAID" ? "✅" : "⏳"} Hóa đơn:{" "}
                {invoiceData.status === "PAID"
                  ? "Đã thanh toán"
                  : "Chưa thanh toán"}
                <div className="invoice-id">Mã hóa đơn: #{invoiceData.id}</div>
              </>
            ) : (
              <>
                📝 Trạng thái hóa đơn: <strong>NOT CREATED</strong>
                <div className="invoice-id">Hóa đơn chưa được tạo</div>
              </>
            )}
          </div>

          {/* Customer Information */}
          <div className="invoice-section">
            <h3>👤 Thông Tin Khách Hàng</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Tên Khách Hàng:</label>
                <span>
                  {invoiceData?.maintenanceRecord?.customerName ||
                    appointmentData.customerName ||
                    "N/A"}
                </span>
              </div>
              <div className="info-item">
                <label>Mã Khách Hàng:</label>
                <span>
                  #
                  {invoiceData?.maintenanceRecord?.customerId ||
                    appointmentData.customerId}
                </span>
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
                  {invoiceData?.maintenanceRecord?.vehicleLicensePlate ||
                    appointmentData.vehiclePlate ||
                    appointmentData.vehicleLicensePlate ||
                    "N/A"}
                </span>
              </div>
              <div className="info-item">
                <label>Model:</label>
                <span>
                  {invoiceData?.maintenanceRecord?.vehicleModel ||
                    appointmentData.vehicleModel ||
                    "N/A"}
                </span>
              </div>
              <div className="info-item">
                <label>Mã Xe:</label>
                <span>
                  #
                  {invoiceData?.maintenanceRecord?.vehicleId ||
                    appointmentData.vehicleId}
                </span>
              </div>
              {invoiceData?.maintenanceRecord?.odometer && (
                <div className="info-item">
                  <label>Số Km:</label>
                  <span>
                    {invoiceData.maintenanceRecord.odometer.toLocaleString()} km
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Service Center Information */}
          <div className="invoice-section">
            <h3>🏢 Thông Tin Appointment & Trung Tâm</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Mã Appointment:</label>
                <span>
                  #
                  {invoiceData?.maintenanceRecord?.appointmentId ||
                    appointmentData.appointmentId ||
                    appointmentData.id}
                </span>
              </div>
              <div className="info-item">
                <label>Ngày Hẹn:</label>
                <span>
                  {formatDate(
                    invoiceData?.maintenanceRecord?.performedAt ||
                      appointmentData.appointmentDate
                  )}
                </span>
              </div>
              <div className="info-item">
                <label>Trạng Thái:</label>
                <span
                  className={`status-badge ${appointmentData.status?.toLowerCase()}`}
                >
                  {appointmentData.status}
                </span>
              </div>
              {(invoiceData?.serviceCenterName ||
                appointmentData.centerName) && (
                <div className="info-item">
                  <label>Trung Tâm:</label>
                  <span>
                    {invoiceData?.serviceCenterName ||
                      appointmentData.centerName}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Technician Information */}
          {(invoiceData?.maintenanceRecord?.technicianName ||
            appointmentData.technicianName) && (
            <div className="invoice-section">
              <h3>🔧 Kỹ Thuật Viên</h3>
              <div className="info-grid">
                <div className="info-item">
                  <label>Tên Kỹ Thuật Viên:</label>
                  <span>
                    {invoiceData?.maintenanceRecord?.technicianName ||
                      appointmentData.technicianName}
                  </span>
                </div>
                <div className="info-item">
                  <label>Mã KTV:</label>
                  <span>
                    #
                    {invoiceData?.maintenanceRecord?.technicianId ||
                      appointmentData.technicianId}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Service Package */}
          {(invoiceData?.maintenanceRecord?.servicePackageName ||
            appointmentData.servicePackageName) && (
            <div className="invoice-section">
              <h3>📦 Gói Dịch Vụ</h3>
              <div className="info-grid">
                <div className="info-item">
                  <label>Tên Gói:</label>
                  <span>
                    {invoiceData?.maintenanceRecord?.servicePackageName ||
                      appointmentData.servicePackageName}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Service Items */}
          {((invoiceData?.maintenanceRecord?.serviceItems &&
            invoiceData.maintenanceRecord.serviceItems.length > 0) ||
            (appointmentData.serviceItems &&
              appointmentData.serviceItems.length > 0)) && (
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
                    {(
                      invoiceData?.maintenanceRecord?.serviceItems ||
                      appointmentData.serviceItems
                    ).map((item, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{item.serviceItem?.name || item.name || "N/A"}</td>
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
                {formatCurrency(getTotalAmount())}
              </span>
            </div>
            <div className="invoice-status">
              <span className="status-label">Trạng thái hóa đơn:</span>
              <span
                className={`status-badge ${
                  invoiceData
                    ? invoiceData.status?.toLowerCase()
                    : "not-created"
                }`}
              >
                {invoiceData ? invoiceData.status : "NOT CREATED"}
              </span>
            </div>
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
