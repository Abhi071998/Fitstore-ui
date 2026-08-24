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

export default function Navbar({ centerLabel, centerTo, showActions = false }) {
  const itemCount = useSelector((state) => state.cart.itemCount)
  const user = useSelector((state) => state.auth.user)

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo font-display">
        FITstore
        <span>Performance Edit</span>
      </Link>

      <Link to={centerTo} className="navbar-category font-display">{centerLabel}</Link>

      {showActions && (
        <div className="navbar-actions">
          <AuthMenu />
          {user && (
            <Link to="/orders" className="btn-icon" aria-label="My Orders">
              <OrdersIcon />
            </Link>
          )}
          <Link to="/bag" className="btn-outline">Bag ({itemCount})</Link>
        </div>
      )}
    </nav>
  )
}
