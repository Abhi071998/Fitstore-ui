import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { loginUser, registerUser, clearAuthError, logout } from '../../store/auth/authSlice'
import './AuthMenu.css'

const EMPTY_FORM = { name: '', email: '', password: '', confirmPassword: '' }
const REVEAL_MS = 1000

function PasswordField({ placeholder, value, onChange, required }) {
  const [visible, setVisible] = useState(false)
  const timeoutRef = useRef(null)

  useEffect(() => () => clearTimeout(timeoutRef.current), [])

  const toggleVisible = () => {
    clearTimeout(timeoutRef.current)
    setVisible((wasVisible) => {
      const nextVisible = !wasVisible
      if (nextVisible) {
        timeoutRef.current = setTimeout(() => setVisible(false), REVEAL_MS)
      }
      return nextVisible
    })
  }

  return (
    <div className="password-field">
      <input
        type={visible ? 'text' : 'password'}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
      />
      <button
        type="button"
        className="password-toggle"
        onClick={toggleVisible}
        aria-label={visible ? 'Hide password' : 'Show password'}
      >
        {visible ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  )
}

function EyeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a20.3 20.3 0 0 1 5.06-6.06M9.9 4.24A10.4 10.4 0 0 1 12 4c7 0 11 8 11 8a20.3 20.3 0 0 1-3.22 4.44M14.12 14.12a3 3 0 1 1-4.24-4.24" />
      <path d="M1 1l22 22" />
    </svg>
  )
}

export default function AuthMenu() {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState(EMPTY_FORM)
  const [mismatch, setMismatch] = useState(false)
  const [confirmingLogout, setConfirmingLogout] = useState(false)
  const wrapRef = useRef(null)
  const dispatch = useDispatch()
  const { status, error, user } = useSelector((state) => state.auth)
  const submitting = status === 'loading'

  // Close the auth dropdown / logout confirm on outside click.
  useEffect(() => {
    if (!open && !confirmingLogout) return
    const onClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false)
        setConfirmingLogout(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open, confirmingLogout])

  const openAs = (nextMode) => {
    setMode(nextMode)
    setMismatch(false)
    dispatch(clearAuthError())
    setOpen((isOpen) => (isOpen && mode === nextMode ? false : true))
  }

  const switchMode = (nextMode) => {
    setMode(nextMode)
    setMismatch(false)
    dispatch(clearAuthError())
  }

  const updateField = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleLogout = () => {
    dispatch(logout())
    setForm(EMPTY_FORM)
    setMode('login')
    setConfirmingLogout(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (mode === 'register' && form.password !== form.confirmPassword) {
      setMismatch(true)
      return
    }
    setMismatch(false)

    const action = mode === 'login'
      ? loginUser({ email: form.email, password: form.password })
      : registerUser({ name: form.name, email: form.email, password: form.password })

    const result = await dispatch(action)

    if (result.meta.requestStatus === 'fulfilled') {
      setForm(EMPTY_FORM)
      setOpen(false)
    }
  }

  if (user) {
    return (
      <div className="auth-wrap" ref={wrapRef}>
        <div className="auth-links">
          <span className="auth-greeting">Hello {user.name || user.email}</span>
          <span className="auth-divider">/</span>
          <button className="auth-link" onClick={() => setConfirmingLogout((c) => !c)}>Logout</button>
        </div>

        {confirmingLogout && (
          <div className="auth-panel card logout-confirm">
            <p className="logout-confirm-text">Are you sure you want to logout?</p>
            <div className="logout-confirm-actions">
              <button className="btn-subtle btn-sm" onClick={() => setConfirmingLogout(false)}>Cancel</button>
              <button className="btn-primary btn-sm" onClick={handleLogout}>Yes, Logout</button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="auth-wrap" ref={wrapRef}>
      <div className="auth-links">
        <button className="auth-link" onClick={() => openAs('login')}>Login</button>
        <span className="auth-divider">/</span>
        <button className="auth-link" onClick={() => openAs('register')}>Sign Up</button>
      </div>

      {open && (
        <div className="auth-panel card">
          <div className="auth-tabs">
            <button
              className={`auth-tab${mode === 'login' ? ' active' : ''}`}
              onClick={() => switchMode('login')}
            >
              Log In
            </button>
            <button
              className={`auth-tab${mode === 'register' ? ' active' : ''}`}
              onClick={() => switchMode('register')}
            >
              Register
            </button>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {mode === 'register' && (
              <label className="auth-field">
                <span className="label">Full Name</span>
                <input
                  type="text"
                  placeholder="Jamie Rivera"
                  value={form.name}
                  onChange={updateField('name')}
                  required
                />
              </label>
            )}

            <label className="auth-field">
              <span className="label">Email</span>
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={updateField('email')}
                required
              />
            </label>

            <label className="auth-field">
              <span className="label">Password</span>
              <PasswordField
                placeholder="••••••••"
                value={form.password}
                onChange={updateField('password')}
                required
              />
            </label>

            {mode === 'register' && (
              <label className="auth-field">
                <span className="label">Confirm Password</span>
                <PasswordField
                  placeholder="••••••••"
                  value={form.confirmPassword}
                  onChange={updateField('confirmPassword')}
                  required
                />
              </label>
            )}

            {mismatch && <div className="auth-error">Passwords don't match.</div>}
            {!mismatch && error && <div className="auth-error">{error}</div>}

            <button type="submit" className="btn-primary auth-submit" disabled={submitting}>
              {submitting ? 'Please wait…' : mode === 'login' ? 'Log In' : 'Create Account'}
            </button>
          </form>

          <div className="auth-switch">
            {mode === 'login' ? (
              <>No account? <button onClick={() => switchMode('register')}>Register</button></>
            ) : (
              <>Already a member? <button onClick={() => switchMode('login')}>Log In</button></>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
