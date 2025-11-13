import React, { useState, useEffect } from 'react';
import { getMaintenanceRecordParts } from '../../../api/maintenanceRecordService';
import invoiceService from '../../../api/invoiceService';
import '../../../styles/MaintenanceRecordDetailModal.css';

const MaintenanceRecordDetailModal = ({ record, onClose }) => {
  const [partsUsage, setPartsUsage] = useState([]);
  const [loadingParts, setLoadingParts] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  const [loadingInvoice, setLoadingInvoice] = useState(false);
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    if (record?.id) {
      fetchPartsUsage();
      fetchInvoiceData();
    }
  }, [record?.id]);

  const fetchPartsUsage = async () => {
    try {
      setLoadingParts(true);
      const response = await getMaintenanceRecordParts(record.id);
      if (response.code === 1000) {
        setPartsUsage(response.result);
      }
    } catch (err) {
      console.error('Error fetching parts usage:', err);
    } finally {
      setLoadingParts(false);
    }
  };

  const fetchInvoiceData = async () => {
    if (!record.appointmentId) return;
    
    try {
      setLoadingInvoice(true);
      const result = await invoiceService.getInvoiceByAppointmentId(record.appointmentId);
      if (result.success && result.data) {
        setInvoiceData(result.data);
      }
    } catch (err) {
      console.error('Error fetching invoice data:', err);
    } finally {
      setLoadingInvoice(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const calculateServiceItemsTotal = () => {
    return record.serviceItems?.reduce((sum, item) => sum + (item.price || 0), 0) || 0;
  };

  const getActionTypeBadge = (actionType) => {
    const badges = {
      CHECK: { text: 'Kiểm tra', className: 'badge-check' },
      REPLACE: { text: 'Thay thế', className: 'badge-replace' },
      REFILL: { text: 'Bổ sung', className: 'badge-refill' }
    };
    return badges[actionType] || { text: actionType, className: 'badge-default' };
  };

  const getUsageTypeBadge = (usageType) => {
    const badges = {
      INCLUDED: { text: 'Bao gồm', className: 'usage-included' },
      ADDITIONAL: { text: 'Phát sinh', className: 'usage-additional' }
    };
    return badges[usageType] || { text: usageType, className: 'usage-default' };
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content maintenance-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Chi Tiết Hồ Sơ Bảo Dưỡng #{record.id}</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="tabs-container">
          <div className="tabs">
            <button 
              className={`tab ${activeTab === 'info' ? 'active' : ''}`}
              onClick={() => setActiveTab('info')}
            >
              Thông tin chung
            </button>
            <button 
              className={`tab ${activeTab === 'services' ? 'active' : ''}`}
              onClick={() => setActiveTab('services')}
            >
              Dịch vụ ({record.serviceItems?.length || 0})
            </button>
            <button 
              className={`tab ${activeTab === 'parts' ? 'active' : ''}`}
              onClick={() => setActiveTab('parts')}
            >
              Phụ tùng ({partsUsage.length})
            </button>
            <button 
              className={`tab ${activeTab === 'invoice' ? 'active' : ''}`}
              onClick={() => setActiveTab('invoice')}
            >
              Hóa đơn
            </button>
          </div>
        </div>

        <div className="modal-body">
          {activeTab === 'info' && (
            <div className="info-section">
              <div className="info-grid">
                <div className="info-card">
                  <h3>Thông tin khách hàng</h3>
                  <div className="info-row">
                    <span className="label">Tên khách hàng:</span>
                    <span className="value">{record.customerName}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">ID khách hàng:</span>
                    <span className="value">{record.customerId}</span>
                  </div>
                </div>

                <div className="info-card">
                  <h3>Thông tin xe</h3>
                  <div className="info-row">
                    <span className="label">Biển số:</span>
                    <span className="value license-plate-badge">{record.vehicleLicensePlate}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Model:</span>
                    <span className="value">{record.vehicleModel}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">ID xe:</span>
                    <span className="value">{record.vehicleId}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Số km:</span>
                    <span className="value">{record.odometer?.toLocaleString('vi-VN')} km</span>
                  </div>
                </div>

                <div className="info-card">
                  <h3>Thông tin dịch vụ</h3>
                  <div className="info-row">
                    <span className="label">Gói dịch vụ:</span>
                    <span className="value">{record.servicePackageName}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Kỹ thuật viên:</span>
                    <span className="value">{record.technicianName}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">ID kỹ thuật viên:</span>
                    <span className="value">{record.technicianId}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">ID lịch hẹn:</span>
                    <span className="value">{record.appointmentId}</span>
                  </div>
                </div>

                <div className="info-card">
                  <h3>Thời gian</h3>
                  <div className="info-row">
                    <span className="label">Thực hiện:</span>
                    <span className="value">{formatDate(record.performedAt)}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Tạo lúc:</span>
                    <span className="value">{formatDate(record.createdAt)}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Cập nhật:</span>
                    <span className="value">{formatDate(record.updatedAt)}</span>
                  </div>
                </div>
              </div>

              {record.notes && (
                <div className="notes-section">
                  <h3>Ghi chú</h3>
                  <p>{record.notes}</p>
                </div>
              )}

              <div className="summary-card">
                <h3>Tổng quan chi phí</h3>
                <div className="summary-row total">
                  <span>Chi phí dịch vụ:</span>
                  <span className="amount">{formatCurrency(calculateServiceItemsTotal())}</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'services' && (
            <div className="services-section">
              <div className="services-list">
                {record.serviceItems && record.serviceItems.length > 0 ? (
                  record.serviceItems.map((item, index) => {
                    const badge = getActionTypeBadge(item.actionType);
                    return (
                      <div key={index} className="service-item-card">
                        <div className="service-header">
                          <h4>{item.serviceItem.name}</h4>
                          <span className={`action-badge ${badge.className}`}>
                            {badge.text}
                          </span>
                        </div>
                        <p className="service-description">{item.serviceItem.description}</p>
                        <div className="service-footer">
                          <span className="service-id">ID: {item.serviceItem.id}</span>
                          <span className="service-price">{formatCurrency(item.price)}</span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="no-data">Không có dịch vụ nào</div>
                )}
              </div>
              <div className="section-total">
                <strong>Tổng chi phí dịch vụ: {formatCurrency(calculateServiceItemsTotal())}</strong>
              </div>
            </div>
          )}

          {activeTab === 'parts' && (
            <div className="parts-section">
              {loadingParts ? (
                <div className="loading">Đang tải phụ tùng...</div>
              ) : partsUsage.length > 0 ? (
                <>
                  <table className="parts-table">
                    <thead>
                      <tr>
                        <th>Tên phụ tùng</th>
                        <th>Mã phụ tùng</th>
                        <th>Số lượng</th>
                        <th>Loại</th>
                        <th>Thời gian</th>
                      </tr>
                    </thead>
                    <tbody>
                      {partsUsage.map((part, index) => {
                        const usageBadge = getUsageTypeBadge(part.usageType);
                        return (
                          <tr key={index}>
                            <td>{part.sparePartName}</td>
                            <td className="part-number">{part.sparePartNumber}</td>
                            <td className="text-center">{part.quantityUsed}</td>
                            <td>
                              <span className={`usage-badge ${usageBadge.className}`}>
                                {usageBadge.text}
                              </span>
                            </td>
                            <td>{formatDate(part.createdAt)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </>
              ) : (
                <div className="no-data">Không có phụ tùng nào được sử dụng</div>
              )}
            </div>
          )}

          {activeTab === 'invoice' && (
            <div className="invoice-section">
              {loadingInvoice ? (
                <div className="loading">Đang tải thông tin hóa đơn...</div>
              ) : (
                <>
                  {/* Invoice Status Banner */}
                  <div className={`invoice-status-banner ${
                    invoiceData
                      ? invoiceData.status === 'PAID'
                        ? 'invoice-paid'
                        : 'invoice-unpaid'
                      : 'invoice-not-created'
                  }`}>
                    <div className="status-icon">
                      {invoiceData ? (
                        invoiceData.status === 'PAID' ? '✅' : '⏳'
                      ) : '📝'}
                    </div>
                    <div className="status-content">
                      <h3>
                        {invoiceData
                          ? invoiceData.status === 'PAID'
                            ? 'Đã thanh toán'
                            : 'Chưa thanh toán'
                          : 'Hóa đơn chưa được tạo'}
                      </h3>
                      <p>
                        {invoiceData
                          ? `Mã hóa đơn: #${invoiceData.id}`
                          : 'Hóa đơn sẽ được tạo sau khi hoàn thành bảo dưỡng'}
                      </p>
                    </div>
                  </div>

                  {invoiceData ? (
                    <div className="invoice-details">
                      {/* Invoice Information */}
                      <div className="info-card">
                        <h3>Thông tin hóa đơn</h3>
                        <div className="info-row">
                          <span className="label">Mã hóa đơn:</span>
                          <span className="value">#{invoiceData.id}</span>
                        </div>
                        <div className="info-row">
                          <span className="label">Trạng thái:</span>
                          <span className="value">
                            <span className={`status-badge-inline ${
                              invoiceData.status === 'PAID' ? 'paid' : 'unpaid'
                            }`}>
                              {invoiceData.status === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                            </span>
                          </span>
                        </div>
                        <div className="info-row">
                          <span className="label">Tổng số tiền:</span>
                          <span className="value price-highlight">{formatCurrency(invoiceData.totalAmount)}</span>
                        </div>
                        <div className="info-row">
                          <span className="label">Ngày tạo:</span>
                          <span className="value">{formatDate(invoiceData.createdAt)}</span>
                        </div>
                        {invoiceData.paidAt && (
                          <div className="info-row">
                            <span className="label">Ngày thanh toán:</span>
                            <span className="value">{formatDate(invoiceData.paidAt)}</span>
                          </div>
                        )}
                        {invoiceData.paymentMethod && (
                          <div className="info-row">
                            <span className="label">Phương thức thanh toán:</span>
                            <span className="value">{invoiceData.paymentMethod}</span>
                          </div>
                        )}
                      </div>

                      {/* Service Center Info */}
                      {invoiceData.serviceCenterName && (
                        <div className="info-card">
                          <h3>Trung tâm dịch vụ</h3>
                          <div className="info-row">
                            <span className="label">Tên trung tâm:</span>
                            <span className="value">{invoiceData.serviceCenterName}</span>
                          </div>
                          {invoiceData.serviceCenterAddress && (
                            <div className="info-row">
                              <span className="label">Địa chỉ:</span>
                              <span className="value">{invoiceData.serviceCenterAddress}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Payment Details */}
                      {invoiceData.status === 'PAID' && (
                        <div className="payment-success-card">
                          <div className="success-icon">✅</div>
                          <h3>Thanh toán thành công</h3>
                          <p>Hóa đơn đã được thanh toán đầy đủ</p>
                          {invoiceData.paidAt && (
                            <p className="payment-time">
                              Thời gian: {formatDate(invoiceData.paidAt)}
                            </p>
                          )}
                        </div>
                      )}

                      {invoiceData.status === 'UNPAID' && (
                        <div className="payment-pending-card">
                          <div className="pending-icon">⏳</div>
                          <h3>Chờ thanh toán</h3>
                          <p>Vui lòng thông báo khách hàng đăng nhập hệ thống để thanh toán</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="no-invoice-card">
                      <div className="no-invoice-icon">📝</div>
                      <h3>Hóa đơn chưa được tạo</h3>
                      <p>Hóa đơn sẽ được tạo tự động sau khi hoàn thành các bước bảo dưỡng</p>
                      <ul className="invoice-steps">
                        <li>✓ Hoàn thành bảo dưỡng</li>
                        <li>✓ Kỹ thuật viên xác nhận</li>
                        <li>✓ Khách hàng duyệt dịch vụ</li>
                        <li>→ Tạo hóa đơn</li>
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn-close">Đóng</button>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceRecordDetailModal;
