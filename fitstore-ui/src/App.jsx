import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { fetchBag } from './store/cart/cartSlice'
import Landing from './components/pages/Landing.jsx'
import CategoriesPage from './components/categories/CategoriesPage.jsx'
import ProductsPage from './components/products/ProductsPage.jsx'
import ProductDetailPage from './components/products/ProductDetailPage.jsx'
import CartPage from './components/cart/CartPage.jsx'
import CheckoutPage from './components/checkout/CheckoutPage.jsx'
import OrdersPage from './components/orders/OrdersPage.jsx'
import AboutPage from './components/about/AboutPage.jsx'

function App() {
  const dispatch = useDispatch()
  const token = useSelector((state) => state.auth.token)

  // Restore the bag badge on a fresh page load when a session was persisted from a previous visit.
  useEffect(() => {
    if (token) dispatch(fetchBag(token))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/products/:categoryId" element={<ProductsPage />} />
        <Route path="/products/:categoryId/:productId" element={<ProductDetailPage />} />
        <Route path="/bag" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/about" element={<AboutPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
