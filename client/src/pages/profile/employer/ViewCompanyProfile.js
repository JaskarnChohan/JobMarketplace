import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhone,
  FaBriefcase,
  FaDollarSign,
  FaBuilding,
  FaClock,
  FaTag,
  FaCalendarAlt,
  FaGlobe,
} from "react-icons/fa";
import Navbar from "../../../components/layout/Navbar";
import Footer from "../../../components/layout/Footer";
import Spinner from "../../../components/Spinner/Spinner";
import { useAuth } from "../../../context/AuthContext";
import "../../../styles/profile/Profile.css";
import "../../../styles/profile/ProfileInfo.css";
import "../../../styles/Global.css";

const ViewCompany = () => {
  // Retrieve the company ID from the URL parameters
  const { id } = useParams();
  const [companyData, setCompanyData] = useState(null); // State to hold company data
  const [jobListings, setJobListings] = useState([]); // State to hold job listings

  const { isAuthenticated, logout } = useAuth(); // Authentication context
  const navigate = useNavigate(); // Hook for navigation

  // Handle user logout and navigate to home
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  useEffect(() => {
    // Function to fetch company data
    const fetchCompanyData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5050/api/employer/profile/fetch/${id}`,
          {
            withCredentials: true, // Include cookies for authentication
          }
        );
        setCompanyData(response.data); // Set the company data from the response
        fetchJobListings(); // Fetch job listings for the company
      } catch (error) {
        console.error("Failed to fetch company data:", error);
      }
    };

    // Function to fetch job listings for the company
    const fetchJobListings = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5050/api/jobs/getbyemployer/${id}`,
          {
            withCredentials: true,
          }
        );
        const openJobListings = response.data.jobs.filter(
          (job) => job.status === "Open" // Filter to get only open job listings
        );
        setJobListings(openJobListings); // Set the filtered job listings
      } catch (error) {
        console.error("Failed to fetch job listings:", error);
      }
    };

    fetchCompanyData(); // Initiate fetch when component mounts
  }, [id]);

  // If company data is not yet available, show a loading spinner
  if (!companyData) return <Spinner />;

  return (
    <div className="profile-container">
      <Navbar isAuthenticated={isAuthenticated} handleLogout={handleLogout} />
      <div className="profile-information-container">
        <div className="profile-header">
          <div className="profile-picture-container">
            <img
              src={`http://localhost:5050/${companyData.logo}`}
              alt="Company Logo"
              className="profile-picture"
            />
          </div>
          <div className="profile-info">
            <h1 className="profile-name">{companyData.name}</h1>
            <p className="profile-location">
              <FaMapMarkerAlt /> {companyData.location}
            </p>
            <p className="profile-email">
              <FaEnvelope /> {companyData.email}
            </p>
            <p className="profile-website">
              <FaGlobe /> {companyData.websiteURL}
            </p>
            <p className="profile-phone">
              <FaPhone /> {companyData.phoneNumber}
            </p>
            <p className="profile-industry">
              <FaBriefcase /> {companyData.industry}
            </p>
          </div>
        </div>
      </div>
      <div>
        <div className="section">
          <h2 className="section-title">About {companyData.name}</h2>
          <pre className="section-text wrap">{companyData.description}</pre>
        </div>
        <div className="section">
          <h2 className="section-title">Active Job Listings</h2>
          <div className="job-listing-container">
            {Array.isArray(jobListings) && jobListings.length > 0 ? (
              jobListings.map((job) => (
                <div className="job-card" key={job._id}>
                  <h3
                    className="job-title hover"
                    onClick={() => navigate(`/jobview/${job._id}`)}
                  >
                    {job.title}
                  </h3>
                  <p className="job-info">
                    <FaBuilding /> {job.jobCategory}
                  </p>
                  <p className="job-info">
                    <FaMapMarkerAlt /> {job.location}
                  </p>
                  <p className="job-info">
                    <FaClock /> {job.employmentType}
                  </p>
                  <p className="job-info">
                    <FaTag /> {job.status}
                  </p>
                  <p className="job-info">
                    <FaDollarSign /> {job.salaryRange}
                  </p>
                  <p className="job-info">
                    <FaCalendarAlt />
                    {" Deadline: "}{" "}
                    {new Date(job.applicationDeadline).toLocaleDateString()}
                  </p>
                </div>
              ))
            ) : (
              <p className="section-text">No active job listings available.</p>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ViewCompany;
