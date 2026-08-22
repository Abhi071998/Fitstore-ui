import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { fetchBag } from '../../store/cart/cartSlice'
import Navbar from '../common/Navbar.jsx'
import '../pages/Landing.css'
import '../categories/CategoriesPage.css'
import '../cart/CartPage.css'
import './CheckoutPage.css'

export default function CheckoutPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const token = useSelector((state) => state.auth.token)
  const user = useSelector((state) => state.auth.user)
  const { items, fetchStatus } = useSelector((state) => state.cart)

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

  // Nothing to check out with an empty bag — send them back rather than
  // showing a shipping form for zero items.
  useEffect(() => {
    if (fetchStatus === 'succeeded' && items.length === 0) {
      navigate('/bag')
    }
  }, [fetchStatus, items.length, navigate])

  if (!token) return null

  const updateField = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
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
            <form className="checkout-form card" onSubmit={(e) => e.preventDefault()}>
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

              <button type="button" className="btn-primary cart-checkout">
                Place Order
              </button>

              <Link to="/bag" className="checkout-back-link">← Back to Bag</Link>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
