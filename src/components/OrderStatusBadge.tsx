import React from 'react'
import '../styles/OrderStatusBadge.css'

export type OrderStatus = 'Submitted' | 'Approved' | 'InProgress' | 'Ordered' | 'Delivered' | 'Denied'

interface OrderStatusBadgeProps {
  status: OrderStatus
}

const statusConfig = {
  'Submitted': { label: 'Submitted', className: 'status-submitted' },
  'Approved': { label: 'Approved', className: 'status-approved' },
  'InProgress': { label: 'In Progress', className: 'status-in-progress' },
  'Ordered': { label: 'Ordered', className: 'status-ordered' },
  'Delivered': { label: 'Delivered', className: 'status-delivered' },
  'Denied': { label: 'Denied', className: 'status-denied' }
}

export default function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const config = statusConfig[status] || { label: status, className: 'status-unknown' }

  return (
    <span className={`status-badge ${config.className}`}>
      {config.label}
    </span>
  )
}
