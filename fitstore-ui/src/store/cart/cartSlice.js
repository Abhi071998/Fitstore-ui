import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { addBagItemsRequest, getBagRequest, deleteBagItemRequest } from './cartAPI'
import { updateBagItemQuantity } from './updateBagItemQuantity'

export { updateBagItemQuantity }

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

export const removeBagItem = createAsyncThunk(
  'cart/removeBagItem',
  async ({ id, token }, { rejectWithValue }) => {
    try {
      await deleteBagItemRequest(id, token)
      return id
    } catch (err) {
      return rejectWithValue({ id, status: err.status, message: err.message })
    }
  },
)

const initialState = {
  items: [],
  itemCount: 0,
  addStatus: 'idle', // idle | loading | succeeded | failed
  addError: null,
  fetchStatus: 'idle',
  removingId: null,
  removeError: null,
  updatingId: null,
  updateError: null,
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearAddError(state) {
      state.addError = null
    },
    clearUpdateError(state) {
      state.updateError = null
    },
    clearCart(state) {
      state.items = []
      state.itemCount = 0
      state.addStatus = 'idle'
      state.addError = null
      state.fetchStatus = 'idle'
      state.removingId = null
      state.removeError = null
      state.updatingId = null
      state.updateError = null
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
      .addCase(removeBagItem.pending, (state, action) => {
        state.removingId = action.meta.arg.id
        state.removeError = null
      })
      .addCase(removeBagItem.fulfilled, (state, action) => {
        const removedRow = state.items.find((row) => row.id === action.payload)
        state.items = state.items.filter((row) => row.id !== action.payload)
        state.itemCount -= removedRow?.quantity || 0
        state.removingId = null
      })
      .addCase(removeBagItem.rejected, (state, action) => {
        state.removingId = null
        state.removeError = action.payload
      })
      .addCase(updateBagItemQuantity.pending, (state, action) => {
        state.updatingId = action.meta.arg.id
        state.updateError = null
      })
      .addCase(updateBagItemQuantity.fulfilled, (state) => {
        state.updatingId = null
      })
      .addCase(updateBagItemQuantity.rejected, (state, action) => {
        state.updatingId = null
        state.updateError = action.payload
      })
  },
})

export const { clearAddError, clearUpdateError, clearCart } = cartSlice.actions
export default cartSlice.reducer
