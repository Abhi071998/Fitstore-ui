import { useState, useRef, useEffect } from 'react'
import Navbar from '../common/Navbar.jsx'
import './Landing.css'

const PRODUCTS = [
  {
    id: 1,
    name: 'Momentum Leggings',
    category: 'Leggings',
    tag: 'New Season',
    price: '$68',
    orig: '$85',
    img: 'https://loremflickr.com/600/800/leggings,fitness?lock=11',
  },
  {
    id: 2,
    name: 'ThermoFlex Training Jacket',
    category: 'Outerwear',
    tag: 'Bestseller',
    price: '$128',
    orig: null,
    img: 'https://loremflickr.com/600/800/jacket,mens?lock=12',
  },
  {
    id: 3,
    name: 'Core Compression Tee',
    category: 'Tops',
    tag: 'Limited',
    price: '$42',
    orig: '$52',
    img: 'https://loremflickr.com/600/800/tshirt,mens?lock=13',
  },
  {
    id: 4,
    name: 'Signature Graphic Shirt',
    category: 'Shirts',
    tag: 'New',
    price: '$38',
    orig: null,
    img: 'https://loremflickr.com/600/800/shirt,fashion?lock=14',
  },
  {
    id: 5,
    name: 'Endurance Joggers',
    category: 'Bottoms',
    tag: 'Classic',
    price: '$74',
    orig: '$92',
    img: 'https://loremflickr.com/600/800/joggers,pants?lock=15',
  },
  {
    id: 6,
    name: 'Recovery Zip Hoodie',
    category: 'Knitwear',
    tag: 'New In',
    price: '$96',
    orig: null,
    img: 'https://loremflickr.com/600/800/hoodie?lock=16',
  },
  {
    id: 7,
    name: 'Classic Fit Tee',
    category: 'Tops',
    tag: 'Limited',
    price: '$36',
    orig: '$45',
    img: 'https://loremflickr.com/600/800/tshirt,plain?lock=17',
  },
]

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
  const [slide, setSlide] = useState(0)
  const [likes, setLikes] = useState({})
  const [step, setStep] = useState({ offset: 0, visible: 3 })
  const trackRef = useRef(null)

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
  }, [])

  const maxSlide = Math.max(0, PRODUCTS.length - step.visible)

  // Clamp the current slide when a resize shrinks the visible count
  // (e.g. rotating from a 3-up desktop layout to a 1-up mobile one).
  useEffect(() => {
    setSlide((s) => Math.min(s, maxSlide))
  }, [maxSlide])

  const prev = () => setSlide((s) => Math.max(0, s - 1))
  const next = () => setSlide((s) => Math.min(maxSlide, s + 1))

  const toggleLike = (id) => setLikes((prev) => ({ ...prev, [id]: !prev[id] }))

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
              Featured<br /><em>Gear</em>
            </h2>
          </div>
          <div className="slider-controls">
            <button className="btn-icon" onClick={prev} disabled={slide === 0} aria-label="Previous">←</button>
            <button className="btn-icon" onClick={next} disabled={slide >= maxSlide} aria-label="Next">→</button>
          </div>
        </div>

        <div className="slider-wrapper">
          <div
            ref={trackRef}
            className="slider-track"
            style={{ transform: `translateX(-${slide * step.offset}px)` }}
          >
            {PRODUCTS.map((product) => (
              <div key={product.id} className="product-card card">
                <div className="card-image-wrap">
                  <img src={product.img} alt={product.name} />
                  <span className="tag tag-warm card-tag">{product.tag}</span>
                  <button
                    className="card-wishlist"
                    onClick={() => toggleLike(product.id)}
                    aria-label="Wishlist"
                  >
                    {likes[product.id] ? '♥' : '♡'}
                  </button>
                </div>
                <div className="card-body">
                  <div className="card-category label">{product.category}</div>
                  <h3 className="card-name">{product.name}</h3>
                  <div className="card-footer">
                    <div>
                      <span className="card-price">{product.price}</span>
                      {product.orig && <span className="card-price-orig">{product.orig}</span>}
                    </div>
                    <button className="btn-subtle btn-sm">Add</button>
                  </div>
                </div>
              </div>
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
