const TOKEN_KEY = import.meta.env.VITE_AUTH_TOKEN_STORAGE_KEY
const USER_KEY = import.meta.env.VITE_AUTH_USER_STORAGE_KEY

export function loadAuth() {
  try {
    const token = localStorage.getItem(TOKEN_KEY)
    const user = localStorage.getItem(USER_KEY)
    return { token: token || null, user: user ? JSON.parse(user) : null }
  } catch {
    return { token: null, user: null }
  }
}

export function saveAuth({ token, user }) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}
