import { httpClient } from '../httpClient'

export const getProductsByCategoryRequest = (categoryId) =>
  httpClient.get(`/api/products/getAllProducts/${categoryId}`)
