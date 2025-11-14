import { useState, useEffect } from 'react'
import reportService from '../../../api/reportService'
import logger from '../../../utils/logger'
import '../../../styles/ReportManagement.css'

const ReportManagement = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [reportData, setReportData] = useState(null)
  
  // Set default date range (1 month ago to now)
  const getDefaultDates = () => {
    const now = new Date()
    const oneMonthAgo = new Date(now)
    oneMonthAgo.setMonth(now.getMonth() - 1)
    
    return {
      start: oneMonthAgo.toISOString().slice(0, 16),
      end: now.toISOString().slice(0, 16)
    }
  }
  
  const defaultDates = getDefaultDates()
  const [startDate, setStartDate] = useState(defaultDates.start)
  const [endDate, setEndDate] = useState(defaultDates.end)

  // Auto-load report on component mount
  useEffect(() => {
    handleFetchReport()
  }, [])

  const handleFetchReport = async () => {
    if (!startDate || !endDate) {
      setError('Please select start date and end date')
      return
    }

    if (new Date(startDate) > new Date(endDate)) {
      setError('Start date must be before end date')
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
        logger.log(' Report loaded:', response.data)
      } else {
        setError(response.message || 'Cannot load report. Please try again.')
      }
    } catch (err) {
      logger.error(' Error loading report:', err)
      setError('Cannot load report. Please try again.')
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
        <h2> Financial Report</h2>
        <p>View revenue overview and business activities</p>
      </div>

      <div className="report-filters">
        <div className="date-filters">
          <div className="filter-group">
            <label htmlFor="startDate">From date:</label>
            <input
              type="datetime-local"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="date-input"
            />
          </div>

          <div className="filter-group">
            <label htmlFor="endDate">To date:</label>
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
            {loading ? ' Loading...' : ' View Report'}
          </button>
        </div>

        <div className="quick-select">
          <span>Quick select:</span>
          <button onClick={() => handleQuickSelect('today')} className="btn-quick">
            Today
          </button>
          <button onClick={() => handleQuickSelect('thisWeek')} className="btn-quick">
            This Week
          </button>
          <button onClick={() => handleQuickSelect('thisMonth')} className="btn-quick">
            This Month
          </button>
          <button onClick={() => handleQuickSelect('lastMonth')} className="btn-quick">
            Last Month
          </button>
          <button onClick={() => handleQuickSelect('thisYear')} className="btn-quick">
            This Year
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <span> {error}</span>
        </div>
      )}

      {reportData && (
        <div className="report-content">
          <div className="report-period">
            <h3>Report Period</h3>
            <p>
              <strong>From:</strong> {formatDateTime(reportData.startDate)}
              {' → '}
              <strong>To:</strong> {formatDateTime(reportData.endDate)}
            </p>
          </div>

          <div className="report-stats">
            <div className="stat-card stat-revenue">
              <div className="stat-icon"></div>
              <div className="stat-details">
                <h4>Total Revenue</h4>
                <p className="stat-value">{formatCurrency(reportData.totalRevenue)}</p>
              </div>
            </div>

            <div className="stat-card stat-invoices">
              <div className="stat-icon"></div>
              <div className="stat-details">
                <h4>Paid Invoices</h4>
                <p className="stat-value">{reportData.totalPaidInvoices}</p>
              </div>
            </div>

            <div className="stat-card stat-appointments">
              <div className="stat-icon"></div>
              <div className="stat-details">
                <h4>Completed Appointments</h4>
                <p className="stat-value">{reportData.totalCompletedAppointments}</p>
              </div>
            </div>

            <div className="stat-card stat-average">
              <div className="stat-icon"></div>
              <div className="stat-details">
                <h4>Average / Invoice</h4>
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
                <strong>Service Center:</strong> {reportData.serviceCenterId}
              </p>
            </div>
          )}

          <div className="report-summary">
            <h3> Summary</h3>
            <ul>
              <li>
                Total <strong>{reportData.totalCompletedAppointments}</strong> appointments completed in the report period
              </li>
              <li>
                There are <strong>{reportData.totalPaidInvoices}</strong> invoices that have been paid
              </li>
              <li>
                Total revenue achieved: <strong>{formatCurrency(reportData.totalRevenue)}</strong>
              </li>
              {reportData.totalPaidInvoices > 0 && (
                <li>
                  Average value per invoice:{' '}
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
          <p> Select a time period and click "View Report" to see financial data</p>
        </div>
      )}
    </div>
  )
}

export default ReportManagement
