import { useState } from 'react'
import { firstImage } from '../products/productImages'

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  )
}

// Popup for editing one bag row's quantity. The +/- buttons only change local
// state — nothing hits the network until "Update" is clicked, so N clicks cost
// one request instead of N.
export default function QuantityModal({ row, onClose, onUpdate, submitting, error }) {
  const [pendingQty, setPendingQty] = useState(row.quantity)
  const image = firstImage(row.product)
  const atStockCeiling = row.stock != null && pendingQty >= row.stock

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card card" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
          <CloseIcon />
        </button>

        <div className="modal-product">
          <div className="modal-product-image">
            {image ? (
              <img src={image} alt={row.product.name} />
            ) : (
              <div className="category-card-placeholder font-display">{row.product.name.charAt(0)}</div>
            )}
          </div>
          <div>
            <div className="card-category label">{row.product.brand}</div>
            <h3 className="modal-product-name">{row.product.name}</h3>
            <span className="tag">Size {row.size}</span>
          </div>
        </div>

        <div className="modal-qty-row">
          <span className="label">Quantity</span>
          <div className="qty-stepper">
            <button
              type="button"
              onClick={() => setPendingQty((q) => Math.max(q - 1, 0))}
              disabled={submitting || pendingQty <= 0}
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="qty-value">{pendingQty}</span>
            <button
              type="button"
              onClick={() => setPendingQty((q) => (row.stock != null ? Math.min(q + 1, row.stock) : q + 1))}
              disabled={submitting || atStockCeiling}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
        </div>

        {row.stock != null && (
          <p className="modal-stock-hint">
            {pendingQty === 0 ? 'Reducing to 0 will remove this item.' : `${row.stock} available`}
          </p>
        )}

        {error && <p className="cart-item-stock-warning">{error.message || 'Something went wrong updating this item.'}</p>}

        <div className="modal-actions">
          <button type="button" className="btn-outline btn-sm" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-primary btn-sm"
            onClick={() => onUpdate(pendingQty)}
            disabled={submitting || pendingQty === row.quantity}
          >
            {submitting ? 'Updating…' : 'Update'}
          </button>
        </div>
      </div>
    </div>
  )
}
