import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaUser } from "react-icons/fa";
import "../../styles/misc/Nav.css";
import "../../styles/Global.css";
import { useAuth } from "../../context/AuthContext";

const Navbar = ({ isAuthenticated, handleLogout }) => {
  const { user } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

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
        {user.role === "employer" && (
          <>
            <Link to="/jobmanagement">Job Management</Link>
            <Link to="/createjob">Create Job</Link>
            <Link to="/applications">Applications</Link>
          </>
        )}

        {user.role === "jobSeeker" && (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/joblistings">Job Listings</Link>
            <Link to="/browse-employers">Browse Employers</Link>
          </>
        )}

        {/* Profile Dropdown */}
        <div className="dropdown">
          <FaUser className="icon" onClick={toggleDropdown} />
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
