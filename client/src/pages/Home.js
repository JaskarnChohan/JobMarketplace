import React, { useState, useEffect } from "react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Global.css";
import "../styles/job/JobCards.css";
import { FaMapMarkerAlt, FaDollarSign, FaSuitcase } from "react-icons/fa";

const Home = () => {
  const { isAuthenticated, logout, isJobSeeker, user } = useAuth(); // Destructure auth methods
  const navigate = useNavigate();
  const [jobListingData, setJobListingData] = useState([]); // State to hold job listings
  const [recommendedJobs, setRecommendedJobs] = useState([]); // State to hold recommended jobs
  const [errors, setErrors] = useState([]); // State to hold error messages
  const [hasProfile, setHasProfile] = useState(false); // State to track if user has a profile
  const [loadingRecommendedJobs, setLoadingRecommendedJobs] = useState(false); // State to manage loading status

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

  // Fetch profile data to check if user has a profile
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5050/api/profile/user/${user._id}`,
          { withCredentials: true }
        );
        setHasProfile(!!response.data); // Set true if profile data exists
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };

    if (isAuthenticated) {
      fetchProfileData(); // Fetch profile data if the user is authenticated
    }
  }, [isAuthenticated]);

  // useEffect to fetch recommended jobs if the user is authenticated and has a profile
  useEffect(() => {
    const fetchRecommendedJobs = async () => {
      if (isAuthenticated && isJobSeeker() && hasProfile) {
        setLoadingRecommendedJobs(true); // Set loading to true before fetching
        try {
          const response = await axios.get(
            "http://localhost:5050/api/jobs/recommended",
            { withCredentials: true }
          );
          setRecommendedJobs(response.data || []);
        } catch (error) {
          setErrors([{ msg: "Failed to load recommended jobs." }]);
        } finally {
          setLoadingRecommendedJobs(false); // Set loading to false after fetching
        }
      }
    };

    fetchRecommendedJobs();
  }, [isAuthenticated, isJobSeeker, hasProfile]);

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
      {/* Recommended Jobs Section */}
      {isAuthenticated && isJobSeeker() && hasProfile && (
        <div className="home-section">
          <h2 className="med-heading">Recommended Jobs for You</h2>
          <p className="home-section-text">
            Based on your profile, here are some jobs we recommend for you.
          </p>
          <div className="recent-job-listings">
            <div className="job-listing-container">
              {loadingRecommendedJobs ? ( // Show loading message while fetching
                <p className="home-section-text">Loading recommended jobs...</p>
              ) : Array.isArray(recommendedJobs) &&
                recommendedJobs.length > 0 ? (
                recommendedJobs.map((item) => (
                  <div className="job-card" key={item.jobId}>
                    <h3
                      className="job-title hover"
                      onClick={() => navigate(`/jobview/${item.jobId}`)}
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
                <p className="home-section-text">
                  No recommended jobs found. Update your profile to get
                  recommended jobs.
                </p>
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
      )}
      <Footer />
    </div>
  );
};

export default Home;
