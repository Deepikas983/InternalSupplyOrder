import React, { useState } from 'react'
import type { New_catalogitems } from '../generated/models/New_catalogitemsModel'
import { New_internalordersService } from '../generated/services/New_internalordersService'
import '../styles/OrderModal.css'

type PowerAppsWindow = Window & {
  Microsoft?: {
    PowerApps?: {
      Pages?: {
        readUserInfo?: () => { userId?: string; displayName?: string }
      }
    }
  }
}

interface OrderModalProps {
  isOpen: boolean
  item: New_catalogitems
  onClose: () => void
  onSuccess: () => void
  onError: (error: string) => void
}

export default function OrderModal({
  isOpen,
  item,
  onClose,
  onSuccess,
  onError
}: OrderModalProps) {
  const [quantity, setQuantity] = useState(1)
  const [neededBy, setNeededBy] = useState('')
  const [deliveryLocation, setDeliveryLocation] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const handleSubmit = async () => {
    if (quantity < 1) {
      setToast({ message: 'Quantity must be at least 1', type: 'error' })
      return
    }
    if (!neededBy) {
      setToast({ message: 'Needed By date is required', type: 'error' })
      return
    }
    if (!deliveryLocation) {
      setToast({ message: 'Delivery Location is required', type: 'error' })
      return
    }

    try {
      setSubmitting(true)

      const today = new Date().toISOString().split('T')[0]
      const win = window as PowerAppsWindow
      const userInfo = win.Microsoft?.PowerApps?.Pages?.readUserInfo?.()
      const userId = userInfo?.userId

      // Get the next Order ID by fetching max and incrementing
      let nextOrderId = 1
      try {
       type OrdersResult = {
  data?: Array<{ new_orderid?: number }>
  value?: Array<{ new_orderid?: number }>
}

const existingResult = await New_internalordersService.getAll({
  select: ['new_orderid']
})

const resultObj = existingResult as unknown as OrdersResult
const orders = resultObj.data ?? resultObj.value ?? []
const maxId = orders.reduce((max, order) => Math.max(max, order.new_orderid ?? 0), 0)
nextOrderId = maxId + 1
      } catch (err) {
        console.warn('Could not fetch max Order ID, using 1:', err)
      }

      // Build order record without requiring user ID
      const orderRecord: Record<string, unknown> = {
        'new_Item@odata.bind': `/new_catalogitems(${item.new_catalogitemid})`,
        new_quantity: quantity,
        new_neededby: neededBy,
        new_deliverylocation: deliveryLocation,
        new_notes: notes,
        new_orderdate: today,
        new_orderid: nextOrderId,
        new_orderstatus: 100000000,
        statecode: 0,
        statuscode: 1
      }

      // Set owner if user ID is available
      if (userId) {
        orderRecord.ownerid = userId
        orderRecord.owneridtype = 'systemuser'
      }

      await New_internalordersService.create(orderRecord as Parameters<typeof New_internalordersService.create>[0])

      setToast({ message: 'Order placed successfully!', type: 'success' })

      setTimeout(() => {
        onSuccess()
        resetForm()
      }, 1500)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create order'
      setToast({ message: errorMsg, type: 'error' })
      onError(`Order creation error: ${errorMsg}`)
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setQuantity(1)
    setNeededBy('')
    setDeliveryLocation('')
    setNotes('')
    setToast(null)
  }

  if (!isOpen) return null

  const minDate = new Date().toISOString().split('T')[0]

  return (
    <>
      <div className="modal-overlay" onClick={onClose} />

      <div className="modal">
        <div className="modal-header">
          <h2>Place Order</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="order-form">
          <div className="form-group">
            <label className="form-label">Item</label>
            <input
              type="text"
              value={item.new_itemname || ''}
              readOnly
              className="form-input read-only"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Quantity *</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              min="1"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Needed By *</label>
            <input
              type="date"
              value={neededBy}
              onChange={(e) => setNeededBy(e.target.value)}
              min={minDate}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Delivery Location *</label>
            <input
              type="text"
              value={deliveryLocation}
              onChange={(e) => setDeliveryLocation(e.target.value)}
              placeholder="e.g., Building A, Room 101"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes or special requests..."
              rows={3}
              className="form-input"
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Placing Order...' : 'Place Order'}
            </button>
          </div>
        </div>

        {toast && (
          <div className={`toast ${toast.type}`}>
            {toast.message}
          </div>
        )}
      </div>
    </>
  )
}