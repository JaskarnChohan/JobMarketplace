import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Home from "./pages/home/Home";
import Signup from "./pages/auth/Signup";
import Login from "./pages/auth/Login";
import Dashboard from "./pages/home/Dashboard";
import RequestResetPassword from "./pages/auth/RequestResetPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import ProfilePage from "./pages/profile/ProfilePage";
import { useAuth } from "./context/AuthContext";
import AuthLoader from "./context/AuthLoader";

const App = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Router>
      <AuthLoader>
        <Routes>
          <Route
            path="/signup"
            element={
              isAuthenticated ? <Navigate to="/dashboard" /> : <Signup />
            }
          />
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />}
          />
          <Route
            path="/dashboard"
            element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />}
          />
          <Route
            path="/request-reset-password"
            element={<RequestResetPassword />}
          />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/reset-password" element={<ResetPassword noToken />} />
          <Route path="/" element={<Home />} />
          <Route
            path="/profile"
            element={
              isAuthenticated ? <ProfilePage /> : <Navigate to="/login" />
            }
          />
        </Routes>
      </AuthLoader>
    </Router>
  );
};

export default App;
