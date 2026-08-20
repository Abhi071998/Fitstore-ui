import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './components/pages/Landing.jsx'
import CategoriesPage from './components/categories/CategoriesPage.jsx'
import ProductsPage from './components/products/ProductsPage.jsx'
import ProductDetailPage from './components/products/ProductDetailPage.jsx'
import CartPage from './components/cart/CartPage.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/products/:categoryId" element={<ProductsPage />} />
        <Route path="/products/:categoryId/:productId" element={<ProductDetailPage />} />
        <Route path="/bag" element={<CartPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
