import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchAboutUs } from '../../store/aboutUs/aboutUsSlice'
import Navbar from '../common/Navbar.jsx'
import '../pages/Landing.css'
import '../categories/CategoriesPage.css'
import './AboutPage.css'

export default function AboutPage() {
  const dispatch = useDispatch()
  const { content, status, error } = useSelector((state) => state.aboutUs)

  useEffect(() => {
    dispatch(fetchAboutUs())
  }, [dispatch])

  return (
    <div className="categories-page">
      <Navbar centerLabel="Back to Shop" centerTo="/" showActions />

      <section className="section about-hero">
        {status === 'loading' && <p className="categories-status">Loading…</p>}

        {status === 'failed' && (
          <div className="categories-status">
            <p>{error?.message || 'Something went wrong loading this page.'}</p>
            <button className="btn-outline btn-sm" onClick={() => dispatch(fetchAboutUs())}>
              Retry
            </button>
          </div>
        )}

        {status === 'succeeded' && content && (
          <>
            <div className="about-hero-image">
              <img src={content.about_us_img} alt={content.about_us_title} />
            </div>

            <div className="about-hero-content">
              <div className="eyebrow">About Us</div>
              <h1 className="section-title about-hero-title">{content.about_us_title}</h1>
              <p className="about-hero-desc">{content.about_us_description}</p>
            </div>
          </>
        )}
      </section>

      {status === 'succeeded' && content && (
        <>
          <div className="about-taglines">
            {[content.about_us_tagline1, content.about_us_tagline2, content.about_us_tagline3, content.about_us_tagline4]
              .filter(Boolean)
              .map((line) => (
                <div key={line} className="about-tagline-item">
                  <p className="about-tagline-text font-display">{line}</p>
                </div>
              ))}
          </div>

          <section className="section about-contact-section">
            <div className="about-contact card">
              <div className="about-contact-item">
                <span className="label">Established</span>
                <p>{content.about_us_estb_year}</p>
              </div>
              <div className="about-contact-item">
                <span className="label">Visit Us</span>
                <p>{content.about_us_visit_us}</p>
              </div>
              <div className="about-contact-item">
                <span className="label">Email</span>
                <p><a href={`mailto:${content.about_us_email}`}>{content.about_us_email}</a></p>
              </div>
            </div>
          </section>
        </>
      )}

      <footer className="footer">
        <h4 className="footer-brand">FITstore</h4>
        <div className="footer-copy">© 2026 FITstore. All rights reserved.</div>
      </footer>
    </div>
  )
}
