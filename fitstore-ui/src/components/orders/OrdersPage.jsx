import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { fetchOrders } from '../../store/orders/ordersSlice'
import { firstImage } from '../products/productImages'
import Navbar from '../common/Navbar.jsx'
import '../pages/Landing.css'
import '../categories/CategoriesPage.css'
import '../cart/CartPage.css'
import './OrdersPage.css'

function PackageIcon() {
  return (
    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4a2 2 0 0 0 1-1.73Z" />
      <path d="M3.3 7 12 12l8.7-5" />
      <path d="M12 22V12" />
    </svg>
  )
}

function statusTagClass(status) {
  const s = (status || '').toLowerCase()
  if (s.includes('cancel') || s.includes('reject')) return 'tag-danger'
  if (s.includes('pending')) return 'tag-warm'
  if (s.includes('approve') || s.includes('ship') || s.includes('deliver')) return 'tag-success'
  return ''
}

function formatStatus(status) {
  return (status || '')
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function OrdersPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const token = useSelector((state) => state.auth.token)
  const { list: orders, listStatus, listError } = useSelector((state) => state.orders)

  useEffect(() => {
    if (!token) {
      navigate('/')
      return
    }
    dispatch(fetchOrders(token))
  }, [dispatch, navigate, token])

  if (!token) return null

  return (
    <div className="categories-page">
      <Navbar centerLabel="Continue Shopping" centerTo="/categories" />

      <section className="section cart-section">
        <div className="section-header">
          <h2 className="section-title categories-title">My Orders</h2>
        </div>

        {listStatus === 'loading' && <p className="categories-status">Loading your orders…</p>}

        {listStatus === 'failed' && (
          <div className="categories-status">
            <p>{listError?.message || 'Something went wrong loading your orders.'}</p>
            <button className="btn-outline btn-sm" onClick={() => dispatch(fetchOrders(token))}>
              Retry
            </button>
          </div>
        )}

        {listStatus === 'succeeded' && orders.length === 0 && (
          <div className="cart-empty">
            <PackageIcon />
            <h3 className="cart-empty-title">No Orders Yet</h3>
            <p className="cart-empty-desc">
              You haven't placed any orders yet. Once you do, they'll show up here.
            </p>
            <div className="cart-empty-actions">
              <Link to="/categories" className="btn-primary">Start Shopping</Link>
            </div>
          </div>
        )}

        {listStatus === 'succeeded' && orders.length > 0 && (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order.id} className="order-card card">
                <div className="order-card-header">
                  <div className="order-card-heading">
                    <span className="order-card-id">Order #{order.id}</span>
                    <span className="order-card-date">{formatDate(order.created_at)}</span>
                  </div>
                  <span className={`tag ${statusTagClass(order.status)}`}>{formatStatus(order.status)}</span>
                </div>

                <div className="order-card-items">
                  {order.order_items.map((item) => {
                    const image = firstImage(item.product)
                    const cancelled = item.status === 'cancelled'
                    return (
                      <div key={item.id} className={`order-item${cancelled ? ' order-item-cancelled' : ''}`}>
                        <div className="order-item-image">
                          {image ? (
                            <img src={image} alt={item.product.name} />
                          ) : (
                            <div className="category-card-placeholder font-display">
                              {item.product.name.charAt(0)}
                            </div>
                          )}
                        </div>

                        <div className="order-item-body">
                          <span className="order-item-name">{item.product.name}</span>
                          <div className="cart-item-meta">
                            <span className="tag">Size {item.size}</span>
                            <span className="cart-item-qty">Qty {item.quantity}</span>
                            {cancelled && <span className="tag tag-danger">Cancelled</span>}
                          </div>
                        </div>

                        <div className="order-item-price">
                          ₹{(Number(item.unit_price) * item.quantity).toFixed(0)}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {order.admin_comment && (
                  <div className="order-card-comment">
                    <span className="label">Note from FITstore</span>
                    <p>{order.admin_comment}</p>
                  </div>
                )}

                <div className="order-card-footer">
                  <div className="order-card-shipping">
                    <span className="label">Shipping to</span>
                    <p>
                      {order.shipping_address}, {order.shipping_city}, {order.shipping_state} –{' '}
                      {order.shipping_pincode}
                    </p>
                  </div>
                  <div className="order-card-total">
                    <span className="label">Total</span>
                    <span className="order-card-total-value">₹{Number(order.total).toFixed(0)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
