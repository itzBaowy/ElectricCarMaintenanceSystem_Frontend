import { useState, useEffect } from 'react'
import sparePartService from '../../../api/sparePartService'
import '../../../styles/SparePartManagement.css'

const SparePartManagement = () => {
  const [spareParts, setSpareParts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [pagination, setPagination] = useState({
    totalElements: 0,
    totalPages: 0,
    currentPage: 0,
    size: 1000
  })

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

  // Get unique categories for filter
  const categories = [...new Set(spareParts.map(part => part.category.name))]

  // Filter spare parts
  const filteredSpareParts = spareParts.filter(part => {
    const matchesSearch = 
      part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      part.partNumber.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = filterCategory === 'all' || part.category.name === filterCategory

    return matchesSearch && matchesCategory
  })

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
          <div className="error-icon">⚠️</div>
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
          <div className="stat-card">
            <span className="stat-label">Categories</span>
            <span className="stat-value">{categories.length}</span>
          </div>
          <div className="stat-card warning">
            <span className="stat-label">Low Stock</span>
            <span className="stat-value">
              {spareParts.filter(p => p.quantityInStock <= p.minimumStockLevel && p.quantityInStock > 0).length}
            </span>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="spare-part-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by name or part number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>

        <div className="filter-group">
          <label htmlFor="category-filter">Category:</label>
          <select
            id="category-filter"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Categories</option>
            {categories.map((category, index) => (
              <option key={index} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <button onClick={fetchSpareParts} className="refresh-btn">
          🔄 Refresh
        </button>
      </div>

      {/* Results Count */}
      <div className="results-info">
        Showing {filteredSpareParts.length} of {spareParts.length} spare parts
        {pagination.totalElements > 0 && spareParts.length < pagination.totalElements && (
          <span className="pagination-warning">
            ⚠️ Displaying {spareParts.length} out of {pagination.totalElements} total items
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
              <th>Category</th>
              <th>Unit Price</th>
              <th>Stock Quantity</th>
              <th>Min. Level</th>
              <th>Status</th>
              <th>Last Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSpareParts.length === 0 ? (
              <tr>
                <td colSpan="9" className="no-data">
                  <div className="no-data-message">
                    <span className="no-data-icon">📦</span>
                    <p>No spare parts found</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredSpareParts.map((part) => (
                <tr key={part.id}>
                  <td className="part-number">{part.partNumber}</td>
                  <td className="part-name">{part.name}</td>
                  <td>
                    <span className="category-badge">
                      {part.category.name}
                    </span>
                  </td>
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
                      className="action-btn view"
                      title="View Details"
                      onClick={() => alert(`View details for: ${part.name}\n(Feature coming soon)`)}
                    >
                      👁️
                    </button>
                    <button 
                      className="action-btn edit"
                      title="Edit"
                      onClick={() => alert(`Edit: ${part.name}\n(Feature coming soon)`)}
                    >
                      ✏️
                    </button>
                    <button 
                      className="action-btn delete"
                      title="Delete"
                      onClick={() => alert(`Delete: ${part.name}\n(Feature coming soon)`)}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Button (for future use) */}
      <button className="add-spare-part-btn" onClick={() => alert('Add spare part feature coming soon!')}>
        <span className="btn-icon">➕</span>
        Add New Spare Part
      </button>
    </div>
  )
}

export default SparePartManagement
