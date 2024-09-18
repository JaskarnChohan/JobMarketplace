import React from "react";
import { Link } from "react-router-dom";
import "../../styles/Nav.css";
import "../../styles/Global.css";
import { useAuth } from "../../context/AuthContext";

const Navbar = ({ isAuthenticated, handleLogout }) => {
  const { user } = useAuth();

  const renderLinks = () => {
    if (!isAuthenticated) {
      return (
        <>
          <Link to="/job-listings">Job Listings</Link>
          <Link to="/browse-employers">Browse Employers</Link>
          <Link className="btn" to="/login">
            Login
          </Link>
          <Link className="btn" to="/signup">
            Sign Up
          </Link>
        </>
      );
    }

    switch (user.role) {
      case "employer":
        return (
          <>
            <Link to="/browse-employees">Browse Employees</Link>
            <Link to="/job-listings">My Job Listings</Link>
            <Link to="/post-job">Post a Job</Link>
            <Link to="/applications">Applications</Link>
            <Link to="/profile">Profile</Link>
            <Link className="btn" onClick={handleLogout}>
              Logout
            </Link>
          </>
        );
      case "jobSeeker":
        return (
          <>
            <Link to="/job-listings">Job Listings</Link>
            <Link to="/browse-employers">Browse Employers</Link>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/profile">Profile</Link>
            <Link className="btn" onClick={handleLogout}>
              Logout
            </Link>
          </>
        );
      default:
        return (
          <>
            <Link to="/job-listings">Job Listings</Link>
            <Link to="/browse-employers">Browse Employers</Link>
            <Link className="btn" onClick={handleLogout}>
              Logout
            </Link>
          </>
        );
    }
  };

  return (
    <nav>
      <Link className="lrg-heading" to="/">
        JobHive
      </Link>
      <div className="navbar-links">{renderLinks()}</div>
    </nav>
  );
};

export default Navbar;
