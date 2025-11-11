import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import '../../styles/PaymentSuccess.css';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [paymentInfo, setPaymentInfo] = useState({
    transactionId: '',
    amount: '',
    appointmentId: '',
    status: ''
  });

  useEffect(() => {
    // Lấy thông tin từ query parameters
    const transactionId = searchParams.get('transactionId') || searchParams.get('vnp_TxnRef') || 'N/A';
    const amount = searchParams.get('amount') || searchParams.get('vnp_Amount') || 'N/A';
    const appointmentId = searchParams.get('appointmentId') || searchParams.get('orderId') || 'N/A';
    const status = searchParams.get('status') || searchParams.get('vnp_ResponseCode') || 'success';

    setPaymentInfo({
      transactionId,
      amount: formatAmount(amount),
      appointmentId,
      status
    });

    // Log để backend có thể track (optional)
    console.log('Payment Success:', {
      transactionId,
      amount,
      appointmentId,
      status,
      timestamp: new Date().toISOString()
    });
  }, [searchParams]);

  const formatAmount = (amount) => {
    if (amount === 'N/A') return amount;
    // VNPay trả về amount x100, cần chia cho 100
    const numAmount = parseFloat(amount) / 100;
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(numAmount);
  };

  const handleBackToDashboard = () => {
    navigate('/customer');
  };

  const handleViewAppointment = () => {
    if (paymentInfo.appointmentId && paymentInfo.appointmentId !== 'N/A') {
      navigate(`/customer/appointments/${paymentInfo.appointmentId}`);
    } else {
      navigate('/customer');
    }
  };

  return (
    <div className="payment-success-container">
      <div className="payment-success-card">
        <div className="success-icon">
          <svg
            className="checkmark"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 52 52"
          >
            <circle
              className="checkmark-circle"
              cx="26"
              cy="26"
              r="25"
              fill="none"
            />
            <path
              className="checkmark-check"
              fill="none"
              d="M14.1 27.2l7.1 7.2 16.7-16.8"
            />
          </svg>
        </div>

        <h1 className="success-title">Thanh toán thành công!</h1>
        <p className="success-message">
          Cảm ơn bạn đã hoàn tất thanh toán. Đơn đặt lịch của bạn đã được xác nhận.
        </p>

        <div className="payment-details">
          <h3>Thông tin thanh toán</h3>
          <div className="detail-row">
            <span className="detail-label">Mã giao dịch:</span>
            <span className="detail-value">{paymentInfo.transactionId}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Số tiền:</span>
            <span className="detail-value amount">{paymentInfo.amount}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Mã đặt lịch:</span>
            <span className="detail-value">{paymentInfo.appointmentId}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Trạng thái:</span>
            <span className="detail-value status-success">Thành công</span>
          </div>
        </div>

        <div className="next-steps">
          <h3>Bước tiếp theo</h3>
          <ul>
            <li>Chúng tôi sẽ gửi email xác nhận đến địa chỉ email của bạn</li>
            <li>Vui lòng đến trung tâm đúng giờ đã đặt</li>
            <li>Mang theo giấy tờ xe và CMND/CCCD</li>
          </ul>
        </div>

        <div className="action-buttons">
          <button
            className="btn btn-primary"
            onClick={handleViewAppointment}
          >
            Xem chi tiết đặt lịch
          </button>
          <button
            className="btn btn-secondary"
            onClick={handleBackToDashboard}
          >
            Về trang chủ
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
