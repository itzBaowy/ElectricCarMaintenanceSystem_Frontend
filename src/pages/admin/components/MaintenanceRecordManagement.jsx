import React, { useState, useEffect } from 'react';
import { getAllMaintenanceRecords } from '../../../api/maintenanceRecordService';
import MaintenanceRecordDetailModal from './MaintenanceRecordDetailModal';
import '../../../styles/MaintenanceRecordManagement.css';

const MaintenanceRecordManagement = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTechnician, setFilterTechnician] = useState('');

  useEffect(() => {
    fetchMaintenanceRecords();
  }, []);

  const fetchMaintenanceRecords = async () => {
    try {
      setLoading(true);
      const response = await getAllMaintenanceRecords();
      if (response.code === 1000) {
        setRecords(response.result);
      }
    } catch (err) {
      setError('Không thể tải danh sách hồ sơ bảo dưỡng');
      console.error('Error fetching maintenance records:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (record) => {
    setSelectedRecord(record);
    setShowDetailModal(true);
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

  const calculateTotalCost = (record) => {
    const serviceItemsTotal = record.serviceItems?.reduce((sum, item) => sum + (item.price || 0), 0) || 0;
    return serviceItemsTotal;
  };

  // Filter records
  const filteredRecords = records.filter(record => {
    const matchesSearch = 
      record.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.vehicleLicensePlate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.vehicleModel?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.servicePackageName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTechnician = filterTechnician === '' || record.technicianName === filterTechnician;
    
    return matchesSearch && matchesTechnician;
  });

  // Get unique technician names for filter
  const uniqueTechnicians = [...new Set(records.map(r => r.technicianName).filter(Boolean))];

  if (loading) {
    return <div className="loading">Đang tải dữ liệu...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="maintenance-record-management">
      <div className="management-header">
        <h2>Quản Lý Hồ Sơ Bảo Dưỡng</h2>
        <button onClick={fetchMaintenanceRecords} className="btn-refresh">
          🔄 Làm mới
        </button>
      </div>

      <div className="filters-section">
        <div className="filter-group">
          <input
            type="text"
            placeholder="Tìm kiếm (khách hàng, biển số, xe, gói dịch vụ...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-group">
          <select
            value={filterTechnician}
            onChange={(e) => setFilterTechnician(e.target.value)}
            className="filter-select"
          >
            <option value="">Tất cả kỹ thuật viên</option>
            {uniqueTechnicians.map(tech => (
              <option key={tech} value={tech}>{tech}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="records-stats">
        <div className="stat-card">
          <h4>Tổng số hồ sơ</h4>
          <p>{filteredRecords.length}</p>
        </div>
        <div className="stat-card">
          <h4>Tổng giá trị</h4>
          <p>{formatCurrency(filteredRecords.reduce((sum, r) => sum + calculateTotalCost(r), 0))}</p>
        </div>
      </div>

      <div className="table-container">
        <table className="maintenance-records-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Ngày thực hiện</th>
              <th>Khách hàng</th>
              <th>Xe</th>
              <th>Biển số</th>
              <th>Số km</th>
              <th>Gói dịch vụ</th>
              <th>Kỹ thuật viên</th>
              <th>Số lượng dịch vụ</th>
              <th>Tổng chi phí</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.length === 0 ? (
              <tr>
                <td colSpan="11" className="no-data">
                  Không có hồ sơ bảo dưỡng nào
                </td>
              </tr>
            ) : (
              filteredRecords.map((record) => (
                <tr key={record.id}>
                  <td>{record.id}</td>
                  <td>{formatDate(record.performedAt)}</td>
                  <td>{record.customerName}</td>
                  <td>{record.vehicleModel}</td>
                  <td className="license-plate">{record.vehicleLicensePlate}</td>
                  <td>{record.odometer?.toLocaleString('vi-VN')} km</td>
                  <td className="service-package">{record.servicePackageName}</td>
                  <td>{record.technicianName}</td>
                  <td className="text-center">{record.serviceItems?.length || 0}</td>
                  <td className="price">{record.totalPrice ? formatCurrency(record.totalPrice) : 'Chưa tạo hoá đơn'}</td>
                  <td>
                    <button
                      onClick={() => handleViewDetail(record)}
                      className="btn-view-detail"
                    >
                      Xem chi tiết
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showDetailModal && selectedRecord && (
        <MaintenanceRecordDetailModal
          record={selectedRecord}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedRecord(null);
          }}
        />
      )}
    </div>
  );
};

export default MaintenanceRecordManagement;
