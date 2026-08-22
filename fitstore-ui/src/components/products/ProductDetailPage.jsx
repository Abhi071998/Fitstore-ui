import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { fetchProductsByCategory } from '../../store/products/productsSlice'
import { addToBag, fetchBag, clearAddError } from '../../store/cart/cartSlice'
import { parseImages } from './productImages'
import Navbar from '../common/Navbar.jsx'
import '../pages/Landing.css'
import '../categories/CategoriesPage.css'
import './ProductDetailPage.css'

function parseFailedSizes(message) {
  const match = message?.match(/size\(s\):\s*(.+)$/i)
  if (!match) return []
  return match[1].split(',').map((s) => s.trim())
}

function AccordionItem({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="accordion-item">
      <button
        type="button"
        className="accordion-header"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span>{title}</span>
        <span className={`accordion-icon${open ? ' open' : ''}`}>+</span>
      </button>
      {open && <div className="accordion-content">{children}</div>}
    </div>
  )
}

export default function ProductDetailPage() {
  const { categoryId, productId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { items, status, error } = useSelector((state) => state.products)
  const token = useSelector((state) => state.auth.token)
  const { addStatus, addError } = useSelector((state) => state.cart)
  const [activeImage, setActiveImage] = useState(0)
  const [quantities, setQuantities] = useState({})
  const [justAdded, setJustAdded] = useState(false)

  useEffect(() => {
    if (!justAdded) return
    const timeout = setTimeout(() => setJustAdded(false), 3000)
    return () => clearTimeout(timeout)
  }, [justAdded])

  const fromState = location.state?.product
  const fromStore = items.find((item) => String(item.id) === productId)
  const product = fromState || fromStore

  useEffect(() => {
    if (!product) dispatch(fetchProductsByCategory(categoryId))
  }, [dispatch, categoryId, product])

  const centerLabel = `Back to ${product?.category?.name || 'Products'}`
  const centerTo = `/products/${categoryId}`

  if (!product) {
    return (
      <div className="categories-page">
        <Navbar centerLabel={centerLabel} centerTo={centerTo} showActions />

        <section className="section categories-section">
          {status === 'loading' && <p className="categories-status">Loading product…</p>}
          {status === 'failed' && (
            <div className="categories-status">
              <p>{error || 'Something went wrong loading this product.'}</p>
              <button className="btn-outline btn-sm" onClick={() => dispatch(fetchProductsByCategory(categoryId))}>
                Retry
              </button>
            </div>
          )}
          {status === 'succeeded' && <p className="categories-status">Product not found.</p>}
        </section>
      </div>
    )
  }

  const images = parseImages(product)
  const specs = Object.entries(product.specifications || {})
  const hasDiscount = product.mrp && product.mrp !== product.selling_price

  const updateQty = (size, delta) => {
    if (addError) dispatch(clearAddError())
    setQuantities((prev) => {
      const next = Math.min(size.stock, Math.max(0, (prev[size.id] || 0) + delta))
      return { ...prev, [size.id]: next }
    })
  }

  const totalSelected = Object.values(quantities).reduce((sum, qty) => sum + qty, 0)
  const submitting = addStatus === 'loading'
  const failedSizes = addStatus === 'failed' && addError?.status !== 401 ? parseFailedSizes(addError?.message) : []

  const handleAddToBag = async () => {
    if (!token) {
      navigate('/')
      return
    }

    const bagItems = product.sizes
      .filter((s) => (quantities[s.id] || 0) > 0)
      .map((s) => ({ size: s.size, quantity: quantities[s.id] }))

    const result = await dispatch(addToBag({ productId: product.id, items: bagItems, token }))

    if (result.meta.requestStatus === 'fulfilled') {
      setQuantities({})
      setJustAdded(true)
      dispatch(fetchBag(token))
    } else if (result.payload?.status === 401) {
      navigate('/')
    }
  }

  return (
    <div className="categories-page">
      <Navbar centerLabel={centerLabel} centerTo={centerTo} showActions />

      <section className="section product-detail">
        <div className="product-detail-gallery">
          <div className="product-detail-main-image">
            {images.length > 0 ? (
              <img src={images[activeImage]} alt={product.name} />
            ) : (
              <div className="category-card-placeholder font-display">{product.name.charAt(0)}</div>
            )}
            {product.discount > 0 && <span className="tag tag-warm card-tag">{product.discount}% OFF</span>}
          </div>

          {images.length > 1 && (
            <div className="product-detail-thumbs">
              {images.map((img, i) => (
                <button
                  key={img}
                  className={`product-detail-thumb${i === activeImage ? ' active' : ''}`}
                  onClick={() => setActiveImage(i)}
                  aria-label={`Show image ${i + 1}`}
                >
                  <img src={img} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="product-detail-info">
          <div className="card-category label">{product.brand}</div>
          <h1 className="product-detail-title">{product.name}</h1>

          <div className="product-detail-price">
            <span className="product-detail-price-now">₹{product.selling_price}</span>
            {hasDiscount && (
              <>
                <span className="card-price-orig">₹{product.mrp}</span>
                <span className="tag tag-success">{product.discount}% off</span>
              </>
            )}
          </div>

          {product.description && <p className="product-detail-desc">{product.description}</p>}

          {product.sizes?.length > 0 && (
            <div className="product-detail-sizes">
              <span className="label">Select Sizes &amp; Quantities</span>
              <div className="product-detail-size-list">
                {product.sizes.map((s) => {
                  const qty = quantities[s.id] || 0
                  const outOfStock = s.stock === 0
                  const hasFailed = failedSizes.includes(s.size)
                  return (
                    <div
                      key={s.id}
                      className={`product-detail-size-row${outOfStock ? ' out-of-stock' : ''}${hasFailed ? ' size-error' : ''}`}
                    >
                      <span className="product-detail-size-name">{s.size}</span>
                      <span className="product-detail-size-stock">
                        {hasFailed ? 'Insufficient stock' : outOfStock ? 'Out of stock' : `${s.stock} available`}
                      </span>
                      <div className="qty-stepper">
                        <button
                          type="button"
                          onClick={() => updateQty(s, -1)}
                          disabled={outOfStock || qty === 0}
                          aria-label={`Decrease quantity for size ${s.size}`}
                        >
                          −
                        </button>
                        <span className="qty-value">{qty}</span>
                        <button
                          type="button"
                          onClick={() => updateQty(s, 1)}
                          disabled={outOfStock || qty >= s.stock}
                          aria-label={`Increase quantity for size ${s.size}`}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <button
            className="btn-primary product-detail-cta"
            disabled={(product.sizes?.length > 0 && totalSelected === 0) || submitting}
            onClick={handleAddToBag}
          >
            {submitting ? 'Adding…' : `Add to Bag${totalSelected > 0 ? ` (${totalSelected})` : ''}`}
          </button>

          {justAdded && <p className="product-detail-add-success">Added to bag!</p>}

          {addStatus === 'failed' && addError?.status !== 401 && (
            <p className="product-detail-add-error">
              {addError?.message || 'Something went wrong adding this to your bag.'}
            </p>
          )}

          <div className="accordion">
            <AccordionItem title="Details">
              {specs.length > 0 ? (
                <dl className="product-detail-spec-list">
                  {specs.map(([key, value]) => (
                    <div key={key} className="product-detail-spec-row">
                      <dt>{key}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p>No additional details available for this product.</p>
              )}
            </AccordionItem>

            <AccordionItem title="Reviews">
              <p>No reviews yet. Be the first to review this product.</p>
            </AccordionItem>

            <AccordionItem title="Delivery">
              <p>Free shipping on orders over ₹999. Delivered in 3–5 business days.</p>
            </AccordionItem>

            <AccordionItem title="Returns">
              <p>Returns accepted within 30 days of delivery. Items must be unused, unwashed, and with original tags.</p>
            </AccordionItem>
          </div>

          <div className="product-detail-meta">
            <span>SKU: {product.sku}</span>
            <span>Style: {product.product_code}</span>
          </div>
        </div>
      </section>
    </div>
  )
}
