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
  const { id } = useParams(); // Get the company ID from the URL
  const [companyData, setCompanyData] = useState(null);
  const [jobListings, setJobListings] = useState([]);

  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5050/api/employer/profile/fetch/${id}`,
          {
            withCredentials: true,
          }
        );
        setCompanyData(response.data);
        fetchJobListings();
      } catch (error) {
        console.error("Failed to fetch company data:", error);
      }
    };

    const fetchJobListings = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5050/api/jobs/getbyemployer/${id}`,
          {
            withCredentials: true,
          }
        );
        const openJobListings = response.data.jobs.filter(
          (job) => job.status === "Open"
        );
        setJobListings(openJobListings);
      } catch (error) {
        console.error("Failed to fetch job listings:", error);
      }
    };

    fetchCompanyData();
  }, [id]);

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
                    <h3 className="job-title">{job.title}</h3>
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
                <p className="section-text">
                  No active job listings available.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ViewCompany;
