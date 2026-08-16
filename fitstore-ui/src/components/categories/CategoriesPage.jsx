import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { fetchCategories } from '../../store/categories/categoriesSlice'
import '../pages/Landing.css'
import './CategoriesPage.css'

export default function CategoriesPage() {
  const dispatch = useDispatch()
  const { items, status, error } = useSelector((state) => state.categories)

  useEffect(() => {
    dispatch(fetchCategories())
  }, [dispatch])

  return (
    <div className="categories-page">
      <nav className="navbar">
        <Link to="/" className="navbar-logo font-display">
          FITstore
          <span>Performance Edit</span>
        </Link>
        <Link to="/" className="navbar-category font-display">Back to Shop</Link>
      </nav>

      <section className="section categories-section">
        <div className="section-header">
          <h2 className="section-title categories-title">All Categories</h2>
        </div>

        {status === 'loading' && <p className="categories-status">Loading categories…</p>}

        {status === 'failed' && (
          <div className="categories-status">
            <p>{error || 'Something went wrong loading categories.'}</p>
            <button className="btn-outline btn-sm" onClick={() => dispatch(fetchCategories())}>
              Retry
            </button>
          </div>
        )}

        {status === 'succeeded' && items.length === 0 && (
          <p className="categories-status">No categories found.</p>
        )}

        {status === 'succeeded' && items.length > 0 && (
          <div className="categories-grid">
            {items.map((category) => (
              <div key={category.id} className="category-card card">
                <div className="category-card-image-wrap">
                  {category.image_url ? (
                    <img src={category.image_url} alt={category.name} />
                  ) : (
                    <div className="category-card-placeholder font-display">{category.name.charAt(0)}</div>
                  )}
                </div>
                <div className="card-body">
                  <h3 className="card-name">{category.name}</h3>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
