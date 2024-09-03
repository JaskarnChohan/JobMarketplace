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
import CreateJob from "./pages/jobs/CreateJob";
import RequestResetPassword from "./pages/auth/RequestResetPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import { useAuth } from "./context/AuthContext";
import JobListings from "./pages/jobs/JobListings";

const App = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Router>
      <Routes>
        <Route
          path="/signup"
          element={!isAuthenticated ? <Signup /> : <Navigate to="/dashboard" />}
        />
        <Route
          path="/login"
          element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />}
        />
        <Route
          path="/dashboard"
          element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />}
        />
        <Route
          path="/createjob"
          element={isAuthenticated ? <CreateJob /> : <Navigate to="/login" />}
        />
        <Route 
          path="/joblistings"
          element={<JobListings/>}
        />
        <Route
          path="/request-reset-password"
          element={<RequestResetPassword />}
        />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/reset-password" element={<ResetPassword noToken />} />
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
};

export default App;
