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
import "../../../styles/profile/Reviews.css"; // Correct import path

const ViewCompanyProfile = () => {
  // Hooks must be inside the component
  const { id } = useParams(); // Get the company ID from the URL parameters
  const [companyData, setCompanyData] = useState(null);
  const [jobListings, setJobListings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewText, setReviewText] = useState("");
  const [reviewerName, setReviewerName] = useState("");
  const [rating, setRating] = useState(5);

  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  // Handle logout and redirect to the home page
  const handleLogout = () => {
    logout();
    navigate("/");
  };
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    try {
      const newReview = {
        employerId: id,
        reviewerName,
        reviewText,
        rating,
      };
      await axios.post("http://localhost:5050/api/reviews", newReview, {
        withCredentials: true,
      });
      setReviews([...reviews, newReview]); // Update reviews list with the new review
      setReviewerName("");
      setReviewText("");
      setRating(5);
    } catch (error) {
      console.error("Failed to submit review:", error);
    }
  };
  
  // Fetch company data, job listings, and reviews when the component mounts
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
        fetchCompanyReviews();
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

    const fetchCompanyReviews = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5050/api/reviews/${id}`,
          {
            withCredentials: true,
          }
        );
        setReviews(response.data);
      } catch (error) {
        console.error("Failed to fetch reviews:", error);
      }
    };

    fetchCompanyData();
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
              <p className="section-text">No active job listings available.</p>
            )}
          </div>
        </div>
        {/* Add the Reviews Section Here */}
        <div className="section">
          <h2 className="section-title">Company Reviews</h2>
          <div className="reviews-list">
            {reviews.length > 0 ? (
              reviews.map((review, index) => (
                <div className="review-card" key={index}>
                  <strong>{review.reviewerName}</strong> ({review.rating} stars):
                  <p>{review.reviewText}</p>
                </div>
              ))
            ) : (
              <p className="section-text">No reviews available.</p>
            )}
          </div>
          <div className="review-form">
            <h3>Leave a Review</h3>
            <form onSubmit={handleSubmitReview}>
              <label>Your Name:</label>
              <input
                type="text"
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                required
              />
              <label>Your Review:</label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                rows="4"
                required
              ></textarea>
              <label>Rating:</label>
              <select
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
              >
                <option value="5">5 - Excellent</option>
                <option value="4">4 - Good</option>
                <option value="3">3 - Average</option>
                <option value="2">2 - Poor</option>
                <option value="1">1 - Terrible</option>
              </select>
              <button type="submit">Submit Review</button>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ViewCompanyProfile;
