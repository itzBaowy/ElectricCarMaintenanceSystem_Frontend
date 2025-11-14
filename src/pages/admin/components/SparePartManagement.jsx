import { useState, useEffect } from 'react'
import sparePartService from '../../../api/sparePartService'
import EditSparePartModal from './EditSparePartModal'
import UpdateStockModal from './UpdateStockModal'
import AddSparePartModal from './AddSparePartModal'
import '../../../styles/SparePartManagement.css'

const SparePartManagement = () => {
  const [spareParts, setSpareParts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [editingPart, setEditingPart] = useState(null)
  const [updatingStockPart, setUpdatingStockPart] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [pagination, setPagination] = useState({
    totalElements: 0,
    totalPages: 0,
    currentPage: 0,
    size: 1000
  })
  
  const ITEMS_PER_PAGE = 15

  useEffect(() => {
    fetchSpareParts()
  }, [])

  const fetchSpareParts = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await sparePartService.getAllSpareParts(0, 1000) // Fetch up to 1000 items
      
      if (response.code === 1000 && response.result) {
        const result = response.result
        setSpareParts(result.content || [])
        
        // Update pagination info if available
        if (result.totalElements !== undefined) {
          setPagination({
            totalElements: result.totalElements || 0,
            totalPages: result.totalPages || 0,
            currentPage: result.number || 0,
            size: result.size || result.content?.length || 0
          })
        }
      } else {
        setError('Failed to fetch spare parts')
      }
    } catch (err) {
      setError(err.message || 'An error occurred while fetching spare parts')
      console.error('Error fetching spare parts:', err)
    } finally {
      setLoading(false)
    }
  }

  // Filter spare parts
  const filteredSpareParts = spareParts.filter(part => {
    const matchesSearch = 
      part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      part.partNumber.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesSearch
  })

  // Pagination calculation
  const totalPages = Math.ceil(filteredSpareParts.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentItems = filteredSpareParts.slice(startIndex, endIndex)

  // Reset to page 1 when search or filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

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

  // Handle edit
  const handleEdit = (part) => {
    setEditingPart(part)
  }

  const handleCloseModal = () => {
    setEditingPart(null)
  }

  const handleUpdate = (updatedPart) => {
    // Update the spare part in the list
    setSpareParts(prevParts =>
      prevParts.map(part =>
        part.id === updatedPart.id ? updatedPart : part
      )
    )
  }

  // Handle update stock
  const handleUpdateStock = (part) => {
    setUpdatingStockPart(part)
  }

  const handleCloseStockModal = () => {
    setUpdatingStockPart(null)
  }

  const handleStockUpdate = (updatedPart) => {
    // Update the spare part in the list
    setSpareParts(prevParts =>
      prevParts.map(part =>
        part.id === updatedPart.id ? updatedPart : part
      )
    )
  }

  // Handle add new spare part
  const handleAddNew = () => {
    setShowAddModal(true)
  }

  const handleCloseAddModal = () => {
    setShowAddModal(false)
  }

  const handleAddSparePart = (newPart) => {
    // Add the new spare part to the list
    setSpareParts(prevParts => [newPart, ...prevParts])
    // Reset to page 1 to see the new part
    setCurrentPage(1)
  }

  // Format price to VND
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
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

  // Check stock level status
  const getStockStatus = (quantity, minimumLevel) => {
    if (quantity === 0) return 'out-of-stock'
    if (quantity <= minimumLevel) return 'low-stock'
    return 'in-stock'
  }

  const getStockLabel = (quantity, minimumLevel) => {
    if (quantity === 0) return 'Out of Stock'
    if (quantity <= minimumLevel) return 'Low Stock'
    return 'In Stock'
  }

  if (loading) {
    return (
      <div className="spare-part-management">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading spare parts...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="spare-part-management">
        <div className="error-container">
          <div className="error-icon"></div>
          <h3>Error Loading Spare Parts</h3>
          <p>{error}</p>
          <button onClick={fetchSpareParts} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="spare-part-management">

      {/* Header Section */}
      <div className="spare-part-header">
        <div className="header-info">
          <h2>Spare Parts Inventory</h2>
          <p className="subtitle">Manage and track spare parts inventory</p>
        </div>
        <div className="header-stats">
          <div className="stat-card">
            <span className="stat-label">Total Parts</span>
            <span className="stat-value">{spareParts.length}</span>
          </div>
          <div className="stat-card warning">
            <span className="stat-label">Low Stock</span>
            <span className="stat-value">
              {spareParts.filter(p => p.quantityInStock <= p.minimumStockLevel && p.quantityInStock > 0).length}
            </span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Out of Stock</span>
            <span className="stat-value">
              {spareParts.filter(p => p.quantityInStock === 0).length}
            </span>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="spare-part-filters">
        <div className="search-row">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by name or part number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <span className="search-icon"></span>
          </div>

          <button onClick={fetchSpareParts} className="refresh-btn">
             Refresh
          </button>
        </div>
      </div>

      {/* Results Count */}
      <div className="results-info">
        Showing {startIndex + 1}-{Math.min(endIndex, filteredSpareParts.length)} of {filteredSpareParts.length} spare parts
        {filteredSpareParts.length < spareParts.length && (
          <span className="filter-badge">
            (Filtered from {spareParts.length} total)
          </span>
        )}
      </div>
      

      {/* Table Section */}
      <div className="table-container">
        <table className="spare-part-table">
          <thead>
            <tr>
              <th>Part Number</th>
              <th>Name</th>
              <th>Unit Price</th>
              <th>Stock Quantity</th>
              <th>Min. Level</th>
              <th>Status</th>
              <th>Last Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length === 0 ? (
              <tr>
                <td colSpan="7" className="no-data">
                  <div className="no-data-message">
                    <span className="no-data-icon"></span>
                    <p>No spare parts found</p>
                  </div>
                </td>
              </tr>
            ) : (
              currentItems.map((part) => (
                <tr key={part.id}>
                  <td className="part-number">{part.partNumber}</td>
                  <td className="part-name">{part.name}</td>
                  <td className="price">{formatPrice(part.unitPrice)}</td>
                  <td className="quantity">
                    <span className="quantity-badge">
                      {part.quantityInStock}
                    </span>
                  </td>
                  <td className="min-level">{part.minimumStockLevel}</td>
                  <td>
                    <span className={`status-badge ${getStockStatus(part.quantityInStock, part.minimumStockLevel)}`}>
                      {getStockLabel(part.quantityInStock, part.minimumStockLevel)}
                    </span>
                  </td>
                  <td className="date">{formatDate(part.updatedAt)}</td>
                  <td className="actions">
                    <button 
                      className="action-btn edit"
                      title="Edit Part Info"
                      onClick={() => handleEdit(part)}
                    >
                       Edit
                    </button>
                    <button 
                      className="action-btn stock"
                      title="Update Stock"
                      onClick={() => handleUpdateStock(part)}
                    >
                       Stock
                    </button>
                    <button 
                      className="action-btn delete"
                      title="Delete"
                      onClick={() => alert(`Delete: ${part.name}\n(Feature coming soon)`)}
                    >
                       Delete
                    </button>
                  </td>
                </tr>
              ))
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
                  // Show first page, last page, current page, and pages around current
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

      {/* Add Button */}
      <button className="add-spare-part-btn" onClick={handleAddNew}>
        <span className="btn-icon"></span>
        Add New Spare Part
      </button>

      {/* Add Spare Part Modal */}
      {showAddModal && (
        <AddSparePartModal
          onClose={handleCloseAddModal}
          onAdd={handleAddSparePart}
        />
      )}

      {/* Edit Modal */}
      {editingPart && (
        <EditSparePartModal
          sparePart={editingPart}
          onClose={handleCloseModal}
          onUpdate={handleUpdate}
        />
      )}

      {/* Update Stock Modal */}
      {updatingStockPart && (
        <UpdateStockModal
          sparePart={updatingStockPart}
          onClose={handleCloseStockModal}
          onUpdate={handleStockUpdate}
        />
      )}
    </div>
  )
}

export default SparePartManagement
