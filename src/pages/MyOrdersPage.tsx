import React, { useState, useEffect } from 'react'
import type { New_internalorders } from '../generated/models/New_internalordersModel'
import { New_internalordersService } from '../generated/services/New_internalordersService'
import '../styles/MyOrdersPage.css'

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

interface MyOrdersPageProps {
  onError: (error: string) => void
}

export default function MyOrdersPage({ onError }: MyOrdersPageProps) {
  const [orders, setOrders] = useState<New_internalorders[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true)

        const result = await New_internalordersService.getAll({
          select: [
            'new_internalorderid',
            'new_orderid',
            '_new_item_value',
            'new_quantity',
            'new_orderdate',
            'new_neededby',
            'new_orderstatus'
          ]
        })

        if (result && typeof result === 'object') {
          const resultObj = result as unknown as OrdersResult
          const data = resultObj.data ?? resultObj.value ?? []

          const sortedOrders = [...data].sort((a, b) =>
            new Date(b.new_orderdate || 0).getTime() - new Date(a.new_orderdate || 0).getTime()
          )
          setOrders(sortedOrders)
        } else {
          console.warn('Result is not an object:', result)
        }
      } catch (err) {
        console.error('❌ Error loading orders:', err)
        onError(`Error loading orders: ${err instanceof Error ? err.message : String(err)}`)
      } finally {
        setLoading(false)
      }
    }

    loadOrders()
  }, [onError])

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  if (loading) {
    return (
      <div className="page-container">
        <div className="loader">Loading orders...</div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <h2 className="page-title">My Orders</h2>

      {orders.length === 0 ? (
        <div className="empty-state">
          <p>No orders found.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Catalog Item</th>
                <th>Order ID</th>
                <th>Quantity</th>
                <th>Order Date</th>
                <th>Needed By</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const status = getOrderStatus(order.new_orderstatus)
return (
  <tr key={order.new_internalorderid}>
    <td>{(order as unknown as Record<string, string>)['_new_item_value@OData.Community.Display.V1.FormattedValue'] ?? '—'}</td>
    <td>{order.new_orderid ?? 'N/A'}</td>
    <td className="quantity">{order.new_quantity}</td>
    <td>{formatDate(order.new_orderdate)}</td>
    <td>{formatDate(order.new_neededby)}</td>
    <td>
                      <span style={{
                        backgroundColor: statusColors[status],
                        color: 'white',
                        padding: '2px 10px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 600
                      }}>
                        {status}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}