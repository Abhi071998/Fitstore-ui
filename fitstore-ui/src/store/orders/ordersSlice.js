import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { placeOrderRequest, fetchOrdersRequest } from './ordersAPI'

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

export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async (token, { rejectWithValue }) => {
    try {
      return await fetchOrdersRequest(token)
    } catch (err) {
      return rejectWithValue({ status: err.status, message: err.message })
    }
  },
)

const initialState = {
  status: 'idle', // idle | loading | succeeded | failed
  error: null,
  lastOrder: null,
  list: [],
  listStatus: 'idle', // idle | loading | succeeded | failed
  listError: null,
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
      .addCase(fetchOrders.pending, (state) => {
        state.listStatus = 'loading'
        state.listError = null
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.listStatus = 'succeeded'
        state.list = action.payload
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.listStatus = 'failed'
        state.listError = action.payload
      })
  },
})

export const { clearOrderError, resetOrderStatus } = ordersSlice.actions
export default ordersSlice.reducer
