import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { fetchAboutUsRequest } from './aboutUsAPI'

export const fetchAboutUs = createAsyncThunk(
  'aboutUs/fetchAboutUs',
  async (_, { rejectWithValue }) => {
    try {
      return await fetchAboutUsRequest()
    } catch (err) {
      return rejectWithValue({ status: err.status, message: err.message })
    }
  },
)

const initialState = {
  content: null,
  status: 'idle', // idle | loading | succeeded | failed
  error: null,
}

const aboutUsSlice = createSlice({
  name: 'aboutUs',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAboutUs.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchAboutUs.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.content = action.payload
      })
      .addCase(fetchAboutUs.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
  },
})

export default aboutUsSlice.reducer
