import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useLocation, useParams } from 'react-router-dom'
import { fetchProductsByCategory } from '../../store/products/productsSlice'
import '../pages/Landing.css'
import '../categories/CategoriesPage.css'
import './ProductsPage.css'

function firstImage(product) {
  try {
    const images = JSON.parse(product.images || '[]')
    return images[0] || null
  } catch {
    return null
  }
}

export default function ProductsPage() {
  const { categoryId } = useParams()
  const location = useLocation()
  const dispatch = useDispatch()
  const { items, status, error } = useSelector((state) => state.products)

  useEffect(() => {
    dispatch(fetchProductsByCategory(categoryId))
  }, [dispatch, categoryId])

  const categoryName = location.state?.categoryName || items[0]?.category?.name || 'Products'

  return (
    <div className="categories-page">
      <nav className="navbar">
        <Link to="/" className="navbar-logo font-display">
          FITstore
          <span>Performance Edit</span>
        </Link>
        <Link to="/categories" className="navbar-category font-display">All Categories</Link>
      </nav>

      <section className="section categories-section">
        <div className="section-header">
          <h2 className="section-title categories-title">{categoryName}</h2>
        </div>

        {status === 'loading' && <p className="categories-status">Loading products…</p>}

        {status === 'failed' && (
          <div className="categories-status">
            <p>{error || 'Something went wrong loading products.'}</p>
            <button className="btn-outline btn-sm" onClick={() => dispatch(fetchProductsByCategory(categoryId))}>
              Retry
            </button>
          </div>
        )}

        {status === 'succeeded' && items.length === 0 && (
          <p className="categories-status">No products found in this category.</p>
        )}

        {status === 'succeeded' && items.length > 0 && (
          <div className="products-grid">
            {items.map((product) => {
              const image = firstImage(product)
              return (
                <div key={product.id} className="product-tile card">
                  <div className="category-card-image-wrap">
                    {image ? (
                      <img src={image} alt={product.name} />
                    ) : (
                      <div className="category-card-placeholder font-display">{product.name.charAt(0)}</div>
                    )}
                    {product.discount > 0 && (
                      <span className="tag tag-warm card-tag">{product.discount}% OFF</span>
                    )}
                  </div>
                  <div className="card-body">
                    <div className="card-category label">{product.brand}</div>
                    <h3 className="card-name">{product.name}</h3>
                    <div className="card-footer">
                      <div>
                        <span className="card-price">₹{product.selling_price}</span>
                        {product.mrp && product.mrp !== product.selling_price && (
                          <span className="card-price-orig">₹{product.mrp}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
