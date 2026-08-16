import { configureStore } from '@reduxjs/toolkit'
import authReducer from './auth/authSlice'
import categoriesReducer from './categories/categoriesSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    categories: categoriesReducer,
  },
})
