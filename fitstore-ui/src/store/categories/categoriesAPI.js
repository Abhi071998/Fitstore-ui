import { httpClient } from '../httpClient'

export const getAllCategoriesRequest = () => httpClient.get('/api/categories/getAllCategories')
