import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './components/pages/Landing.jsx'
import CategoriesPage from './components/categories/CategoriesPage.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/categories" element={<CategoriesPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
