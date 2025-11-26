import { useState, useEffect } from 'react'
import inventoryService from '../../../api/inventoryService'
import centerService from '../../../api/centerService'
import UpdateInventoryModal from './UpdateInventoryModal'
import '../../../styles/InventoryManagement.css'

const InventoryManagement = () => {
  const [inventory, setInventory] = useState([])
  const [serviceCenters, setServiceCenters] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCenter, setSelectedCenter] = useState('')
  const [stockFilter, setStockFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [updatingItem, setUpdatingItem] = useState(null)
  
  const ITEMS_PER_PAGE = 15

  useEffect(() => {
    fetchServiceCenters()
  }, [])

  useEffect(() => {
    if (selectedCenter) {
      fetchInventory()
    }
  }, [selectedCenter])

  const fetchServiceCenters = async () => {
    try {
      const response = await centerService.getAllCenters(0, 100)
      
      if (response.success) {
        setServiceCenters(response.data)
        // Auto-select first center if available
        if (response.data.length > 0) {
          setSelectedCenter(response.data[0].id.toString())
        }
      } else {
        setError('Failed to fetch service centers')
      }
    } catch (err) {
      console.error('Error fetching service centers:', err)
      setError('An error occurred while fetching service centers')
    }
  }

  const fetchInventory = async () => {
    if (!selectedCenter) return
    
    try {
      setLoading(true)
      setError(null)
      const response = await inventoryService.getInventoryByCenterId(selectedCenter)
      
      if (response.code === 1000 || response.code === 0) {
        setInventory(response.result || [])
      } else {
        setError('Failed to fetch inventory')
      }
    } catch (err) {
      setError(err.message || 'An error occurred while fetching inventory')
      console.error('Error fetching inventory:', err)
    } finally {
      setLoading(false)
    }
  }

  // Filter inventory
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = 
      item.partName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.partNumber.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStockFilter = 
      stockFilter === 'all' ||
      (stockFilter === 'in-stock' && item.quantity > item.minStock) ||
      (stockFilter === 'low-stock' && item.quantity > 0 && item.quantity <= item.minStock) ||
      (stockFilter === 'out-of-stock' && item.quantity === 0)

    return matchesSearch && matchesStockFilter
  })

  // Pagination calculation
  const totalPages = Math.ceil(filteredInventory.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentItems = filteredInventory.slice(startIndex, endIndex)

  // Reset to page 1 when search or filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, stockFilter, selectedCenter])

  // Pagination handlers
  const goToPage = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1)
    }
  }

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1)
    }
  }

  // Handle update stock
  const handleUpdateStock = (item) => {
    setUpdatingItem(item)
  }

  const handleCloseModal = () => {
    setUpdatingItem(null)
  }

  const handleStockUpdate = (updatedItem) => {
    // Update the inventory item in the list
    setInventory(prevInventory =>
      prevInventory.map(item =>
        item.id === updatedItem.id ? updatedItem : item
      )
    )
  }

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Get stock status
  const getStockStatus = (quantity, minStock) => {
    if (quantity === 0) return { label: 'Out of Stock', className: 'out-of-stock' }
    if (quantity <= minStock) return { label: 'Low Stock', className: 'low-stock' }
    return { label: 'In Stock', className: 'in-stock' }
  }

  if (loading && !selectedCenter) {
    return (
      <div className="inventory-management">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading service centers...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="inventory-management">
      {/* Header Section */}
      <div className="inventory-header">
        <div className="header-info">
          <h2>Inventory Management</h2>
          <p className="subtitle">Manage spare parts inventory across service centers</p>
        </div>
        <div className="header-stats">
          <div className="stat-card">
            <span className="stat-label">Total Items</span>
            <span className="stat-value">{inventory.length}</span>
          </div>
          <div className="stat-card warning">
            <span className="stat-label">Low Stock</span>
            <span className="stat-value">
              {inventory.filter(i => i.quantity > 0 && i.quantity <= i.minStock).length}
            </span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Out of Stock</span>
            <span className="stat-value">
              {inventory.filter(i => i.quantity === 0).length}
            </span>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="inventory-filters">
        <div className="filter-row">
          <div className="filter-group">
            <label htmlFor="centerSelect">Service Center:</label>
            <select
              id="centerSelect"
              className="filter-select"
              value={selectedCenter}
              onChange={(e) => setSelectedCenter(e.target.value)}
            >
              <option value="">Select a service center</option>
              {serviceCenters.map(center => (
                <option key={center.id} value={center.id}>
                  {center.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="stockFilter">Stock Status:</label>
            <select
              id="stockFilter"
              className="filter-select"
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
            >
              <option value="all">All Items</option>
              <option value="in-stock">In Stock</option>
              <option value="low-stock">Low Stock</option>
              <option value="out-of-stock">Out of Stock</option>
            </select>
          </div>
        </div>

        <div className="search-row">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by part name or number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <button onClick={fetchInventory} className="refresh-btn" disabled={!selectedCenter}>
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Results Count */}
      {selectedCenter && (
        <div className="results-info">
          Showing {startIndex + 1}-{Math.min(endIndex, filteredInventory.length)} of {filteredInventory.length} items
          {filteredInventory.length < inventory.length && (
            <span className="filter-badge">
              (Filtered from {inventory.length} total)
            </span>
          )}
        </div>
      )}

      {/* Table Section */}
      {!selectedCenter ? (
        <div className="no-selection-message">
          <div className="no-selection-icon">📦</div>
          <h3>Select a Service Center</h3>
          <p>Please select a service center to view its inventory</p>
        </div>
      ) : loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading inventory...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3>Error Loading Inventory</h3>
          <p>{error}</p>
          <button onClick={fetchInventory} className="retry-btn">
            Try Again
          </button>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>Part Number</th>
                  <th>Part Name</th>
                  <th>Quantity</th>
                  <th>Min Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="no-data">
                      <div className="no-data-message">
                        <span className="no-data-icon">📭</span>
                        <p>No inventory items found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentItems.map((item) => {
                    const status = getStockStatus(item.quantity, item.minStock)
                    return (
                      <tr key={item.id}>
                        <td className="part-number">{item.partNumber}</td>
                        <td className="part-name">{item.partName}</td>
                        <td className="quantity">
                          <span className="quantity-badge">{item.quantity}</span>
                        </td>
                        <td className="min-stock">{item.minStock}</td>
                        <td>
                          <span className={`status-badge ${status.className}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="actions">
                          <button 
                            className="action-btn stock"
                            title="Update Stock"
                            onClick={() => handleUpdateStock(item)}
                          >
                            Update Stock
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="pagination-controls">
              <button 
                className="pagination-btn"
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
              >
                ← Previous
              </button>
              
              <div className="pagination-info">
                <span className="page-numbers">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => {
                      return (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      )
                    })
                    .map((page, index, array) => (
                      <span key={page}>
                        {index > 0 && array[index - 1] !== page - 1 && (
                          <span className="pagination-ellipsis">...</span>
                        )}
                        <button
                          className={`page-number ${currentPage === page ? 'active' : ''}`}
                          onClick={() => goToPage(page)}
                        >
                          {page}
                        </button>
                      </span>
                    ))}
                </span>
                <span className="page-info-text">
                  Page {currentPage} of {totalPages}
                </span>
              </div>

              <button 
                className="pagination-btn"
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}

      {/* Update Stock Modal */}
      {updatingItem && (
        <UpdateInventoryModal
          inventory={updatingItem}
          onClose={handleCloseModal}
          onUpdate={handleStockUpdate}
        />
      )}
    </div>
  )
}

export default InventoryManagement
