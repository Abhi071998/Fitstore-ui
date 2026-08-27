import { createHttpClient } from '../httpClient'

const fitstoreEngineClient = createHttpClient(import.meta.env.VITE_FITSTORE_ENGINE_BASE_URL)

export const fetchAboutUsRequest = () => fitstoreEngineClient.get('/api/content/about-us')
