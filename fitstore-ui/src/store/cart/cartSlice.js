import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { addBagItemsRequest, getBagRequest } from './cartAPI'

export const addToBag = createAsyncThunk(
  'cart/addToBag',
  async ({ productId, items, token }, { rejectWithValue }) => {
    try {
      return await addBagItemsRequest({ productId, items }, token)
    } catch (err) {
      return rejectWithValue({ status: err.status, message: err.message })
    }
  },
)

export const fetchBag = createAsyncThunk(
  'cart/fetchBag',
  async (token, { rejectWithValue }) => {
    try {
      return await getBagRequest(token)
    } catch (err) {
      return rejectWithValue({ status: err.status, message: err.message })
    }
  },
)

const initialState = {
  items: [],
  itemCount: 0,
  addStatus: 'idle', // idle | loading | succeeded | failed
  addError: null,
  fetchStatus: 'idle',
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearAddError(state) {
      state.addError = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addToBag.pending, (state) => {
        state.addStatus = 'loading'
        state.addError = null
      })
      .addCase(addToBag.fulfilled, (state) => {
        state.addStatus = 'succeeded'
      })
      .addCase(addToBag.rejected, (state, action) => {
        state.addStatus = 'failed'
        state.addError = action.payload
      })
      .addCase(fetchBag.pending, (state) => {
        state.fetchStatus = 'loading'
      })
      .addCase(fetchBag.fulfilled, (state, action) => {
        state.fetchStatus = 'succeeded'
        state.items = action.payload
        state.itemCount = action.payload.reduce((sum, row) => sum + (row.quantity || 0), 0)
      })
      .addCase(fetchBag.rejected, (state) => {
        state.fetchStatus = 'failed'
      })
  },
})

export const { clearAddError } = cartSlice.actions
export default cartSlice.reducer
