import { createHttpClient } from '../httpClient'

const cartHttpClient = createHttpClient(import.meta.env.VITE_CART_API_BASE_URL)

export const addBagItemsRequest = (payload, token) =>
  cartHttpClient.post('/api/bag/items', payload, {
    headers: { Authorization: `Bearer ${token}` },
  })

export const getBagRequest = (token) =>
  cartHttpClient.get('/api/bag', {
    headers: { Authorization: `Bearer ${token}` },
  })
