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
      PAID: { text: 'Đã thanh toán', class: 'paid', icon: '✅' },
      UNPAID: { text: 'Chưa thanh toán', class: 'unpaid', icon: '⏳' }
    }
    return statusMap[status] || statusMap.UNPAID
  }

  const maintenanceRecord = invoice.maintenanceRecord
  const statusInfo = getStatusBadge(invoice.status)

  const handlePayment = async () => {
    if (isProcessingPayment) return

    const confirmed = window.confirm(
      `Xác nhận thanh toán hoá đơn #${invoice.id}\n\nSố tiền: ${formatCurrency(invoice.totalAmount)}\n\nBạn sẽ được chuyển đến trang thanh toán VNPay.`
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
        alert(`Không thể tạo thanh toán: ${result.message}`)
        logger.error('Payment creation failed:', result.message)
      }
    } catch (error) {
      logger.error('Payment error:', error)
      alert('Có lỗi xảy ra khi tạo thanh toán. Vui lòng thử lại!')
    } finally {
      setIsProcessingPayment(false)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="customer-invoice-modal">
        <div className="modal-header">
          <h2>🧾 Chi Tiết Hoá Đơn</h2>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="modal-body">
          {/* Invoice Status Banner */}
          <div className={`invoice-status-banner ${statusInfo.class}`}>
            {statusInfo.icon} Trạng thái: <strong>{statusInfo.text}</strong>
            <div className="invoice-id">Mã hoá đơn: #{invoice.id}</div>
          </div>

          {/* Customer Information */}
          <div className="invoice-section">
            <h3>👤 Thông Tin Khách Hàng</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Tên Khách Hàng:</label>
                <span>{maintenanceRecord?.customerName || 'N/A'}</span>
              </div>
              <div className="info-item">
                <label>Mã Khách Hàng:</label>
                <span>#{maintenanceRecord?.customerId}</span>
              </div>
            </div>
          </div>

          {/* Vehicle Information */}
          <div className="invoice-section">
            <h3>🚗 Thông Tin Xe</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Biển Số:</label>
                <span>{maintenanceRecord?.vehicleLicensePlate || 'N/A'}</span>
              </div>
              <div className="info-item">
                <label>Model:</label>
                <span>{maintenanceRecord?.vehicleModel || 'N/A'}</span>
              </div>
              <div className="info-item">
                <label>Mã Xe:</label>
                <span>#{maintenanceRecord?.vehicleId}</span>
              </div>
              {maintenanceRecord?.odometer && (
                <div className="info-item">
                  <label>Số Km:</label>
                  <span>{maintenanceRecord.odometer.toLocaleString()} km</span>
                </div>
              )}
            </div>
          </div>

          {/* Service Center Information */}
          <div className="invoice-section">
            <h3>🏢 Thông Tin Dịch Vụ</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Trung Tâm:</label>
                <span>{invoice.serviceCenterName}</span>
              </div>
              <div className="info-item">
                <label>Mã Appointment:</label>
                <span>#{maintenanceRecord?.appointmentId}</span>
              </div>
              <div className="info-item">
                <label>Ngày Thực Hiện:</label>
                <span>{formatDate(maintenanceRecord?.performedAt)}</span>
              </div>
              <div className="info-item">
                <label>Ngày Tạo Hoá Đơn:</label>
                <span>{formatDate(invoice.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Technician Information */}
          {maintenanceRecord?.technicianName && (
            <div className="invoice-section">
              <h3>🔧 Kỹ Thuật Viên</h3>
              <div className="info-grid">
                <div className="info-item">
                  <label>Tên Kỹ Thuật Viên:</label>
                  <span>{maintenanceRecord.technicianName}</span>
                </div>
                <div className="info-item">
                  <label>Mã KTV:</label>
                  <span>#{maintenanceRecord.technicianId}</span>
                </div>
              </div>
            </div>
          )}

          {/* Service Package */}
          {maintenanceRecord?.servicePackageName && (
            <div className="invoice-section">
              <h3>📦 Gói Dịch Vụ</h3>
              <div className="package-info">
                <div className="package-name">{maintenanceRecord.servicePackageName}</div>
              </div>
            </div>
          )}

          {/* Service Items */}
          {maintenanceRecord?.serviceItems && maintenanceRecord.serviceItems.length > 0 && (
            <div className="invoice-section">
              <h3>🔨 Các Hạng Mục Dịch Vụ ({maintenanceRecord.serviceItems.length})</h3>
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
              <h3>🔧 Phụ Tùng Thay Thế ({maintenanceRecord.partUsages.length})</h3>
              <div className="service-table">
                <table>
                  <thead>
                    <tr>
                      <th>STT</th>
                      <th>Tên Phụ Tùng</th>
                      <th>Số Lượng</th>
                      <th className="text-right">Đơn Giá</th>
                      <th className="text-right">Thành Tiền</th>
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
              <h3>📝 Ghi Chú</h3>
              <div className="notes-content">{maintenanceRecord.notes}</div>
            </div>
          )}

          {/* Total Amount */}
          <div className="invoice-section total-section">
            <div className="total-row">
              <span className="total-label">💰 TỔNG CỘNG:</span>
              <span className="total-amount">{formatCurrency(invoice.totalAmount)}</span>
            </div>
            <div className="invoice-status">
              <span className="status-label">Trạng thái:</span>
              <span className={`status-badge ${statusInfo.class}`}>
                {statusInfo.icon} {statusInfo.text}
              </span>
            </div>
            {invoice.status === 'UNPAID' && (
              <div className="payment-notice">
                ⚠️ Vui lòng thanh toán hoá đơn để hoàn tất dịch vụ
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
              {isProcessingPayment ? '⏳ Đang xử lý...' : '💳 Thanh Toán Ngay'}
            </button>
          )}
          <button className="close-footer-btn" onClick={onClose}>
            Đóng
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
