import { Link } from 'react-router-dom'
import AuthMenu from './AuthMenu.jsx'
import './Navbar.css'

export default function Navbar({ centerLabel, centerTo, showActions = false }) {
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
          <button className="btn-outline">Bag (0)</button>
        </div>
      )}
    </nav>
  )
}
