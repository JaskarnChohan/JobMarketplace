import React, { useState, useEffect } from "react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Global.css";
import "../styles/job/JobCards.css";
import { FaMapMarkerAlt, FaDollarSign, FaSuitcase } from "react-icons/fa";

const Home = () => {
  const { isAuthenticated, logout } = useAuth(); // Destructure auth methods
  const navigate = useNavigate();
  const [jobListingData, setJobListingData] = useState([]); // State to hold job listings
  const [errors, setErrors] = useState([]); // State to hold error messages

  // Function to handle user logout
  const handleLogout = () => {
    logout(); // Call the logout function
    navigate("/"); // Navigate to the home page after logout
  };

  // useEffect to fetch latest job listings on component mount
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch("http://localhost:5050/api/jobs/latest"); // Fetch latest jobs
        const data = await response.json(); // Parse the JSON response
        setJobListingData(data.jobs || []); // Set job data or empty array if no jobs
      } catch (error) {
        setErrors([{ msg: "Failed to load job listings." }]); // Set error if fetch fails
      }
    };
    fetchJobs(); // Call the fetch function
  }, []);

  return (
    <div>
      <Navbar isAuthenticated={isAuthenticated} handleLogout={handleLogout} />
      <div id="banner">
        <div className="banner-content">
          <img
            className="logo"
            src={require("../assets/logo.png")}
            alt="logo"
          />
          <h2 className="banner-heading">
            Discover Your Next Opportunity – Connect with Employers, Explore
            Jobs, and Apply with Ease.
          </h2>
          <Link className="btn" to="/jobListings">
            Browse Jobs
          </Link>
        </div>
      </div>

      <div className="home-section-wrapper">
        <div className="home-section">
          <h2 className="med-heading">Latest Job Listings</h2>
          <p className="home-section-text">
            Explore the latest job opportunities and find your perfect match
            among our most recent listings.
          </p>
          <div className="recent-job-listings">
            <div className="job-listing-container">
              {Array.isArray(jobListingData) && jobListingData.length > 0 ? (
                jobListingData.map((item) => (
                  <div className="job-card" key={item._id}>
                    <h3
                      className="job-title hover"
                      onClick={() => navigate(`/jobview/${item._id}`)}
                    >
                      {item.title}
                    </h3>
                    <p
                      className="company-name"
                      onClick={() => navigate(`/viewcompany/${item.employer}`)}
                    >
                      {item.company}
                    </p>
                    <p className="job-info">
                      <FaMapMarkerAlt /> {item.location}
                    </p>
                    <p className="job-info">
                      <FaSuitcase /> {item.employmentType}
                    </p>
                    <p className="job-info">
                      <FaDollarSign /> {item.salaryRange}
                    </p>
                  </div>
                ))
              ) : (
                <p className="home-section-text">No job listings found.</p>
              )}
            </div>
            {errors.length > 0 && (
              <div className="error-messages">
                {errors.map((error, index) => (
                  <p key={index}>{error.msg}</p>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Home;
