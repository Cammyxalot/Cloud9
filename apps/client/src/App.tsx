import { BrowserRouter, Routes, Route } from "react-router-dom";
import Signup from "./pages/signup";
import Login from "./pages/login";
import { Toaster } from "./components/ui/toaster";
import FallbackRoute from "./components/logic/fallback-route";
import { Dashboard } from "./pages/dashboard";
import Admin from "./pages/admin";

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
  );
};

export default App;
