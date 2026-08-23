import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { placeOrderRequest } from './ordersAPI'

export const placeOrder = createAsyncThunk(
  'orders/placeOrder',
  async ({ payload, token }, { rejectWithValue }) => {
    try {
      return await placeOrderRequest(payload, token)
    } catch (err) {
      return rejectWithValue({ status: err.status, message: err.message })
    }
  },
)

const initialState = {
  status: 'idle', // idle | loading | succeeded | failed
  error: null,
  lastOrder: null,
}

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearOrderError(state) {
      state.error = null
    },
    resetOrderStatus(state) {
      state.status = 'idle'
      state.error = null
      state.lastOrder = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(placeOrder.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(placeOrder.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.lastOrder = action.payload
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
  },
})

export const { clearOrderError, resetOrderStatus } = ordersSlice.actions
export default ordersSlice.reducer
