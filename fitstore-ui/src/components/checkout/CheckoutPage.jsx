import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { fetchBag } from '../../store/cart/cartSlice'
import { placeOrder, clearOrderError } from '../../store/orders/ordersSlice'
import Navbar from '../common/Navbar.jsx'
import '../pages/Landing.css'
import '../categories/CategoriesPage.css'
import '../cart/CartPage.css'
import './CheckoutPage.css'

function Spinner() {
  return (
    <svg className="spinner" width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
      <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

export default function CheckoutPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const token = useSelector((state) => state.auth.token)
  const user = useSelector((state) => state.auth.user)
  const { items, fetchStatus } = useSelector((state) => state.cart)
  const { status: orderStatus, error: orderError, lastOrder } = useSelector((state) => state.orders)

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    addressLine: '',
    city: '',
    state: '',
    pincode: '',
  })

  useEffect(() => {
    if (!token) {
      navigate('/')
      return
    }
    dispatch(fetchBag(token))
  }, [dispatch, navigate, token])

  // Nothing to check out with an empty bag — send them back rather than showing
  // a shipping form for zero items. Skipped once an order's just been placed,
  // since placing one also empties the bag and we want the confirmation to stay.
  useEffect(() => {
    if (orderStatus === 'succeeded') return
    if (fetchStatus === 'succeeded' && items.length === 0) {
      navigate('/bag')
    }
  }, [fetchStatus, items.length, navigate, orderStatus])

  if (!token) return null

  const updateField = (field) => (e) => {
    if (orderError) dispatch(clearOrderError())
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const submitting = orderStatus === 'loading'

  const handlePlaceOrder = async () => {
    if (submitting) return
    const result = await dispatch(placeOrder({ payload: form, token }))
    if (result.meta.requestStatus === 'fulfilled') {
      dispatch(fetchBag(token))
    }
  }

  if (orderStatus === 'succeeded' && lastOrder) {
    return (
      <div className="categories-page">
        <Navbar centerLabel="Continue Shopping" centerTo="/categories" />

        <section className="section checkout-section">
          <div className="cart-empty">
            <h3 className="cart-empty-title">Order Placed!</h3>
            <p className="cart-empty-desc">
              Thanks, {lastOrder.shipping_name}. Order #{lastOrder.id} is pending approval.
              <br />
              Shipping to {lastOrder.shipping_address}, {lastOrder.shipping_city},{' '}
              {lastOrder.shipping_state} – {lastOrder.shipping_pincode}
            </p>
            <div className="cart-empty-actions">
              <Link to="/categories" className="btn-primary">Continue Shopping</Link>
            </div>
          </div>
        </section>
      </div>
    )
  }

  const totalItems = items.reduce((sum, row) => sum + row.quantity, 0)
  const subtotal = items.reduce(
    (sum, row) => sum + Number(row.product.mrp || row.product.selling_price) * row.quantity,
    0,
  )
  const total = items.reduce((sum, row) => sum + Number(row.product.selling_price) * row.quantity, 0)
  const savings = subtotal - total

  return (
    <div className="categories-page">
      <Navbar centerLabel="Back to Bag" centerTo="/bag" />

      <section className="section checkout-section">
        <div className="section-header">
          <h2 className="section-title categories-title">Checkout</h2>
        </div>

        {fetchStatus === 'loading' && <p className="categories-status">Loading your bag…</p>}

        {fetchStatus === 'failed' && (
          <div className="categories-status">
            <p>Something went wrong loading your bag.</p>
            <button className="btn-outline btn-sm" onClick={() => dispatch(fetchBag(token))}>
              Retry
            </button>
          </div>
        )}

        {fetchStatus === 'succeeded' && items.length > 0 && (
          <div className="cart-layout">
            <form
              className="checkout-form card"
              onSubmit={(e) => {
                e.preventDefault()
                handlePlaceOrder()
              }}
            >
              <h3 className="checkout-form-title">Shipping Details</h3>

              <label className="checkout-field">
                <span className="label">Full Name</span>
                <input type="text" value={form.name} onChange={updateField('name')} required />
              </label>

              <label className="checkout-field">
                <span className="label">Email</span>
                <input type="email" value={form.email} onChange={updateField('email')} required />
              </label>

              <label className="checkout-field">
                <span className="label">Address Line</span>
                <input
                  type="text"
                  placeholder="House no., street, area"
                  value={form.addressLine}
                  onChange={updateField('addressLine')}
                  required
                />
              </label>

              <div className="checkout-field-row">
                <label className="checkout-field">
                  <span className="label">City</span>
                  <input type="text" value={form.city} onChange={updateField('city')} required />
                </label>

                <label className="checkout-field">
                  <span className="label">State</span>
                  <input type="text" value={form.state} onChange={updateField('state')} required />
                </label>

                <label className="checkout-field">
                  <span className="label">PIN Code</span>
                  <input type="text" value={form.pincode} onChange={updateField('pincode')} required />
                </label>
              </div>

              {orderError && (
                <p className="cart-item-stock-warning">
                  {orderError.message || 'Something went wrong placing your order.'}
                </p>
              )}
            </form>

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

              <button
                type="button"
                className="btn-primary cart-checkout"
                disabled={submitting}
                onClick={handlePlaceOrder}
              >
                {submitting ? (
                  <>
                    <Spinner />
                    Placing Order…
                  </>
                ) : (
                  'Place Order'
                )}
              </button>

              {submitting && (
                <p className="checkout-submitting-hint">
                  This can take up to a couple of minutes — please don't refresh or close this page.
                </p>
              )}

              <Link to="/bag" className="checkout-back-link">← Back to Bag</Link>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
