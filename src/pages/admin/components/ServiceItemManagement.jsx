import { useState, useEffect } from 'react'
import serviceItemService from '../../../api/serviceItemService'
import AddServiceItemModal from './AddServiceItemModal'
import EditServiceItemModal from './EditServiceItemModal'
import '../../../styles/ServiceItemManagement.css'

const ServiceItemManagement = () => {
  const [serviceItems, setServiceItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(0)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [pagination, setPagination] = useState({
    totalElements: 0,
    totalPages: 0,
    currentPage: 0,
    size: 10
  })

  const PAGE_SIZE = 10

  useEffect(() => {
    fetchServiceItems(currentPage)
  }, [currentPage])

  const fetchServiceItems = async (page = 0) => {
    try {
      setLoading(true)
      setError(null)
      const response = await serviceItemService.getAllServiceItems(page, PAGE_SIZE)

      if (response.code === 1000 && response.result) {
        const result = response.result
        setServiceItems(result.content || [])

        setPagination({
          totalElements: result.totalElements || 0,
          totalPages: result.totalPages || 0,
          currentPage: result.number || 0,
          size: result.size || PAGE_SIZE
        })
      } else {
        setError(response.message || 'Failed to fetch service items')
      }
    } catch (err) {
      setError(err.message || 'An error occurred while fetching service items')
      console.error('Error fetching service items:', err)
    } finally {
      setLoading(false)
    }
  }

  // Filter service items by search term
  const filteredServiceItems = serviceItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Pagination handlers
  const goToPage = (page) => {
    if (page >= 0 && page < pagination.totalPages) {
      setCurrentPage(page)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const goToPreviousPage = () => {
    if (currentPage > 0) {
      goToPage(currentPage - 1)
    }
  }

  const goToNextPage = () => {
    if (currentPage < pagination.totalPages - 1) {
      goToPage(currentPage + 1)
    }
  }

  // Handle add new service item
  const handleAddNew = () => {
    setShowAddModal(true)
  }

  const handleCloseAddModal = () => {
    setShowAddModal(false)
  }

  const handleAddServiceItem = async (newItem) => {
    // Refresh the list to show the new item
    await fetchServiceItems(0)
    setCurrentPage(0)
  }

  // Handle edit
  const handleEdit = (item) => {
    setEditingItem(item)
  }

  const handleCloseEditModal = () => {
    setEditingItem(null)
  }

  const handleUpdateServiceItem = async (updatedItem) => {
    // Refresh the current page
    await fetchServiceItems(currentPage)
  }

  // Handle delete
  const handleDelete = async (item) => {
    if (window.confirm(`Are you sure you want to delete "${item.name}"?\n\nThis action cannot be undone.`)) {
      try {
        const response = await serviceItemService.deleteServiceItem(item.id)
        
        if (response.code === 1000) {
          alert(' Service item deleted successfully!')
          // Refresh the current page
          await fetchServiceItems(currentPage)
        } else {
          alert(` Failed to delete: ${response.message}`)
        }
      } catch (error) {
        console.error('Error deleting service item:', error)
        alert(' An error occurred while deleting the service item')
      }
    }
  }

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = []
    const maxPagesToShow = 5
    const totalPages = pagination.totalPages

    if (totalPages <= maxPagesToShow) {
      for (let i = 0; i < totalPages; i++) {
        pages.push(i)
      }
    } else {
      const startPage = Math.max(0, currentPage - 2)
      const endPage = Math.min(totalPages - 1, startPage + maxPagesToShow - 1)

      if (startPage > 0) {
        pages.push(0)
        if (startPage > 1) pages.push('...')
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
      }

      if (endPage < totalPages - 1) {
        if (endPage < totalPages - 2) pages.push('...')
        pages.push(totalPages - 1)
      }
    }

    return pages
  }

  if (loading && serviceItems.length === 0) {
    return (
      <div className="service-item-management">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading service items...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="service-item-management">
      {/* Header */}
      <div className="management-header">
        <div className="header-left">
          <h2> Service Item Management</h2>
          <p className="subtitle">
            Total: {pagination.totalElements} item{pagination.totalElements !== 1 ? 's' : ''}
          </p>
        </div>
        <button className="btn-add" onClick={handleAddNew}>
           Add New Service Item
        </button>
      </div>

      {/* Search and Filters */}
      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 Search by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button
              className="clear-search"
              onClick={() => setSearchTerm('')}
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
           {error}
          <button onClick={() => fetchServiceItems(currentPage)}>Retry</button>
        </div>
      )}

      {/* Service Items Table */}
      {filteredServiceItems.length === 0 ? (
        <div className="no-data">
          <div className="no-data-icon">🔧</div>
          <p>{searchTerm ? 'No service items found matching your search.' : 'No service items available.'}</p>
          {!searchTerm && (
            <button className="btn-add-inline" onClick={handleAddNew}>
              Add First Service Item
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="service-items-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Service Name</th>
                  <th>Description</th>
                  <th>Created At</th>
                  <th>Updated At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredServiceItems.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>
                      <strong>{item.name}</strong>
                    </td>
                    <td>
                      <span className="description-text" title={item.description}>
                        {item.description || 'N/A'}
                      </span>
                    </td>
                    <td>
                      <small>{formatDate(item.createdAt)}</small>
                      {item.createdBy && (
                        <div className="user-info">by {item.createdBy}</div>
                      )}
                    </td>
                    <td>
                      <small>{formatDate(item.updatedAt)}</small>
                      {item.updatedBy && (
                        <div className="user-info">by {item.updatedBy}</div>
                      )}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-action btn-edit"
                          onClick={() => handleEdit(item)}
                          title="Edit service item"
                        >
                          
                        </button>
                        <button
                          className="btn-action btn-delete"
                          onClick={() => handleDelete(item)}
                          title="Delete service item"
                        >
                          
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="pagination">
              <button
                className="page-btn"
                onClick={goToPreviousPage}
                disabled={currentPage === 0}
              >
                ← Previous
              </button>

              <div className="page-numbers">
                {getPageNumbers().map((page, index) => (
                  page === '...' ? (
                    <span key={`ellipsis-${index}`} className="page-ellipsis">...</span>
                  ) : (
                    <button
                      key={page}
                      className={`page-number ${currentPage === page ? 'active' : ''}`}
                      onClick={() => goToPage(page)}
                    >
                      {page + 1}
                    </button>
                  )
                ))}
              </div>

              <button
                className="page-btn"
                onClick={goToNextPage}
                disabled={currentPage >= pagination.totalPages - 1}
              >
                Next →
              </button>

              <div className="page-info">
                Page {currentPage + 1} of {pagination.totalPages}
              </div>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      {showAddModal && (
        <AddServiceItemModal
          onClose={handleCloseAddModal}
          onAdd={handleAddServiceItem}
        />
      )}

      {editingItem && (
        <EditServiceItemModal
          serviceItem={editingItem}
          onClose={handleCloseEditModal}
          onUpdate={handleUpdateServiceItem}
        />
      )}
    </div>
  )
}

export default ServiceItemManagement
