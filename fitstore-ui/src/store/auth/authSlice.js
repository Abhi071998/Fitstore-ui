import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { registerRequest, loginRequest } from './authAPI'
import { loadAuth, saveAuth, clearAuth } from './authStorage'

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (payload, { rejectWithValue }) => {
    try {
      return await registerRequest(payload)
    } catch (err) {
      return rejectWithValue(err.message)
    }
  },
)

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (payload, { rejectWithValue }) => {
    try {
      return await loginRequest(payload)
    } catch (err) {
      return rejectWithValue(err.message)
    }
  },
)

const { token: storedToken, user: storedUser } = loadAuth()

const initialState = {
  user: storedUser,
  token: storedToken,
  status: 'idle', // idle | loading | succeeded | failed
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError(state) {
      state.error = null
    },
    logout(state) {
      state.user = null
      state.token = null
      state.status = 'idle'
      state.error = null
      clearAuth()
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.user = action.payload.user
        state.token = action.payload.token
        saveAuth(action.payload)
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.user = action.payload.user
        state.token = action.payload.token
        saveAuth(action.payload)
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
  },
})

export const { clearAuthError, logout } = authSlice.actions
export default authSlice.reducer
