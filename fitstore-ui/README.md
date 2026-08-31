# FITstore

The storefront frontend for FITstore — a React + Redux Toolkit e-commerce UI for browsing categories/products, cart, checkout, order history, and an About Us page. Built with Vite.

## Backend repos

- [FitStore-core](https://github.com/Abhi071998/FitStore-core) — auth, categories, products, cart, orders
- [Fitstore-engine](https://github.com/Abhi071998/Fitstore-engine) — content service (About Us page)

## Installation

```bash
git clone https://github.com/Abhi071998/Fitstore-ui.git
cd Fitstore-ui/fitstore-ui
npm install
cp .env.example .env   # fill in your backend URLs
npm run dev              # start the dev server
npm run build             # production build to dist/
npm run preview            # preview the production build locally
```

## Environment variables

Set these in `.env` (see `.env.example`):

| Variable | Purpose |
|---|---|
| `VITE_API_BASE_URL` | FitStore-core base URL — auth, categories, products, orders |
| `VITE_CART_API_BASE_URL` | FitStore-core base URL for cart/bag endpoints |
| `VITE_FITSTORE_ENGINE_BASE_URL` | Fitstore-engine base URL — About Us page content |
| `VITE_AUTH_TOKEN_STORAGE_KEY` | localStorage key the JWT is persisted under |
| `VITE_AUTH_USER_STORAGE_KEY` | localStorage key the logged-in user object is persisted under |

Production values:

```
VITE_API_BASE_URL=https://fitstore-core.onrender.com
VITE_CART_API_BASE_URL=https://fitstore-core.onrender.com
VITE_FITSTORE_ENGINE_BASE_URL=https://fitstore-engine.onrender.com
```
