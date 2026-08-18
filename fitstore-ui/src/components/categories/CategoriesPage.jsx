import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { fetchCategories } from '../../store/categories/categoriesSlice'
import Navbar from '../common/Navbar.jsx'
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
      <Navbar centerLabel="Back to Shop" centerTo="/" />

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
              <Link
                key={category.id}
                to={`/products/${category.id}`}
                state={{ categoryName: category.name }}
                className="category-card card"
              >
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
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
