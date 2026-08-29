import { useState, useRef, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { fetchCategories } from '../../store/categories/categoriesSlice'
import Navbar from '../common/Navbar.jsx'
import '../categories/CategoriesPage.css'
import './Landing.css'

const MARQUEE_ITEMS = [
  'Free shipping over $75',
  'Sweat-tested performance fabrics',
  'New drops every Friday',
  'Free returns within 30 days',
  'Rewards on every order',
  'Sustainably sourced materials',
]

const FEATURES = [
  { icon: '🚚', title: 'Free Shipping', desc: 'Complimentary delivery on all orders over $75, worldwide.' },
  { icon: '💧', title: 'Sweat-Tested', desc: 'Every fabric is tested for breathability and moisture-wicking performance.' },
  { icon: '↩️', title: 'Easy Returns', desc: 'Changed your mind? Returns are free within 30 days, no questions.' },
  { icon: '🧵', title: 'Built to Last', desc: 'Reinforced stitching engineered for high-intensity training.' },
]

export default function Landing() {
  const dispatch = useDispatch()
  const { items: categories, status: categoriesStatus, error: categoriesError } = useSelector(
    (state) => state.categories,
  )
  const [slide, setSlide] = useState(0)
  const [step, setStep] = useState({ offset: 0, visible: 3 })
  const trackRef = useRef(null)

  useEffect(() => {
    dispatch(fetchCategories())
  }, [dispatch])

  // Card width/visible-count vary per breakpoint (CSS controls the sizing),
  // so measure the rendered card rather than assuming a fixed percentage —
  // that's what kept the slider's step in sync on smaller screens.
  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    const measure = () => {
      const firstCard = track.children[0]
      if (!firstCard) return
      const gap = parseFloat(getComputedStyle(track).columnGap) || 0
      const offset = firstCard.offsetWidth + gap
      const visible = Math.max(1, Math.round(track.parentElement.offsetWidth / offset))
      setStep({ offset, visible })
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(track)
    return () => observer.disconnect()
  }, [categories.length])

  const maxSlide = Math.max(0, categories.length - step.visible)

  // Clamp the current slide when a resize shrinks the visible count
  // (e.g. rotating from a 3-up desktop layout to a 1-up mobile one).
  useEffect(() => {
    setSlide((s) => Math.min(s, maxSlide))
  }, [maxSlide])

  const prev = () => setSlide((s) => Math.max(0, s - 1))
  const next = () => setSlide((s) => Math.min(maxSlide, s + 1))

  return (
    <div className="landing">
      <Navbar centerLabel="Discover Categories" centerTo="/categories" showActions />

      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-left">
          <div className="eyebrow hero-eyebrow">FALL 2026 TRAINING EDIT</div>

          <h1 className="hero-title">
            Style is<br />
            <em>a way to say</em><br />
            who you are.
          </h1>

          <p className="hero-desc">
            Performance essentials for the seriously committed. Every piece is
            tested, engineered, and built to outlast your hardest sessions.
          </p>

          <div className="hero-cta">
            <button className="btn-primary">Shop Collection</button>
            <button className="btn-ghost">Watch Campaign</button>
          </div>

          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-num font-display">180+</span>
              <span className="label">Styles</span>
            </div>
            <div className="stat-item">
              <span className="stat-num font-display">12</span>
              <span className="label">Countries</span>
            </div>
            <div className="stat-item">
              <span className="stat-num font-display">4.8★</span>
              <span className="label">Rated</span>
            </div>
          </div>
        </div>

        <div className="hero-right">
          <img
            className="hero-image-main"
            src="https://loremflickr.com/900/1100/tshirt,model?lock=20"
            alt="Model wearing the FITstore shirt collection"
          />
          <div className="hero-image-badge">
            <span className="badge-dot" />
            <div className="badge-text label">
              <strong className="font-display">Trending Now</strong>
              Signature Graphic Shirts
            </div>
          </div>
        </div>
      </section>

      {/* ── Marquee ── */}
      <div className="marquee-section">
        <div className="marquee-track">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} className="marquee-item font-display">{item}</span>
          ))}
        </div>
      </div>

      {/* ── Product slider ── */}
      <section className="section">
        <div className="section-header">
          <div>
            <div className="eyebrow">Curated for you</div>
            <h2 className="section-title">
              Shop by<br /><em>Category</em>
            </h2>
          </div>
          {categoriesStatus === 'succeeded' && categories.length > 0 && (
            <div className="slider-controls">
              <button className="btn-icon" onClick={prev} disabled={slide === 0} aria-label="Previous">←</button>
              <button className="btn-icon" onClick={next} disabled={slide >= maxSlide} aria-label="Next">→</button>
            </div>
          )}
        </div>

        {categoriesStatus === 'loading' && <p className="categories-status">Loading categories…</p>}

        {categoriesStatus === 'failed' && (
          <div className="categories-status">
            <p>{categoriesError || 'Something went wrong loading categories.'}</p>
            <button className="btn-outline btn-sm" onClick={() => dispatch(fetchCategories())}>
              Retry
            </button>
          </div>
        )}

        {categoriesStatus === 'succeeded' && categories.length === 0 && (
          <p className="categories-status">No categories available yet.</p>
        )}

        {categoriesStatus === 'succeeded' && categories.length > 0 && (
          <>
            <div className="slider-wrapper">
              <div
                ref={trackRef}
                className="slider-track"
                style={{ transform: `translateX(-${slide * step.offset}px)` }}
              >
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    to={`/products/${category.id}`}
                    state={{ categoryName: category.name }}
                    className="product-card card"
                  >
                    <div className="card-image-wrap">
                      {category.image_url ? (
                        <img src={category.image_url} alt={category.name} />
                      ) : (
                        <div className="category-card-placeholder font-display">
                          {category.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="card-body">
                      <h3 className="card-name">{category.name}</h3>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="slider-dots">
              {Array.from({ length: maxSlide + 1 }).map((_, i) => (
                <button
                  key={i}
                  className={`dot${slide === i ? ' active' : ''}`}
                  onClick={() => setSlide(i)}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </section>

      {/* ── Features strip ── */}
      <div className="features">
        {FEATURES.map((f) => (
          <div key={f.title} className="feature-item">
            <span className="feature-icon">{f.icon}</span>
            <h4 className="feature-title">{f.title}</h4>
            <p className="feature-desc">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* ── Footer ── */}
      <footer className="footer">
        <h4 className="footer-brand">FITstore</h4>
        <div className="footer-copy">© 2026 FITstore. All rights reserved.</div>
      </footer>
    </div>
  )
}
