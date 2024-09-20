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
import ProfilePage from "./pages/profile/ProfilePage";
import { useAuth } from "./context/AuthContext";
import AuthLoader from "./context/AuthLoader";
import JobListings from "./pages/jobs/JobListings";
import JobManagement from "./pages/jobs/JobManagement";
import ViewCompanyProfile from "./pages/profile/employer/ViewCompanyProfile";
import ViewUserProfile from "./pages/profile/job-seeker/ViewUserProfile";
import BrowseEmployers from "./pages/profile/employer/BrowseEmployers";
import EditJob from "./pages/jobs/EditJob";
import JobView from "./pages/jobs/JobView";

const App = () => {
  const { isAuthenticated, isEmployer, isJobSeeker } = useAuth();

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
          <Route
            path="/createjob"
            element={
              isAuthenticated && isEmployer() ? (
                <CreateJob />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route path="/joblistings" element={<JobListings />} />
          <Route
            path="/editjob/:_id"
            element={
              isAuthenticated && isEmployer() ? (
                <EditJob />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route path="/jobview/:_id" element={<JobView />} />
          <Route
            path="/jobmanagement"
            element={
              isAuthenticated && isEmployer() ? (
                <JobManagement />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/request-reset-password"
            element={<RequestResetPassword />}
          />
          <Route path="/viewcompany/:id" element={<ViewCompanyProfile />} />
          <Route path="/viewprofile/:id" element={<ViewUserProfile />} />
          <Route path="/browse-employers" element={<BrowseEmployers />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/reset-password" element={<ResetPassword noToken />} />
          <Route path="/" element={<Home />} />
        </Routes>
      </AuthLoader>
    </Router>
  );
};

export default App;
