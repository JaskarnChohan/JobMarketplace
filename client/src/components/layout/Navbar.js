import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaUser } from "react-icons/fa";
import "../../styles/misc/Nav.css";
import "../../styles/Global.css";
import { useAuth } from "../../context/AuthContext";

const Navbar = ({ isAuthenticated, handleLogout }) => {
  const { user } = useAuth(); // Get user information from Auth context
  const [dropdownOpen, setDropdownOpen] = useState(false); // State for dropdown menu
  const navigate = useNavigate(); // Navigation hook

  // Toggle the dropdown menu visibility
  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  // George Haeberlin: handle logout andd navigation
  const handleLogoutAndRedirect = async () => {
    try {
      await handleLogout();
      navigate("/");
    } catch (err) {
      console.error("Failed to logout", err);
    }
  };

  // Render navigation links based on authentication status
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

    return (
      <>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/messages">Messages</Link>
        {user.role === "employer" && (
          <>
            <Link to="/jobmanagement">Job Management</Link>
            <Link to="/createjob">Create Job</Link>
          </>
        )}

        {user.role === "jobSeeker" && (
          <>
            <Link to="/joblistings">Job Listings</Link>
            <Link to="/browse-employers">Browse Employers</Link>
          </>
        )}

        {/* Profile Dropdown for user actions */}
        <div className="dropdown">
          <FaUser className="icon" onClick={toggleDropdown} />{" "}
          {/* User icon for dropdown */}
          {dropdownOpen && (
            <div className="dropdown-menu">
              <Link to="/profile" className="dropdown-item">
                Profile
              </Link>
              <Link onClick={handleLogout} className="dropdown-item logout">
                Logout
              </Link>
            </div>
          )}
        </div>
      </>
    );
  };

  return (
    <nav>
      <Link className="lrg-heading" to="/">
        <img
          className="logo"
          src={require("../../assets/logo.png")}
          alt="logo"
        />
      </Link>
      <div className="navbar-links">{renderLinks()}</div>
    </nav>
  );
};

export default Navbar;
