import type { New_catalogitems } from '../generated/models/New_catalogitemsModel'
import '../styles/CatalogCard.css'

interface CatalogCardProps {
  item: New_catalogitems
  onOrder: (item: New_catalogitems) => void
}

const categoryLabels: Record<string, string> = {
  100000000: 'Office Supplies',
  100000001: 'IT Equipment',
  100000002: 'Access & Security',
  100000003: 'Stationery',
  100000004: 'Other'
}

export default function CatalogCard({ item, onOrder }: CatalogCardProps) {
  const isAvailable = item.new_available !== false
  const categoryName = item.new_category
    ? categoryLabels[item.new_category]
    : 'Uncategorized'

  return (
    <div className="catalog-card">
      <div className="card-header">
        <h3 className="card-title">{item.new_itemname}</h3>
        <span className="card-category">{categoryName}</span>
      </div>

      <p className="card-description">{item.new_description}</p>

      <div className="card-footer">
        <span className={`availability-badge ${isAvailable ? 'available' : 'unavailable'}`}>
          {isAvailable ? 'Available' : 'Out of Stock'}
        </span>

        <button
          className="order-button"
          onClick={() => onOrder(item)}
          disabled={!isAvailable}
        >
          Order
        </button>
      </div>
    </div>
  )
}
