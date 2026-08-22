import { createAsyncThunk } from '@reduxjs/toolkit'
import { addBagItemsRequest, deleteBagItemRequest } from './cartAPI'

// The backend only exposes POST /api/bag/items (increments an existing row) and
// DELETE /api/bag/items/:id (removes a row outright) — there is no endpoint that
// sets a quantity directly. So a jump from currentQuantity to targetQuantity is
// resolved in exactly one network round trip:
//   - increasing: a single POST for the difference (the backend adds it to
//     whatever's already there)
//   - decreasing: delete the row and, unless the target is 0, recreate it at the
//     lower amount in the same call
// The target is clamped to the known stock so an already-over-committed row
// (e.g. added before a stock-check fix went live) self-corrects down to the real
// limit instead of the recreate failing and losing the row outright.
export const updateBagItemQuantity = createAsyncThunk(
  'cart/updateBagItemQuantity',
  async ({ id, productId, size, currentQuantity, targetQuantity, stock, token }, { rejectWithValue }) => {
    try {
      const clampedTarget = stock != null ? Math.min(targetQuantity, stock) : targetQuantity

      if (clampedTarget === currentQuantity) {
        return { changed: false }
      }

      if (clampedTarget > currentQuantity) {
        await addBagItemsRequest({ productId, items: [{ size, quantity: clampedTarget - currentQuantity }] }, token)
        return { changed: true, removed: false }
      }

      // clampedTarget < currentQuantity: delete, then recreate lower unless it hit zero.
      await deleteBagItemRequest(id, token)

      if (clampedTarget <= 0) {
        return { changed: true, removed: true }
      }

      await addBagItemsRequest({ productId, items: [{ size, quantity: clampedTarget }] }, token)
      return { changed: true, removed: false }
    } catch (err) {
      return rejectWithValue({ id, status: err.status, message: err.message })
    }
  },
)
