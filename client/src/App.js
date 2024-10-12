import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Home from "./pages/Home";
import Messaging from "./pages/Messaging";
import Signup from "./pages/auth/Signup";
import Login from "./pages/auth/Login";
import Dashboard from "./pages/Dashboard";
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
import AIAnswerImprover from "./pages/AIAnswerImprover";
import PaymentPage from "./pages/payment/PaymentPage";
import PaymentSuccess from "./pages/payment/PaymentSuccess";
import PaymentCancel from "./pages/payment/PaymentCancel";
import EditJob from "./pages/jobs/EditJob";
import JobView from "./pages/jobs/JobView";

const App = () => {
  // Extract authentication information from the context
  const { isAuthenticated, isEmployer, isJobSeeker } = useAuth();

  return (
    <Router>
      {/* AuthLoader ensures user session is authenticated before loading routes */}
      <AuthLoader>
        <Routes>
          {/* Redirect authenticated users to dashboard on signup */}
          <Route
            path="/signup"
            element={
              isAuthenticated ? <Navigate to="/dashboard" /> : <Signup />
            }
          />
          {/* Redirect authenticated users to dashboard on login */}
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />}
          />
          {/* Allow only authenticated users to access the dashboard */}
          <Route
            path="/dashboard"
            element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />}
          />
          {/* Allow only authenticated users to access the AI to improve interview questions */}
          <Route
            path="/enchanceanswers"
            element={
              isAuthenticated && isJobSeeker() ? (
                <AIAnswerImprover />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          {/* Allow only authenticated users to access the messaging page */}
          <Route
            path="/messages"
            element={isAuthenticated ? <Messaging /> : <Navigate to="/login" />}
          />
          {/* Reset password routes */}
          <Route
            path="/request-reset-password"
            element={<RequestResetPassword />}
          />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/reset-password" element={<ResetPassword noToken />} />

          {/* Home page accessible to all users */}
          <Route path="/" element={<Home />} />

          {/* Profile page only for authenticated users */}
          <Route
            path="/profile"
            element={
              isAuthenticated ? <ProfilePage /> : <Navigate to="/login" />
            }
          />

          {/* Payment routes */}
          <Route
            path="/premium"
            element={
              isAuthenticated ? <PaymentPage /> : <Navigate to="/login" />
            }
          />
          <Route
            path="/payment/success"
            element={
              isAuthenticated ? <PaymentSuccess /> : <Navigate to="/login" />
            }
          />
          <Route
            path="/payment/cancel"
            element={
              isAuthenticated ? <PaymentCancel /> : <Navigate to="/login" />
            }
          />

          {/* Only employers can access job creation page */}
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

          {/* Job listings accessible to all */}
          <Route path="/joblistings" element={<JobListings />} />

          {/* Only employers can edit jobs */}
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

          {/* Job view page accessible to all */}
          <Route path="/jobview/:_id" element={<JobView />} />

          {/* Only employers can manage jobs */}
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

          {/* Employer and user profile views */}
          <Route path="/viewcompany/:id" element={<ViewCompanyProfile />} />
          <Route
            path="/viewprofile/:id"
            element={
              isAuthenticated ? (
                <ViewUserProfile />
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          {/* Browse employers page accessible to all */}
          <Route path="/browse-employers" element={<BrowseEmployers />} />

          {/* Reset password routes (duplicate paths cleaned) */}
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/reset-password" element={<ResetPassword noToken />} />

          {/* Home page (duplicate route cleaned) */}
          <Route path="/" element={<Home />} />
        </Routes>
      </AuthLoader>
    </Router>
  );
};

export default App;
