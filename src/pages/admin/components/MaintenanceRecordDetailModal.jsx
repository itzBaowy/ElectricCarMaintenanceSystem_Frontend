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



  const getActionTypeBadge = (actionType) => {
    const badges = {
      CHECK: { text: 'Check', className: 'badge-check' },
      REPLACE: { text: 'Replace', className: 'badge-replace' },
      REFILL: { text: 'Refill', className: 'badge-refill' }
    };
    return badges[actionType] || { text: actionType, className: 'badge-default' };
  };

  const getUsageTypeBadge = (usageType) => {
    const badges = {
      INCLUDED: { text: 'Included', className: 'usage-included' },
      ADDITIONAL: { text: 'Additional', className: 'usage-additional' }
    };
    return badges[usageType] || { text: usageType, className: 'usage-default' };
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content maintenance-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Maintenance Record Details #{record.id}</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="tabs-container">
          <div className="tabs">
            <button 
              className={`tab ${activeTab === 'info' ? 'active' : ''}`}
              onClick={() => setActiveTab('info')}
            >
              General Info
            </button>
            <button 
              className={`tab ${activeTab === 'services' ? 'active' : ''}`}
              onClick={() => setActiveTab('services')}
            >
              Services ({record.serviceItems?.length || 0})
            </button>
            <button 
              className={`tab ${activeTab === 'parts' ? 'active' : ''}`}
              onClick={() => setActiveTab('parts')}
            >
              Parts ({partsUsage.length})
            </button>
            <button 
              className={`tab ${activeTab === 'invoice' ? 'active' : ''}`}
              onClick={() => setActiveTab('invoice')}
            >
              Invoice
            </button>
          </div>
        </div>

        <div className="modal-body">
          {activeTab === 'info' && (
            <div className="info-section">
              <div className="info-grid">
                <div className="info-card">
                  <h3>Customer Information</h3>
                  <div className="info-row">
                    <span className="label">Customer Name:</span>
                    <span className="value">{record.customerName}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Customer ID:</span>
                    <span className="value">{record.customerId}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Service Center:</span>
                    <span className="value">{record.serviceCenterName}</span>
                  </div>
                </div>

                <div className="info-card">
                  <h3>Vehicle Information</h3>
                  <div className="info-row">
                    <span className="label">License Plate:</span>
                    <span className="value license-plate-badge">{record.vehicleLicensePlate}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Model:</span>
                    <span className="value">{record.vehicleModel}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Vehicle ID:</span>
                    <span className="value">{record.vehicleId}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Mileage:</span>
                    <span className="value">{record.odometer?.toLocaleString('vi-VN')} km</span>
                  </div>
                </div>

                <div className="info-card">
                  <h3>Service Information</h3>
                  <div className="info-row">
                    <span className="label">Service Package:</span>
                    <span className="value">{record.servicePackageName}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Technician:</span>
                    <span className="value">{record.technicianName}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Technician ID:</span>
                    <span className="value">{record.technicianId}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Appointment ID:</span>
                    <span className="value">{record.appointmentId}</span>
                  </div>
                </div>

                <div className="info-card">
                  <h3>Time Information</h3>
                  <div className="info-row">
                    <span className="label">Performed At:</span>
                    <span className="value">{formatDate(record.performedAt)}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Created At:</span>
                    <span className="value">{formatDate(record.createdAt)}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Updated At:</span>
                    <span className="value">{formatDate(record.updatedAt)}</span>
                  </div>
                </div>
              </div>

              {record.notes && (
                <div className="notes-section">
                  <h3>Notes</h3>
                  <p>{record.notes}</p>
                </div>
              )}

              <div className="summary-card">
                <h3>Cost Summary</h3>
                <div className="summary-row total">
                  <span>Service Cost:</span>
                  <span className="amount">{formatCurrency(record.totalPrice || 0)}</span>
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
                  <div className="no-data">No services found</div>
                )}
              </div>
              <div className="section-total">
                <strong>Total Service Cost: {formatCurrency(record.totalPrice || 0)}</strong>
              </div>
            </div>
          )}

          {activeTab === 'parts' && (
            <div className="parts-section">
              {loadingParts ? (
                <div className="loading">Loading parts...</div>
              ) : partsUsage.length > 0 ? (
                <>
                  <table className="parts-table">
                    <thead>
                      <tr>
                        <th>Part Name</th>
                        <th>Part Number</th>
                        <th>Quantity</th>
                        <th>Type</th>
                        <th>Time</th>
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
                <div className="no-data">No parts used</div>
              )}
            </div>
          )}

          {activeTab === 'invoice' && (
            <div className="invoice-section">
              {loadingInvoice ? (
                <div className="loading">Loading invoice information...</div>
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
                            ? 'Paid'
                            : 'Unpaid'
                          : 'Invoice Not Created'}
                      </h3>
                      <p>
                        {invoiceData
                          ? `Invoice ID: #${invoiceData.id}`
                          : 'Invoice will be created after maintenance completion'}
                      </p>
                    </div>
                  </div>

                  {invoiceData ? (
                    <div className="invoice-details">
                      {/* Invoice Information */}
                      <div className="info-card">
                        <h3>Invoice Information</h3>
                        <div className="info-row">
                          <span className="label">Invoice ID:</span>
                          <span className="value">#{invoiceData.id}</span>
                        </div>
                        <div className="info-row">
                          <span className="label">Status:</span>
                          <span className="value">
                            <span className={`status-badge-inline ${
                              invoiceData.status === 'PAID' ? 'paid' : 'unpaid'
                            }`}>
                              {invoiceData.status === 'PAID' ? 'Paid' : 'Unpaid'}
                            </span>
                          </span>
                        </div>
                        <div className="info-row">
                          <span className="label">Total Amount:</span>
                          <span className="value price-highlight">{formatCurrency(invoiceData.totalAmount)}</span>
                        </div>
                        <div className="info-row">
                          <span className="label">Created Date:</span>
                          <span className="value">{formatDate(invoiceData.createdAt)}</span>
                        </div>
                        {invoiceData.paidAt && (
                          <div className="info-row">
                            <span className="label">Payment Date:</span>
                            <span className="value">{formatDate(invoiceData.paidAt)}</span>
                          </div>
                        )}
                        {invoiceData.paymentMethod && (
                          <div className="info-row">
                            <span className="label">Payment Method:</span>
                            <span className="value">{invoiceData.paymentMethod}</span>
                          </div>
                        )}
                      </div>

                      {/* Service Center Info */}
                      {invoiceData.serviceCenterName && (
                        <div className="info-card">
                          <h3>Service Center</h3>
                          <div className="info-row">
                            <span className="label">Center Name:</span>
                            <span className="value">{invoiceData.serviceCenterName}</span>
                          </div>
                          {invoiceData.serviceCenterAddress && (
                            <div className="info-row">
                              <span className="label">Address:</span>
                              <span className="value">{invoiceData.serviceCenterAddress}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Payment Details */}
                      {invoiceData.status === 'PAID' && (
                        <div className="payment-success-card">
                          <div className="success-icon">✅</div>
                          <h3>Payment Successful</h3>
                          <p>Invoice has been paid in full</p>
                          {invoiceData.paidAt && (
                            <p className="payment-time">
                              Time: {formatDate(invoiceData.paidAt)}
                            </p>
                          )}
                        </div>
                      )}

                      {invoiceData.status === 'UNPAID' && (
                        <div className="payment-pending-card">
                          <div className="pending-icon">⏳</div>
                          <h3>Pending Payment</h3>
                          <p>Please notify customer to login to the system for payment</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="no-invoice-card">
                      <div className="no-invoice-icon">📝</div>
                      <h3>Invoice Not Created</h3>
                      <p>Invoice will be automatically created after completing maintenance steps</p>
                      <ul className="invoice-steps">
                        <li>✓ Complete maintenance</li>
                        <li>✓ Technician confirmation</li>
                        <li>✓ Customer approval</li>
                        <li>→ Create invoice</li>
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn-close">Close</button>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceRecordDetailModal;
