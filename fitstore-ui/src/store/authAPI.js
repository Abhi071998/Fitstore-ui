import { httpClient } from './httpClient'

export const registerRequest = (payload) => httpClient.post('/api/auth/register', payload)
export const loginRequest = (payload) => httpClient.post('/api/auth/login', payload)
