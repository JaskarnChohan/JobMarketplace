import React from "react";
import Navbar from "../../components/header/Navbar";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import "../../styles/Global.css";

const Home = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div>
      <Navbar isAuthenticated={isAuthenticated} handleLogout={handleLogout} />
      <div id="banner">
        <div className="banner-content">
          <h1 className="lrg-heading">JobHive</h1>
          <h2 className="med-heading">
            Discover Your Next Opportunity – Connect with Employers, Explore
            Jobs, and Apply with Ease
          </h2>
          <Link className="btn" to="/job-listings">
            Browse Jobs
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
