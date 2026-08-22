import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { fetchBag, removeBagItem, updateBagItemQuantity, clearUpdateError } from '../../store/cart/cartSlice'
import { firstImage } from '../products/productImages'
import Navbar from '../common/Navbar.jsx'
import QuantityModal from './QuantityModal.jsx'
import '../pages/Landing.css'
import '../categories/CategoriesPage.css'
import './CartPage.css'

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  )
}

function PencilIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="M15 5l4 4" />
    </svg>
  )
}

function BagIcon() {
  return (
    <svg width="120" height="120" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M38 30c0-9 5.5-16 12-16s12 7 12 16" />
      <path d="M26 30h48l5 56a4 4 0 0 1-4 4H25a4 4 0 0 1-4-4l5-56Z" />
      <path d="M26 30h48" />
    </svg>
  )
}

export default function CartPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const token = useSelector((state) => state.auth.token)
  const { items, fetchStatus, removingId, updatingId, updateError } = useSelector((state) => state.cart)
  const [editingRow, setEditingRow] = useState(null)

  useEffect(() => {
    if (!token) {
      navigate('/')
      return
    }
    dispatch(fetchBag(token))
  }, [dispatch, navigate, token])

  if (!token) return null

  const openEditor = (row) => {
    if (updateError) dispatch(clearUpdateError())
    setEditingRow(row)
  }

  const closeEditor = () => setEditingRow(null)

  const totalItems = items.reduce((sum, row) => sum + row.quantity, 0)
  const subtotal = items.reduce(
    (sum, row) => sum + Number(row.product.mrp || row.product.selling_price) * row.quantity,
    0,
  )
  const total = items.reduce((sum, row) => sum + Number(row.product.selling_price) * row.quantity, 0)
  const savings = subtotal - total
  const hasStockIssues = items.some((row) => row.stock != null && row.quantity > row.stock)
  const modalSubmitting = editingRow != null && updatingId === editingRow.id
  const modalError = editingRow != null && updateError?.id === editingRow.id ? updateError : null

  return (
    <div className="categories-page">
      <Navbar centerLabel="Continue Shopping" centerTo="/categories" />

      <section className="section cart-section">
        {!(fetchStatus === 'succeeded' && items.length === 0) && (
          <div className="section-header">
            <h2 className="section-title categories-title">Your Bag</h2>
          </div>
        )}

        {fetchStatus === 'loading' && <p className="categories-status">Loading your bag…</p>}

        {fetchStatus === 'failed' && (
          <div className="categories-status">
            <p>Something went wrong loading your bag.</p>
            <button className="btn-outline btn-sm" onClick={() => dispatch(fetchBag(token))}>
              Retry
            </button>
          </div>
        )}

        {fetchStatus === 'succeeded' && items.length === 0 && (
          <div className="cart-empty">
            <BagIcon />
            <h3 className="cart-empty-title">Your Bag is Empty</h3>
            <p className="cart-empty-desc">
              Your bag is ready to roll, but it's feeling a bit empty without some stylish finds.
            </p>
            <div className="cart-empty-actions">
              <Link to="/categories" className="btn-primary">Start Shopping</Link>
              <Link to="/" className="btn-outline">Back to Home</Link>
            </div>
          </div>
        )}

        {fetchStatus === 'succeeded' && items.length > 0 && (
          <div className="cart-layout">
            <div className="cart-items">
              {items.map((row) => {
                const image = firstImage(row.product)
                const exceedsStock = row.stock != null && row.quantity > row.stock
                const isBusy = removingId === row.id || updatingId === row.id
                return (
                  <div key={row.id} className={`cart-item card${exceedsStock ? ' stock-exceeded' : ''}`}>
                    <div className="cart-item-actions">
                      <button
                        type="button"
                        className="cart-item-edit"
                        onClick={() => openEditor(row)}
                        disabled={isBusy}
                        aria-label={`Edit quantity for ${row.product.name} (size ${row.size})`}
                      >
                        <PencilIcon />
                      </button>
                      <button
                        type="button"
                        className="cart-item-remove"
                        onClick={() => dispatch(removeBagItem({ id: row.id, token }))}
                        disabled={isBusy}
                        aria-label={`Remove ${row.product.name} (size ${row.size}) from bag`}
                      >
                        <TrashIcon />
                      </button>
                    </div>

                    <div className="cart-item-image">
                      {image ? (
                        <img src={image} alt={row.product.name} />
                      ) : (
                        <div className="category-card-placeholder font-display">
                          {row.product.name.charAt(0)}
                        </div>
                      )}
                    </div>

                    <div className="cart-item-body">
                      <div className="card-category label">{row.product.brand}</div>
                      <Link
                        to={`/products/${row.product.category_id}/${row.product.id}`}
                        className="cart-item-name"
                      >
                        {row.product.name}
                      </Link>
                      <div className="cart-item-meta">
                        <span className="tag">Size {row.size}</span>
                        <span className="cart-item-qty">Qty {row.quantity}</span>
                      </div>
                      {exceedsStock && (
                        <p className="cart-item-stock-warning">
                          Only {row.stock} left in stock — remove or reduce this item to continue.
                        </p>
                      )}
                    </div>

                    <div className="cart-item-price">
                      <div>
                        <span className="card-price">₹{row.product.selling_price}</span>
                        {row.product.mrp && row.product.mrp !== row.product.selling_price && (
                          <span className="card-price-orig">₹{row.product.mrp}</span>
                        )}
                      </div>
                      <span className="cart-item-line-total">
                        ₹{(Number(row.product.selling_price) * row.quantity).toFixed(0)}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="cart-summary card">
              <h3 className="cart-summary-title">Order Summary</h3>

              <div className="cart-summary-row">
                <span>Items ({totalItems})</span>
                <span>₹{subtotal.toFixed(0)}</span>
              </div>

              {savings > 0 && (
                <div className="cart-summary-row cart-summary-savings">
                  <span>Savings</span>
                  <span>−₹{savings.toFixed(0)}</span>
                </div>
              )}

              <div className="cart-summary-row cart-summary-total">
                <span>Total</span>
                <span>₹{total.toFixed(0)}</span>
              </div>

              {hasStockIssues && (
                <p className="cart-summary-warning">
                  One or more items exceed available stock. Resolve them before checking out.
                </p>
              )}

              <button className="btn-primary cart-checkout" disabled={hasStockIssues}>
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </section>

      {editingRow ? (
        <QuantityModal
          row={editingRow}
          onClose={closeEditor}
          onUpdate={async (targetQuantity) => {
            const result = await dispatch(updateBagItemQuantity({
              id: editingRow.id,
              productId: editingRow.product.id,
              size: editingRow.size,
              currentQuantity: editingRow.quantity,
              targetQuantity,
              stock: editingRow.stock,
              token,
            }))

            if (result.meta.requestStatus === 'fulfilled') {
              await dispatch(fetchBag(token))
              closeEditor()
            }
          }}
          submitting={modalSubmitting}
          error={modalError}
        />
      ) : null}
    </div>
  )
}
