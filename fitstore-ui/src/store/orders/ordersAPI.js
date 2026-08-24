import { httpClient } from '../httpClient'

export const placeOrderRequest = (payload, token) =>
  httpClient.post('/api/orders', payload, {
    headers: { Authorization: `Bearer ${token}` },
  })

export const fetchOrdersRequest = (token) =>
  httpClient.get('/api/orders', {
    headers: { Authorization: `Bearer ${token}` },
  })
