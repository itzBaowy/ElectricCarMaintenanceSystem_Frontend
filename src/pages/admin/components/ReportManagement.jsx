import { useState } from 'react'
import reportService from '../../../api/reportService'
import logger from '../../../utils/logger'
import '../../../styles/ReportManagement.css'

const ReportManagement = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [reportData, setReportData] = useState(null)
  
  // Set default date range (current month)
  const getDefaultDates = () => {
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
    
    return {
      start: firstDay.toISOString().slice(0, 16),
      end: lastDay.toISOString().slice(0, 16)
    }
  }
  
  const defaultDates = getDefaultDates()
  const [startDate, setStartDate] = useState(defaultDates.start)
  const [endDate, setEndDate] = useState(defaultDates.end)

  const handleFetchReport = async () => {
    if (!startDate || !endDate) {
      setError('Vui lòng chọn ngày bắt đầu và ngày kết thúc')
      return
    }

    if (new Date(startDate) > new Date(endDate)) {
      setError('Ngày bắt đầu phải trước ngày kết thúc')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Convert to ISO format with seconds
      const startISO = new Date(startDate).toISOString().slice(0, 19)
      const endISO = new Date(endDate).toISOString().slice(0, 19)

      const response = await reportService.getFinancialReport(startISO, endISO)
      
      if (response.success) {
        setReportData(response.data)
        logger.log('📊 Report loaded:', response.data)
      } else {
        setError(response.message || 'Không thể tải báo cáo. Vui lòng thử lại.')
      }
    } catch (err) {
      logger.error('❌ Error loading report:', err)
      setError('Không thể tải báo cáo. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleQuickSelect = (type) => {
    const now = new Date()
    let start, end

    switch (type) {
      case 'today':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
        break
      case 'thisWeek':
        const firstDayOfWeek = now.getDate() - now.getDay()
        start = new Date(now.getFullYear(), now.getMonth(), firstDayOfWeek)
        end = new Date(now.getFullYear(), now.getMonth(), firstDayOfWeek + 6, 23, 59, 59)
        break
      case 'thisMonth':
        start = new Date(now.getFullYear(), now.getMonth(), 1)
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
        break
      case 'lastMonth':
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)
        break
      case 'thisYear':
        start = new Date(now.getFullYear(), 0, 1)
        end = new Date(now.getFullYear(), 11, 31, 23, 59, 59)
        break
      default:
        return
    }

    setStartDate(start.toISOString().slice(0, 16))
    setEndDate(end.toISOString().slice(0, 16))
  }

  return (
    <div className="report-management">
      <div className="report-header">
        <h2>📊 Báo Cáo Tài Chính</h2>
        <p>Xem tổng quan doanh thu và hoạt động kinh doanh</p>
      </div>

      <div className="report-filters">
        <div className="date-filters">
          <div className="filter-group">
            <label htmlFor="startDate">Từ ngày:</label>
            <input
              type="datetime-local"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="date-input"
            />
          </div>

          <div className="filter-group">
            <label htmlFor="endDate">Đến ngày:</label>
            <input
              type="datetime-local"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="date-input"
            />
          </div>

          <button
            onClick={handleFetchReport}
            disabled={loading}
            className="btn-generate"
          >
            {loading ? '⏳ Đang tải...' : '📊 Xem Báo Cáo'}
          </button>
        </div>

        <div className="quick-select">
          <span>Chọn nhanh:</span>
          <button onClick={() => handleQuickSelect('today')} className="btn-quick">
            Hôm nay
          </button>
          <button onClick={() => handleQuickSelect('thisWeek')} className="btn-quick">
            Tuần này
          </button>
          <button onClick={() => handleQuickSelect('thisMonth')} className="btn-quick">
            Tháng này
          </button>
          <button onClick={() => handleQuickSelect('lastMonth')} className="btn-quick">
            Tháng trước
          </button>
          <button onClick={() => handleQuickSelect('thisYear')} className="btn-quick">
            Năm nay
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <span>⚠️ {error}</span>
        </div>
      )}

      {reportData && (
        <div className="report-content">
          <div className="report-period">
            <h3>Kỳ báo cáo</h3>
            <p>
              <strong>Từ:</strong> {formatDateTime(reportData.startDate)}
              {' → '}
              <strong>Đến:</strong> {formatDateTime(reportData.endDate)}
            </p>
          </div>

          <div className="report-stats">
            <div className="stat-card stat-revenue">
              <div className="stat-icon">💰</div>
              <div className="stat-details">
                <h4>Tổng Doanh Thu</h4>
                <p className="stat-value">{formatCurrency(reportData.totalRevenue)}</p>
              </div>
            </div>

            <div className="stat-card stat-invoices">
              <div className="stat-icon">📄</div>
              <div className="stat-details">
                <h4>Hóa Đơn Đã Thanh Toán</h4>
                <p className="stat-value">{reportData.totalPaidInvoices}</p>
              </div>
            </div>

            <div className="stat-card stat-appointments">
              <div className="stat-icon">✅</div>
              <div className="stat-details">
                <h4>Lịch Hẹn Hoàn Thành</h4>
                <p className="stat-value">{reportData.totalCompletedAppointments}</p>
              </div>
            </div>

            <div className="stat-card stat-average">
              <div className="stat-icon">📈</div>
              <div className="stat-details">
                <h4>Trung Bình / Hóa Đơn</h4>
                <p className="stat-value">
                  {reportData.totalPaidInvoices > 0
                    ? formatCurrency(reportData.totalRevenue / reportData.totalPaidInvoices)
                    : formatCurrency(0)}
                </p>
              </div>
            </div>
          </div>

          {reportData.serviceCenterId && (
            <div className="report-info">
              <p>
                <strong>Trung tâm dịch vụ:</strong> {reportData.serviceCenterId}
              </p>
            </div>
          )}

          <div className="report-summary">
            <h3>📝 Tóm Tắt</h3>
            <ul>
              <li>
                Tổng cộng <strong>{reportData.totalCompletedAppointments}</strong> lịch hẹn đã hoàn thành trong kỳ báo cáo
              </li>
              <li>
                Có <strong>{reportData.totalPaidInvoices}</strong> hóa đơn đã được thanh toán
              </li>
              <li>
                Tổng doanh thu đạt được: <strong>{formatCurrency(reportData.totalRevenue)}</strong>
              </li>
              {reportData.totalPaidInvoices > 0 && (
                <li>
                  Giá trị trung bình mỗi hóa đơn:{' '}
                  <strong>
                    {formatCurrency(reportData.totalRevenue / reportData.totalPaidInvoices)}
                  </strong>
                </li>
              )}
            </ul>
          </div>
        </div>
      )}

      {!reportData && !loading && !error && (
        <div className="no-data">
          <p>📊 Chọn khoảng thời gian và nhấn "Xem Báo Cáo" để xem dữ liệu tài chính</p>
        </div>
      )}
    </div>
  )
}

export default ReportManagement
