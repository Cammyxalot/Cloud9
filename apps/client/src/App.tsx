import { BrowserRouter, Route, Routes } from 'react-router-dom'
import FallbackRoute from './components/logic/fallback-route'
import { Toaster } from './components/ui/toaster'
import Admin from './pages/admin'
import { Dashboard } from './pages/dashboard'
import Login from './pages/login'
import Signup from './pages/signup'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <FallbackRoute>
              <Dashboard />
            </FallbackRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <FallbackRoute redirectWhenLoggedIn>
              <Signup />
            </FallbackRoute>
          }
        />
        <Route
          path="/login"
          element={
            <FallbackRoute redirectWhenLoggedIn>
              <Login />
            </FallbackRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <FallbackRoute>
              <Admin />
            </FallbackRoute>
          }
        />
      </Routes>
      <Toaster />
    </BrowserRouter>
  )
}

export default App
