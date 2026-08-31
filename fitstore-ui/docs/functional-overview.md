# FITstore-ui — Functional Overview (for contributors)

A technical walkthrough of what exists in this codebase and how the pieces fit together. Read this alongside the top-level `README.md` (setup/env vars) — this doc is about *what the app does and how*, not how to run it.

## 1. Stack & conventions

- **React 19** with the React Compiler enabled (`babel-plugin-react-compiler` via `@rolldown/plugin-babel` in `vite.config.js`) — see [§7](#7-react-compiler-gotcha) for a real gotcha it introduces.
- **Vite** dev server/build.
- **React Router v7** (`BrowserRouter`), routes declared in `src/App.jsx`.
- **Redux Toolkit** — one slice per feature, no `redux-persist`; only `auth` is persisted (manually, to `localStorage`).
- **No CSS framework/component library.** Design tokens (colors, spacing, fonts) live in `src/index.css` under `:root`; shared primitives (`.btn-primary`, `.card`, `.tag`, `.btn-icon`, etc.) are defined there too and reused across every page's CSS file.

### Redux feature-folder pattern

Every feature lives at `src/store/<feature>/`:

- `<feature>API.js` — raw request functions, each building on an `httpClient` instance (see [§3](#3-backend-integration--httpclient)). No Redux imports here.
- `<feature>Slice.js` — `createAsyncThunk`s that call the API functions, plus a `createSlice` with `pending/fulfilled/rejected` cases wired via `extraReducers`.

Exceptions: `cart/updateBagItemQuantity.js` holds one composite thunk (see [§5.3](#53-cart-bag)) that's imported into and re-exported from `cartSlice.js`, keeping that one non-trivial thunk out of the main slice file.

`src/store/store.js` combines all six reducers: `auth`, `categories`, `products`, `cart`, `orders`, `aboutUs`.

## 2. Routes

Declared in `src/App.jsx`:

| Path | Component | Auth required? | Notes |
|---|---|---|---|
| `/` | `pages/Landing.jsx` | No | Hero, marquee, "Shop by Category" slider, features strip |
| `/categories` | `categories/CategoriesPage.jsx` | No | Grid of all categories |
| `/products/:categoryId` | `products/ProductsPage.jsx` | No | Products within one category |
| `/products/:categoryId/:productId` | `products/ProductDetailPage.jsx` | No to view; yes to add to bag | Size/qty picker, accordion (details/reviews/delivery/returns) |
| `/bag` | `cart/CartPage.jsx` | Yes (redirects to `/`) | |
| `/checkout` | `checkout/CheckoutPage.jsx` | Yes; also redirects to `/bag` if empty | |
| `/orders` | `orders/OrdersPage.jsx` | Yes (redirects to `/`) | |
| `/about` | `about/AboutPage.jsx` | No | Content fetched from a separate backend |

`App.jsx` also dispatches `fetchBag` once on initial mount if a token is already in the store (session restored from `localStorage`), so the navbar's bag count is correct on page load/refresh without visiting `/bag` first.

## 3. Backend integration & `httpClient`

`src/store/httpClient.js` exports `createHttpClient(baseURL)`, a small `fetch` wrapper returning `{ get, post, delete }`. Each call:
- Sends/parses JSON automatically.
- Throws an `Error` on non-2xx responses, with `.status` and `.data` attached from the response — every thunk's `catch` block forwards `{ status, message }` via `rejectWithValue`, so components can branch on `error.status` (e.g. treat `401` as "session expired, redirect home" rather than showing an inline error — see `ProductDetailPage.handleAddToBag` and `CartPage`).

Two backend services are involved, each with its own base-URL env var and (where relevant) its own `httpClient` instance built locally inside that feature's `*API.js` file rather than shared globally:

- **FitStore-core** (`VITE_API_BASE_URL` / `VITE_CART_API_BASE_URL`) — auth, categories, products, cart, orders. Protected endpoints expect `Authorization: Bearer <token>`.
- **Fitstore-engine** (`VITE_FITSTORE_ENGINE_BASE_URL`) — currently only `GET /api/content/about-us`, public, no auth. Needs CORS enabled for whatever origin this frontend runs on — this has bitten local dev before (browser blocks it even though `curl` succeeds, since CORS is a browser-only check).

## 4. Auth

- `store/auth/authAPI.js` — `registerRequest`, `loginRequest` → `POST /api/auth/register` / `POST /api/auth/login`, both returning `{ token, user }`.
- `store/auth/authStorage.js` — `loadAuth()/saveAuth()/clearAuth()` against `localStorage`, using the two `VITE_AUTH_*_STORAGE_KEY` env vars. `authSlice`'s `initialState` calls `loadAuth()` synchronously at module load, so a returning user is "logged in" before the first render — no loading flash.
- `authSlice` tracks `{ user, token, status, error }`. `logout()` is a plain reducer (not a thunk) that clears both Redux state and `localStorage` in one call.
- UI lives entirely in `common/AuthMenu.jsx` — a dropdown embedded in the navbar with tabbed Login/Register forms, a password-visibility toggle that auto-hides after 1s, and a logout confirmation step. It does not have its own route; there's no `/login` page.
- `common/Navbar.jsx` reads `state.auth.user` to decide whether to show the Orders icon (only when logged in) — everything else in the navbar (About Us link, Bag link, AuthMenu itself) is always visible when `showActions` is passed.

## 5. Feature walkthroughs

### 5.1 Categories & Products

- `categoriesSlice.fetchCategories` → `GET /api/categories/getAllCategories`. Used by `CategoriesPage` directly, and by `Landing.jsx`'s "Shop by Category" slider (same thunk, same data — they're always in sync since there's no separate "featured" concept anymore).
- `productsSlice.fetchProductsByCategory(categoryId)` → `GET /api/products/getAllProducts/:categoryId`. There is **no** "all products across every category" endpoint.
- `ProductDetailPage` doesn't fetch a single product by ID — it looks for the product either in `location.state.product` (passed via `<Link state={{product}}>` when navigating from a listing) or in the already-loaded `products.items` array (by matching `productId`), and only dispatches `fetchProductsByCategory` if neither source has it (e.g. a direct URL visit/refresh).
- Product images are stored as a JSON-stringified array in the `images` field; `products/productImages.js` exports `parseImages()`/`firstImage()` to safely parse it (falls back to `[]` on bad JSON).

### 5.2 Product detail → add to bag

- Sizes/stock/quantity selection is local component state (`quantities`, keyed by size id) until "Add to Bag" is clicked — one `addToBag` request per click, sending only the sizes with a non-zero quantity.
- A `401` on add-to-bag redirects to `/` (treated as "not logged in / session expired") rather than showing an inline error.
- A stock-conflict rejection (some other error) is parsed by `parseFailedSizes()` (regex over the error message: `"size(s): M, L"`) to highlight just the offending size rows in red — the rest of the form stays usable.

### 5.3 Cart (Bag)

- `cartSlice` holds `items`, `itemCount` (derived sum of quantities, recomputed on every `fetchBag.fulfilled`), plus independent `add/fetch/remove/update` status+error fields so, e.g., removing one row doesn't clobber an in-flight add's error state.
- **Quantity editing is a popup, not inline +/-.** Clicking the pencil icon on a cart row opens `cart/QuantityModal.jsx`, which holds its own local `pendingQty`. The +/- buttons only touch that local state; nothing hits the network until "Update" is clicked. This was a deliberate performance choice — N clicks cost one request, not N.
- The actual update is `cart/updateBagItemQuantity.js`, a thunk that resolves an arbitrary quantity jump in exactly one request:
  - Clamps the target to `stock` if known.
  - If increasing: one `POST /api/bag/items` for just the delta.
  - If decreasing to > 0: `DELETE` the existing row, then `POST` a new one at the target quantity (the backend's add-item endpoint upserts/increments, so there's no "set exact quantity" endpoint — this is a two-call workaround for a decrease).
  - If decreasing to 0: just the `DELETE`.
- **A React Compiler gotcha lives here** — see [§7](#7-react-compiler-gotcha).

### 5.4 Checkout

- Guarded by two `useEffect`s: no token → redirect to `/`; bag fetched-and-empty → redirect to `/bag` (skipped once an order has just succeeded, since placing an order also empties the bag and the success screen needs to keep rendering).
- Form fields: name/email pre-filled from `state.auth.user`, plus address/city/state/pincode typed in.
- `ordersSlice.placeOrder({ payload, token })` → `POST /api/orders`. On success, dispatches `fetchBag` (to sync the now-empty bag/badge count) and swaps the whole page to an inline "Order Placed!" confirmation (order id + echoed shipping details) rather than navigating away — `orderStatus === 'succeeded'` is what the redirect-guard effect checks to avoid bouncing back to `/bag`.

### 5.5 Orders (history)

- `ordersSlice.fetchOrders(token)` → `GET /api/orders`, dispatched on mount.
- Each order carries a `status` (backend enum, currently `pending_approval` is the only confirmed value at creation time — the UI doesn't hardcode the full enum) and each line item has its own `status` (`active`/`cancelled`).
- `statusTagClass()`/`formatStatus()` in `OrdersPage.jsx` map status strings to colors and title-case by keyword-matching (`cancel|reject` → danger, `pending` → warm, `approve|ship|deliver` → success) rather than an exact lookup table, so it degrades reasonably for status values not seen yet.
- Cancelled line items render struck-through and greyed out but are still listed (the order's `total`, computed server-side, already excludes them).

### 5.6 About Us

- The only page reading from the **second** backend (`fitstore-engine`). `aboutUsSlice.fetchAboutUs()` → `GET /api/content/about-us`, dispatched on mount, no auth.
- All copy (title, description, 4 taglines, established year, address, email) is rendered directly from the API response — there is no fallback/hardcoded content if the fetch fails, just a loading/error/retry state matching the pattern used everywhere else.

## 6. Shared UI patterns worth knowing before adding a page

- Every "list" page follows the same four-way conditional render on its slice's `status`: `loading` → status text, `failed` → status text + retry button, `succeeded && empty` → empty state, `succeeded && non-empty` → the real content. Look at `CategoriesPage.jsx` for the cleanest example.
- `.categories-page` / `.section` / `.section-header` / `.section-title` / `.categories-status` (from `categories/CategoriesPage.css`) and `.card` / `.tag` / `.label` / `.btn-*` (from `index.css`) are the shared layout/primitive classes almost every page imports and reuses rather than writing new ones.
- Icons are inline SVGs (feather-icon style: `stroke="currentColor"`, `strokeWidth="2"`), defined as small local components at the top of whichever file uses them first — there's some duplication (e.g. the package/orders icon exists in both `Navbar.jsx` and `OrdersPage.jsx`) rather than a shared icon module.

## 7. React Compiler gotcha

The React Compiler can eagerly read nested properties of a value for its auto-memoization dependency tracking **even when that value is `null` on some renders** — this is a real, reproduced bug in this codebase, not a theoretical concern.

Concretely: a top-level function (or one hoisted out of JSX) that destructures/dereferences properties of a prop or piece of state which is sometimes `null` (e.g. a `selectedRow` that's `null` until the user opens a modal) can crash on renders where that value is `null`, because the compiler-generated memoization code accesses `value.someProp` unconditionally to build its dependency array — regardless of whether your own code guards it with `if (value) {...}`.

**The fix that worked**: don't hoist such logic into a standalone function. Inline it directly at the JSX callsite, inside the branch where the value has already been narrowed non-null by a conditional (e.g. inside `{row ? (...) : null}`). See `CartPage.jsx`'s inline `onUpdate` handler passed to `QuantityModal` for the pattern — a `const handleUpdate = (row) => {...}` defined outside the ternary reintroduces the crash.

If you hit an unexplained `Cannot read properties of null` pointing at a line that doesn't look like your source, check the *compiled* output (`curl` the dev server's served module, or check the browser's sourcemapped stack trace against compiler-generated `$[n] = x.y` lines) before assuming it's a logic bug.

## 8. What's intentionally not here yet

- No payment gateway — `submitOrder` on the backend creates the order as `pending_approval` and reserves stock; a human (admin, on a separate system) decides approval.
- No product search.
- No user-facing order cancellation UI (the backend supports cancelling an individual `pending_approval` order item via `DELETE /api/orders/items/:itemId`, but nothing in this frontend calls it yet).
- No address book / saved addresses — checkout always starts from a blank address form.
