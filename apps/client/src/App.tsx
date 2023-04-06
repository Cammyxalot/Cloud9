import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Signup from './pages/signup'
import Login from './pages/login'
import { Toaster } from './components/ui/toaster'
import FallbackRoute from './components/logic/fallback-route'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<FallbackRoute><div>Home</div></FallbackRoute>} />
        <Route path="/signup" element={<FallbackRoute redirectWhenLoggedIn><Signup /></FallbackRoute>} />
        <Route path="/login" element={<FallbackRoute redirectWhenLoggedIn><Login /></FallbackRoute>} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  )
}

export default App
