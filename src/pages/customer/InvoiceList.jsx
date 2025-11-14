import { useState } from 'react'
import PropTypes from 'prop-types'
import '../../styles/InvoiceList.css'

const InvoiceList = ({ invoices, onClose, onViewDetail }) => {
  const [filterStatus, setFilterStatus] = useState('ALL')

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      PAID: { text: 'Paid', class: 'paid', icon: '✅' },
      UNPAID: { text: 'Unpaid', class: 'unpaid', icon: '⏳' }
    }
    return statusMap[status] || statusMap.UNPAID
  }

  // Filter invoices based on status
  const filteredInvoices = filterStatus === 'ALL' 
    ? invoices 
    : invoices.filter(invoice => invoice.status === filterStatus)

  return (
    <div className="modal-overlay">
      <div className="invoice-list-modal">
        <div className="modal-header">
          <h2>💳 Invoice List</h2>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        {/* Filter Section */}
        <div className="filter-section">
          <div className="filter-buttons">
            <button
              className={`filter-btn ${filterStatus === 'ALL' ? 'active' : ''}`}
              onClick={() => setFilterStatus('ALL')}
            >
              All ({invoices.length})
            </button>
            <button
              className={`filter-btn ${filterStatus === 'PAID' ? 'active' : ''}`}
              onClick={() => setFilterStatus('PAID')}
            >
              Paid ({invoices.filter(i => i.status === 'PAID').length})
            </button>
            <button
              className={`filter-btn ${filterStatus === 'UNPAID' ? 'active' : ''}`}
              onClick={() => setFilterStatus('UNPAID')}
            >
              Unpaid ({invoices.filter(i => i.status === 'UNPAID').length})
            </button>
          </div>
        </div>

        <div className="modal-body">
          {filteredInvoices.length === 0 ? (
            <div className="no-invoices">
              <div className="no-invoices-icon">💳</div>
              <p>
                {filterStatus === 'ALL' 
                  ? 'You have no invoices yet.' 
                  : `No ${filterStatus === 'PAID' ? 'paid' : 'unpaid'} invoices.`}
              </p>
            </div>
          ) : (
            <div className="invoices-grid">
              {filteredInvoices.map(invoice => {
                const statusInfo = getStatusBadge(invoice.status)
                const maintenanceRecord = invoice.maintenanceRecord

                return (
                  <div 
                    key={invoice.id} 
                    className="invoice-card"
                    onClick={() => onViewDetail(invoice)}
                  >
                    <div className="invoice-card-header">
                      <div className="invoice-id">
                        <span className="label">Invoice ID:</span>
                        <span className="value">#{invoice.id}</span>
                      </div>
                      <span className={`status-badge ${statusInfo.class}`}>
                        {statusInfo.icon} {statusInfo.text}
                      </span>
                    </div>

                    <div className="invoice-card-body">
                      {/* Vehicle Info */}
                      <div className="info-row">
                        <span className="icon">🚗</span>
                        <div className="info-content">
                          <span className="info-label">Vehicle:</span>
                          <span className="info-value">
                            {maintenanceRecord?.vehicleModel} - {maintenanceRecord?.vehicleLicensePlate}
                          </span>
                        </div>
                      </div>

                      {/* Service Center */}
                      <div className="info-row">
                        <span className="icon">🏢</span>
                        <div className="info-content">
                          <span className="info-label">Center:</span>
                          <span className="info-value">{invoice.serviceCenterName}</span>
                        </div>
                      </div>

                      {/* Service Package */}
                      {maintenanceRecord?.servicePackageName && (
                        <div className="info-row">
                          <span className="icon">📦</span>
                          <div className="info-content">
                            <span className="info-label">Service package:</span>
                            <span className="info-value">{maintenanceRecord.servicePackageName}</span>
                          </div>
                        </div>
                      )}

                      {/* Technician */}
                      {maintenanceRecord?.technicianName && (
                        <div className="info-row">
                          <span className="icon">🔧</span>
                          <div className="info-content">
                            <span className="info-label">Technician:</span>
                            <span className="info-value">{maintenanceRecord.technicianName}</span>
                          </div>
                        </div>
                      )}

                      {/* Service Date */}
                      <div className="info-row">
                        <span className="icon">📅</span>
                        <div className="info-content">
                          <span className="info-label">Service date:</span>
                          <span className="info-value">{formatDate(maintenanceRecord?.performedAt)}</span>
                        </div>
                      </div>

                      {/* Service Items Count */}
                      {maintenanceRecord?.serviceItems && maintenanceRecord.serviceItems.length > 0 && (
                        <div className="info-row">
                          <span className="icon">🔨</span>
                          <div className="info-content">
                            <span className="info-label">Service items:</span>
                            <span className="info-value">{maintenanceRecord.serviceItems.length} services</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="invoice-card-footer">
                      <div className="total-amount">
                        <span className="label">Total:</span>
                        <span className="amount">{formatCurrency(invoice.totalAmount)}</span>
                      </div>
                      <button className="view-detail-btn">
                        View details →
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="close-footer-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

InvoiceList.propTypes = {
  invoices: PropTypes.array.isRequired,
  onClose: PropTypes.func.isRequired,
  onViewDetail: PropTypes.func.isRequired
}

export default InvoiceList
