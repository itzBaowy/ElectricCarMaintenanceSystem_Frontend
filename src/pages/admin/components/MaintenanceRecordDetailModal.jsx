import React, { useState, useEffect } from 'react';
import { getMaintenanceRecordParts } from '../../../api/maintenanceRecordService';
import '../../../styles/MaintenanceRecordDetailModal.css';

const MaintenanceRecordDetailModal = ({ record, onClose }) => {
  const [partsUsage, setPartsUsage] = useState([]);
  const [loadingParts, setLoadingParts] = useState(false);
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    if (record?.id) {
      fetchPartsUsage();
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
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn-close">Đóng</button>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceRecordDetailModal;
