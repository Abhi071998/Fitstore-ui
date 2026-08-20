import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { fetchBag } from '../../store/cart/cartSlice'
import { firstImage } from '../products/productImages'
import Navbar from '../common/Navbar.jsx'
import '../pages/Landing.css'
import '../categories/CategoriesPage.css'
import './CartPage.css'

export default function CartPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const token = useSelector((state) => state.auth.token)
  const { items, fetchStatus } = useSelector((state) => state.cart)

  useEffect(() => {
    if (!token) {
      navigate('/')
      return
    }
    dispatch(fetchBag(token))
  }, [dispatch, navigate, token])

  if (!token) return null

  const totalItems = items.reduce((sum, row) => sum + row.quantity, 0)
  const subtotal = items.reduce(
    (sum, row) => sum + Number(row.product.mrp || row.product.selling_price) * row.quantity,
    0,
  )
  const total = items.reduce((sum, row) => sum + Number(row.product.selling_price) * row.quantity, 0)
  const savings = subtotal - total

  return (
    <div className="categories-page">
      <Navbar centerLabel="Continue Shopping" centerTo="/categories" />

      <section className="section cart-section">
        <div className="section-header">
          <h2 className="section-title categories-title">Your Bag</h2>
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

        {fetchStatus === 'succeeded' && items.length === 0 && (
          <div className="categories-status">
            <p>Your bag is empty.</p>
            <Link to="/categories" className="btn-outline btn-sm">Browse Categories</Link>
          </div>
        )}

        {fetchStatus === 'succeeded' && items.length > 0 && (
          <div className="cart-layout">
            <div className="cart-items">
              {items.map((row) => {
                const image = firstImage(row.product)
                return (
                  <div key={row.id} className="cart-item card">
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

              <button className="btn-primary cart-checkout">Proceed to Checkout</button>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
