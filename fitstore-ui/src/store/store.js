import { configureStore } from '@reduxjs/toolkit'
import authReducer from './auth/authSlice'
import categoriesReducer from './categories/categoriesSlice'
import productsReducer from './products/productsSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    categories: categoriesReducer,
    products: productsReducer,
  },
})
