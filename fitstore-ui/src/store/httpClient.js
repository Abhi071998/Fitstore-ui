export function createHttpClient(baseURL) {
  async function request(path, { method = 'GET', body, headers } = {}) {
    const res = await fetch(`${baseURL}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json', ...headers },
      body: body ? JSON.stringify(body) : undefined,
    })

    const data = await res.json().catch(() => null)

    if (!res.ok) {
      const error = new Error(data?.message || data?.error || 'Request failed')
      error.status = res.status
      error.data = data
      throw error
    }

    return data
  }

  return {
    get: (path, options) => request(path, { ...options, method: 'GET' }),
    post: (path, body, options) => request(path, { ...options, method: 'POST', body }),
  }
}

export const httpClient = createHttpClient(import.meta.env.VITE_API_BASE_URL)
