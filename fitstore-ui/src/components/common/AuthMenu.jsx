import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { loginUser, registerUser, clearAuthError } from '../../store/authSlice'
import './AuthMenu.css'

const EMPTY_FORM = { name: '', email: '', password: '', confirmPassword: '' }

export default function AuthMenu() {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState(EMPTY_FORM)
  const [mismatch, setMismatch] = useState(false)
  const wrapRef = useRef(null)
  const dispatch = useDispatch()
  const { status, error } = useSelector((state) => state.auth)
  const submitting = status === 'loading'

  // Close the auth dropdown on outside click.
  useEffect(() => {
    if (!open) return
    const onClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

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
              <input
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={updateField('password')}
                required
              />
            </label>

            {mode === 'register' && (
              <label className="auth-field">
                <span className="label">Confirm Password</span>
                <input
                  type="password"
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
