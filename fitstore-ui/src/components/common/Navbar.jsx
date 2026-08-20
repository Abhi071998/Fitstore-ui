import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import AuthMenu from './AuthMenu.jsx'
import './Navbar.css'

export default function Navbar({ centerLabel, centerTo, showActions = false }) {
  const itemCount = useSelector((state) => state.cart.itemCount)

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
          <Link to="/bag" className="btn-outline">Bag ({itemCount})</Link>
        </div>
      )}
    </nav>
  )
}
