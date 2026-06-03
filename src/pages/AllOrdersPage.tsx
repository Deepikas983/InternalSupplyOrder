import { useState, useEffect } from 'react'
import type { New_internalorders } from '../generated/models/New_internalordersModel'
import { New_internalordersService } from '../generated/services/New_internalordersService'
import '../styles/AllOrdersPage.css'

type OrdersResult = {
  success?: boolean
  data?: New_internalorders[]
  value?: New_internalorders[]
  error?: unknown
}

const statusColors: Record<string, string> = {
  'Submitted': '#6c757d',
  'Approved': '#0078d4',
  'InProgress': '#ffb900',
  'Ordered': '#7b2fbf',
  'Delivered': '#107c10',
  'Denied': '#d83b01'
}

const getOrderStatus = (status?: string | number): string => {
  if (typeof status === 'string') return status
  const statusMap: Record<number, string> = {
    100000000: 'Submitted',
    100000001: 'Approved',
    100000002: 'InProgress',
    100000003: 'Ordered',
    100000004: 'Delivered',
    100000005: 'Denied'
  }
  return statusMap[status ?? 0] ?? 'Submitted'
}

interface AllOrdersPageProps {
  onError: (error: string) => void
}

const DEFAULT_START_DATE = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
const DEFAULT_END_DATE = new Date().toISOString().split('T')[0]

export default function AllOrdersPage({ onError }: AllOrdersPageProps) {
  const [orders, setOrders] = useState<New_internalorders[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: DEFAULT_START_DATE,
    end: DEFAULT_END_DATE
  })

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true)

        const result = await New_internalordersService.getAll() as OrdersResult

        if (result.success || result.value || result.data) {
          const orderList = result.value || result.data || []
          console.log('All Orders API Response:', result)
          console.log('Response keys:', Object.keys(result))
          console.log('result.value:', result.value)
          console.log('result.data:', result.data)
          console.log('Order list:', orderList)
          console.log('Order list length:', orderList.length)
          setOrders(orderList)
        } else {
          console.log('⚠️ Result has no success/value/data:', result)
          console.log('⚠️ Result keys:', Object.keys(result))
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to load orders'
        onError(errorMsg)
      } finally {
        setLoading(false)
      }
    }

    loadOrders()
  }, [onError])

  const filteredOrders = orders.filter(order => {
    if (statusFilter !== 'all') {
      const orderStatus = getOrderStatus(order.new_orderstatus)
      if (orderStatus !== statusFilter) return false
    }

    const createdDate = order.createdon ? new Date(order.createdon).toISOString().split('T')[0] : ''
    if (dateRange.start && createdDate < dateRange.start) return false
    if (dateRange.end && createdDate > dateRange.end) return false

    return true
  })

  const uniqueStatuses = ['all', ...new Set(orders.map(o => getOrderStatus(o.new_orderstatus)))]

  if (loading) {
    return <div className="loading">Loading orders...</div>
  }

  return (
    <div className="all-orders-page">
      <h2>All Orders</h2>

      <div className="filters-container">
        <div className="filter-group">
          <label htmlFor="status-filter">Status:</label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {uniqueStatuses.map(status => (
              <option key={status} value={status}>
                {status === 'all' ? 'All Statuses' : status}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="start-date">From:</label>
          <input
            id="start-date"
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="end-date">To:</label>
          <input
            id="end-date"
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
          />
        </div>
      </div>

      <div className="orders-container">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Product</th>
              <th>Quantity</th>
              <th>Delivery Location</th>
              <th>Ordered By</th>
              <th>Status</th>
              <th>Assigned To</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={8} className="no-data">No orders found</td>
              </tr>
            ) : (
              filteredOrders.map(order => (
                <tr key={order.new_internalorderid}>
                  <td>{order.new_orderid ?? 'N/A'}</td>
                  <td>{(order as unknown as Record<string, string>)['_new_item_value@OData.Community.Display.V1.FormattedValue'] ?? order._new_item_value ?? '—'}</td>
                  <td>{order.new_quantity}</td>
                  <td>{order.new_deliverylocation ?? 'N/A'}</td>
                  <td><td>{(order as unknown as Record<string, string>)['_ownerid_value@OData.Community.Display.V1.FormattedValue'] ?? order.ownerid ?? 'N/A'}</td></td>
                  <td>
                    <span
                      className="status-badge"
                      style={{ backgroundColor: statusColors[getOrderStatus(order.new_orderstatus)] }}
                    >
                      {getOrderStatus(order.new_orderstatus)}
                    </span>
                  </td>
                  <td><td>{(order as unknown as Record<string, string>)['_createdby_value@OData.Community.Display.V1.FormattedValue'] ?? order._createdby_value ?? 'N/A'}</td></td>
                  <td>
                    {order.createdon
                      ? new Date(order.createdon).toLocaleDateString()
                      : '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
