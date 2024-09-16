import React from "react";
import { Link } from "react-router-dom";
import "./nav.css";
import "../../global.css";
import { useAuth } from "../../context/AuthContext";

const Navbar = ({ isAuthenticated, handleLogout }) => {
  const { user } = useAuth();

  const renderLinks = () => {
    if (!isAuthenticated) {
      return (
        <>
          <Link to="/joblistings">Job Listings</Link>
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
            <Link to="/joblistings">Job Listings</Link>
            <Link to="/jobmanagement">Job Management</Link>
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
            <Link to="/joblistings">Job Listings</Link>
            <Link to="/browse-employers">Browse Employers</Link>
            <Link to="/browse-employers">Dashboard</Link>
            <Link to="/profile">Profile</Link>
            <Link className="btn" onClick={handleLogout}>
              Logout
            </Link>
          </>
        );
      default:
        return (
          <>
            <Link to="/joblistings">Job Listings</Link>
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
