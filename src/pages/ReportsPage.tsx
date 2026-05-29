import { useState, useEffect } from 'react'
import type { New_internalorders } from '../generated/models/New_internalordersModel'
import { New_internalordersService } from '../generated/services/New_internalordersService'
import '../styles/ReportsPage.css'

type OrdersResult = {
  success?: boolean
  data?: New_internalorders[]
  value?: New_internalorders[]
  error?: unknown
}

const getOrderStatus = (status?: number): string => {
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

interface ReportsPageProps {
  onError: (error: string) => void
}

export default function ReportsPage({ onError }: ReportsPageProps) {
  const [orders, setOrders] = useState<New_internalorders[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true)
        const result = await New_internalordersService.getAll({
          select: [
            'new_internalorderid',
            'new_orderstatus',
            'new_quantity',
            'createdon',
            'new_itemname'
          ]
        }) as OrdersResult

        if (result.success || result.value) {
          setOrders(result.value || result.data || [])
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to load report data'
        onError(errorMsg)
      } finally {
        setLoading(false)
      }
    }

    loadOrders()
  }, [onError])

  // Calculate report data
  const statusCounts = orders.reduce((acc, order) => {
    const status = getOrderStatus(order.new_orderstatus)
    acc[status] = (acc[status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const categoryCounts = orders.reduce((acc) => {
    const category = 'Items'
    acc[category] = (acc[category] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const topItems = orders
    .reduce((acc, order) => {
      const item = order.new_itemname || 'Unknown'
      const existing = acc.find(x => x.name === item)
      if (existing) {
        existing.quantity += order.new_quantity || 0
      } else {
        acc.push({ name: item, quantity: order.new_quantity || 0 })
      }
      return acc
    }, [] as Array<{ name: string; quantity: number }>)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5)

  // Orders over last 30 days
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const ordersOverTime = orders
    .filter(order => order.createdon && new Date(order.createdon) >= thirtyDaysAgo)
    .reduce((acc, order) => {
      const date = new Date(order.createdon!).toISOString().split('T')[0]
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {} as Record<string, number>)

  if (loading) {
    return <div className="loading">Loading reports...</div>
  }

  return (
    <div className="reports-page">
      <h2>Reports & Analytics</h2>

      <div className="reports-grid">
        {/* Total Orders by Status */}
        <div className="report-card">
          <h3>Total Orders by Status</h3>
          <div className="chart-container">
            <div className="bar-chart">
              {Object.entries(statusCounts).map(([status, count]) => (
                <div key={status} className="bar-item">
                  <div className="bar-label">{status}</div>
                  <div className="bar-wrapper">
                    <div
                      className="bar"
                      style={{
                        width: `${(count / Math.max(...Object.values(statusCounts))) * 100}%`
                      }}
                    >
                      <span className="bar-value">{count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Orders by Category */}
        <div className="report-card">
          <h3>Orders by Category</h3>
          <div className="chart-container">
            <div className="pie-chart">
              {Object.entries(categoryCounts).map(([category, count], index) => {
                const colors = [
                  '#0078d4',
                  '#107c10',
                  '#ffb900',
                  '#d83b01',
                  '#7b2fbf',
                  '#00bcf2'
                ]
                const percentage = (count / orders.length) * 100
                return (
                  <div key={category} className="pie-item">
                    <div
                      className="pie-dot"
                      style={{ backgroundColor: colors[index % colors.length] }}
                    />
                    <span>
                      {category}: {count} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Top 5 Most-Ordered Items */}
        <div className="report-card">
          <h3>Top 5 Most-Ordered Items</h3>
          <div className="chart-container">
            <ol className="top-items-list">
              {topItems.map((item, index) => (
                <li key={index}>
                  <span className="item-name">{item.name}</span>
                  <span className="item-qty">{item.quantity} units</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Orders Over Time (Last 30 Days) */}
        <div className="report-card">
          <h3>Orders Over Time (Last 30 Days)</h3>
          <div className="chart-container">
            <div className="line-chart">
              {Object.entries(ordersOverTime)
                .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
                .map(([date, count]) => (
                  <div key={date} className="line-item">
                    <div className="line-label">{new Date(date).toLocaleDateString()}</div>
                    <div className="line-value">{count}</div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="summary-stats">
        <div className="stat">
          <div className="stat-value">{orders.length}</div>
          <div className="stat-label">Total Orders</div>
        </div>
        <div className="stat">
          <div className="stat-value">{Object.keys(categoryCounts).length}</div>
          <div className="stat-label">Categories</div>
        </div>
        <div className="stat">
          <div className="stat-value">{topItems[0]?.quantity || 0}</div>
          <div className="stat-label">Top Item Orders</div>
        </div>
      </div>
    </div>
  )
}
