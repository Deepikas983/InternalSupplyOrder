import React, { useState, useEffect } from 'react'
import type { New_catalogitems } from '../generated/models/New_catalogitemsModel'
import { New_catalogitemsService } from '../generated/services/New_catalogitemsService'
import CatalogCard from '../components/CatalogCard'
import OrderModal from '../components/OrderModal'
import '../styles/CatalogPage.css'

interface CatalogPageProps {
  onError: (error: string) => void
}

type Category = 'Office Supplies' | 'IT Equipment' | 'Access & Security' | 'Stationery' | 'Other' | ''

const categoryMap: Record<number, Category> = {
  100000000: 'Office Supplies',
  100000001: 'IT Equipment',
  100000002: 'Access & Security',
  100000003: 'Stationery',
  100000004: 'Other'
}

export default function CatalogPage({ onError }: CatalogPageProps) {
  const [items, setItems] = useState<New_catalogitems[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<Category>('')
  const [selectedItem, setSelectedItem] = useState<New_catalogitems | null>(null)
  const [showOrderModal, setShowOrderModal] = useState(false)

  useEffect(() => {
    const loadCatalog = async () => {
      try {
        setLoading(true)
        const result = await New_catalogitemsService.getAll({
          select: [
            'new_catalogitemid',
            'new_itemname',
            'new_description',
            'new_category',
            'new_available'
          ]
        })

        console.log('Catalog API Result:', result)
        console.log('Result keys:', Object.keys(result || {}))
        console.log('Result stringified:', JSON.stringify(result))

        if (result && typeof result === 'object') {
          let data: New_catalogitems[] = []

          if ('data' in result && Array.isArray(result.data)) {
            data = result.data
          } else if ('value' in result && Array.isArray(result.value)) {
            data = result.value
          } else if (Array.isArray(result)) {
            data = result as New_catalogitems[]
          }

          console.log('Parsed catalog items:', data)
          setItems(data)
        } else {
          console.error('Unexpected result format:', result)
          onError('Failed to load catalog items - invalid response format')
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        console.error('Catalog error:', err)
        onError(`Error loading catalog: ${errorMessage}`)
      } finally {
        setLoading(false)
      }
    }

    loadCatalog()
  }, [onError])

  const filteredItems = Array.isArray(items) ? items.filter(item => {
    const matchesSearch = item.new_itemname?.toLowerCase().includes(searchQuery.toLowerCase()) ?? true
    const matchesCategory = !selectedCategory || categoryMap[item.new_category ?? 0] === selectedCategory
    return matchesSearch && matchesCategory
  }) : []

  const handleOrderClick = (item: New_catalogitems) => {
    setSelectedItem(item)
    setShowOrderModal(true)
  }

  const handleCloseModal = () => {
    setShowOrderModal(false)
    setSelectedItem(null)
  }

  if (loading) {
    return (
      <div className="page-container">
        <div className="loader">Loading catalog...</div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <h2 className="page-title">Catalog</h2>

      <div className="filter-bar">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by Item Name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="category-filter">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as Category)}
            className="filter-select"
          >
            <option value="">All Categories</option>
            <option value="OfficeSupplies">Office Supplies</option>
            <option value="IT Equipment">IT Equipment</option>
            <option value="Access & Security">Access & Security</option>
            <option value="Stationery">Stationery</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="empty-state">
          <p>No items found matching your criteria.</p>
        </div>
      ) : (
        <div className="cards-grid">
          {filteredItems.map((item) => (
            <CatalogCard
              key={item.new_catalogitemid}
              item={item}
              onOrder={handleOrderClick}
            />
          ))}
        </div>
      )}

      {selectedItem && (
        <OrderModal
          isOpen={showOrderModal}
          item={selectedItem}
          onClose={handleCloseModal}
          onSuccess={handleCloseModal}
          onError={onError}
        />
      )}
    </div>
  )
}