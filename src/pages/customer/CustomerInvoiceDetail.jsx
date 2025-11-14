import { useState } from 'react'
import PropTypes from 'prop-types'
import vnpayService from '../../api/vnpayService'
import logger from '../../utils/logger'
import '../../styles/CustomerInvoiceDetail.css'

const CustomerInvoiceDetail = ({ invoice, onClose }) => {
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const formatCurrency = (amount) => {
    if (!amount) return '0 VND'
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString('vi-VN')
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      PAID: { text: 'Paid', class: 'paid', icon: '✅' },
      UNPAID: { text: 'Unpaid', class: 'unpaid', icon: '⏳' }
    }
    return statusMap[status] || statusMap.UNPAID
  }

  const maintenanceRecord = invoice.maintenanceRecord
  const statusInfo = getStatusBadge(invoice.status)

  const handlePayment = async () => {
    if (isProcessingPayment) return

    const confirmed = window.confirm(
      `Confirm payment for invoice #${invoice.id}\n\nAmount: ${formatCurrency(invoice.totalAmount)}\n\nYou will be redirected to VNPay payment page.`
    )

    if (!confirmed) return

    setIsProcessingPayment(true)

    try {
      logger.log('Creating VNPay payment for invoice:', invoice.id)
      
      const result = await vnpayService.createPayment(invoice.id, 'NCB')

      if (result.success && result.data?.paymentUrl) {
        logger.log('Payment URL created:', result.data.paymentUrl)
        logger.log('Transaction code:', result.data.transactionCode)

        // Open payment URL in new tab
        window.open(result.data.paymentUrl, '_blank')
      } else {
        alert(`Unable to create payment: ${result.message}`)
        logger.error('Payment creation failed:', result.message)
      }
    } catch (error) {
      logger.error('Payment error:', error)
      alert('An error occurred while creating payment. Please try again!')
    } finally {
      setIsProcessingPayment(false)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="customer-invoice-modal">
        <div className="modal-header">
          <h2>🧾 Invoice Details</h2>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="modal-body">
          {/* Invoice Status Banner */}
          <div className={`invoice-status-banner ${statusInfo.class}`}>
            {statusInfo.icon} Status: <strong>{statusInfo.text}</strong>
            <div className="invoice-id">Invoice ID: #{invoice.id}</div>
          </div>

          {/* Customer Information */}
          <div className="invoice-section">
            <h3>👤 Customer Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Customer Name:</label>
                <span>{maintenanceRecord?.customerName || 'N/A'}</span>
              </div>
              <div className="info-item">
                <label>Customer ID:</label>
                <span>#{maintenanceRecord?.customerId}</span>
              </div>
            </div>
          </div>

          {/* Vehicle Information */}
          <div className="invoice-section">
            <h3>🚗 Vehicle Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>License Plate:</label>
                <span>{maintenanceRecord?.vehicleLicensePlate || 'N/A'}</span>
              </div>
              <div className="info-item">
                <label>Model:</label>
                <span>{maintenanceRecord?.vehicleModel || 'N/A'}</span>
              </div>
              <div className="info-item">
                <label>Vehicle ID:</label>
                <span>#{maintenanceRecord?.vehicleId}</span>
              </div>
              {maintenanceRecord?.odometer && (
                <div className="info-item">
                  <label>Mileage:</label>
                  <span>{maintenanceRecord.odometer.toLocaleString()} km</span>
                </div>
              )}
            </div>
          </div>

          {/* Service Center Information */}
          <div className="invoice-section">
            <h3>🏢 Service Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Service Center:</label>
                <span>{invoice.serviceCenterName}</span>
              </div>
              <div className="info-item">
                <label>Appointment ID:</label>
                <span>#{maintenanceRecord?.appointmentId}</span>
              </div>
              <div className="info-item">
                <label>Service Date:</label>
                <span>{formatDate(maintenanceRecord?.performedAt)}</span>
              </div>
              <div className="info-item">
                <label>Invoice Date:</label>
                <span>{formatDate(invoice.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Technician Information */}
          {maintenanceRecord?.technicianName && (
            <div className="invoice-section">
              <h3>🔧 Technician</h3>
              <div className="info-grid">
                <div className="info-item">
                  <label>Technician Name:</label>
                  <span>{maintenanceRecord.technicianName}</span>
                </div>
                <div className="info-item">
                  <label>Technician ID:</label>
                  <span>#{maintenanceRecord.technicianId}</span>
                </div>
              </div>
            </div>
          )}

          {/* Service Package */}
          {maintenanceRecord?.servicePackageName && (
            <div className="invoice-section">
              <h3>📦 Service Package</h3>
              <div className="package-info">
                <div className="package-name">{maintenanceRecord.servicePackageName}</div>
              </div>
            </div>
          )}

          {/* Service Items */}
          {maintenanceRecord?.serviceItems && maintenanceRecord.serviceItems.length > 0 && (
            <div className="invoice-section">
              <h3>🔨 Service Items ({maintenanceRecord.serviceItems.length})</h3>
              <div className="service-table">
                <table>
                  <thead>
                    <tr>
                      <th>No.</th>
                      <th>Service Name</th>
                      <th>Description</th>
                      <th>Type</th>
                      <th className="text-right">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {maintenanceRecord.serviceItems.map((item, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{item.serviceItem?.name || 'N/A'}</td>
                        <td>
                          <small>{item.serviceItem?.description || 'N/A'}</small>
                        </td>
                        <td>
                          <span className={`action-badge ${item.actionType?.toLowerCase()}`}>
                            {item.actionType || 'N/A'}
                          </span>
                        </td>
                        <td className="text-right">{formatCurrency(item.price)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Spare Parts */}
          {maintenanceRecord?.partUsages && maintenanceRecord.partUsages.length > 0 && (
            <div className="invoice-section">
              <h3>🔧 Replaced Spare Parts ({maintenanceRecord.partUsages.length})</h3>
              <div className="service-table">
                <table>
                  <thead>
                    <tr>
                      <th>No.</th>
                      <th>Part Name</th>
                      <th>Quantity</th>
                      <th className="text-right">Unit Price</th>
                      <th className="text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {maintenanceRecord.partUsages.map((part, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{part.partName || 'N/A'}</td>
                        <td>{part.quantity}</td>
                        <td className="text-right">{formatCurrency(part.unitPrice)}</td>
                        <td className="text-right">{formatCurrency(part.quantity * part.unitPrice)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Notes */}
          {maintenanceRecord?.notes && (
            <div className="invoice-section">
              <h3>📋 Notes</h3>
              <div className="notes-content">{maintenanceRecord.notes}</div>
            </div>
          )}

          {/* Total Amount */}
          <div className="invoice-section total-section">
            <div className="total-row">
              <span className="total-label">💰 TOTAL:</span>
              <span className="total-amount">{formatCurrency(invoice.totalAmount)}</span>
            </div>
            <div className="invoice-status">
              <span className="status-label">Status:</span>
              <span className={`status-badge ${statusInfo.class}`}>
                {statusInfo.icon} {statusInfo.text}
              </span>
            </div>
            {invoice.status === 'UNPAID' && (
              <div className="payment-notice">
                ⚠️ Please pay the invoice to complete the service
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          {invoice.status === 'UNPAID' && (
            <button 
              className="pay-btn" 
              onClick={handlePayment}
              disabled={isProcessingPayment}
            >
              {isProcessingPayment ? '⏳ Processing...' : '💳 Pay Now'}
            </button>
          )}
          <button className="close-footer-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

CustomerInvoiceDetail.propTypes = {
  invoice: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired
}

export default CustomerInvoiceDetail
