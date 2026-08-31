import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import AuthMenu from './AuthMenu.jsx'
import './Navbar.css'

function OrdersIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4a2 2 0 0 0 1-1.73Z" />
      <path d="M3.3 7 12 12l8.7-5" />
      <path d="M12 22V12" />
    </svg>
  )
}

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  )
}

export default function Navbar({ centerLabel, centerTo, showActions = false }) {
  const itemCount = useSelector((state) => state.cart.itemCount)
  const user = useSelector((state) => state.auth.user)
  const [menuOpen, setMenuOpen] = useState(false)
  const navRef = useRef(null)

  // Close the mobile actions menu on outside click.
  useEffect(() => {
    if (!menuOpen) return
    const onClick = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [menuOpen])

  const closeMenu = () => setMenuOpen(false)

  return (
    <nav className="navbar" ref={navRef}>
      <Link to="/" className="navbar-logo font-display">
        FITstore
        <span>Performance Edit</span>
      </Link>

      <Link to={centerTo} className="navbar-category font-display">{centerLabel}</Link>

      {showActions && (
        <>
          <button
            type="button"
            className="navbar-menu-toggle"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>

          <div className={`navbar-actions${menuOpen ? ' open' : ''}`}>
            <Link to="/about" className="auth-link navbar-about-link" onClick={closeMenu}>About Us</Link>
            <AuthMenu />
            {user && (
              <Link to="/orders" className="btn-icon" aria-label="My Orders" onClick={closeMenu}>
                <OrdersIcon />
              </Link>
            )}
            <Link to="/bag" className="btn-outline" onClick={closeMenu}>Bag ({itemCount})</Link>
          </div>
        </>
      )}
    </nav>
  )
}
