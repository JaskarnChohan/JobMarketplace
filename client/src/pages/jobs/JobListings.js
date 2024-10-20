import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../../styles/Global.css";
import "../../styles/job/Job.css";
import { categories as categoryList } from "../../assets/categories";
import "react-datepicker/dist/react-datepicker.css";
import {
  FaMapMarkerAlt,
  FaDollarSign,
  FaBuilding,
  FaClock,
  FaTag,
  FaCalendarAlt,
  FaSuitcase,
} from "react-icons/fa";
import noresults from "../../assets/void.png";

const JobListings = () => {
  // Authentication context and navigation hook
  const { isAuthenticated, logout, user, isJobSeeker } = useAuth();
  const navigate = useNavigate();

  // State for job listings and filters
  const [jobListingData, setJobListingData] = useState([]);
  const [jobFilters, setJobFilters] = useState({
    search: "",
    title: "",
    jobCategory: "",
    description: "",
    status: "Open",
    applicationDeadline: "",
    salaryRange: "",
    employmentType: "",
  });
  const [recommendedJobs, setRecommendedJobs] = useState([]); // State to hold recommended jobs
  const [errors, setErrors] = useState([]); // State to hold error messages
  const [hasProfile, setHasProfile] = useState(false); // State to track if user has a profile
  const [loadingRecommendedJobs, setLoadingRecommendedJobs] = useState(false); // State to manage loading status
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState("newest");
  const [searched, setSearched] = useState(false);

  // Define salary ranges and employment types
  const salaryRanges = [
    "$0-$10,000",
    "$10,000-$20,000",
    "$20,000-$40,000",
    "$40,000-$60,000",
    "$60,000-$80,000",
    "$80,000-$100,000",
    "$100,000-$120,000",
    "$120,000-$140,000",
    "$140,000-$160,000",
    "$160,000-$180,000",
    "$180,000-$200,000",
    "$200,000+",
  ];

  const employmentTypes = [
    "Full-time",
    "Part-time",
    "Contract",
    "Temporary",
    "Internship",
  ];

  // Sorting options for job listings
  const sortingOptions = [
    { value: "newest", label: "Newest" },
    { value: "oldest", label: "Oldest" },
  ];

  // Reset the searched state when the component mounts
  useEffect(() => {
    setSearched(false);
    getJobListings();
  }, []);

  // Fetch profile data to check if user has a profile
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const profileResponse = await axios.get(
          `http://localhost:5050/api/profile/fetch/`,
          { withCredentials: true }
        );
        setHasProfile(profileResponse.data.profileExists);
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
          setRecommendedJobs(response.data || []); // Set recommended jobs
        } catch (error) {
          setErrors([{ msg: "Failed to load recommended jobs." }]);
        } finally {
          setLoadingRecommendedJobs(false); // Set loading to false after fetching
        }
      }
    };

    fetchRecommendedJobs();
  }, [isAuthenticated, isJobSeeker, hasProfile]);

  // Fetch job listings from the API
  const getJobListings = async (page = 1) => {
    setSearched(true); // Set searched to true when a search is made
    try {
      // Determine sorting order based on user selection
      const sortParam = sortBy === "newest" ? -1 : 1;

      const res = await axios.get("http://localhost:5050/api/jobs/", {
        params: { ...jobFilters, page, sortBy: sortParam },
      });
      // Update state with fetched job listings and pagination info
      setJobListingData(res.data.jobs);
      setTotalPages(res.data.totalPages);
      setCurrentPage(page);
    } catch (err) {
      // Handle errors from the API
      if (err.response && err.response.data.errors) {
        setErrors(err.response.data.errors);
      } else {
        console.error(err);
        setErrors([{ msg: "An error occurred: " + err }]);
      }
    }
  };

  const [categories] = useState(categoryList); // List of job categories

  // Handle user logout
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Update filter values as user types or selects options
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setJobFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  // Update sorting option when user selects a different sort method
  const handleSortChange = (e) => {
    const { value } = e.target;
    setSortBy(value);
  };

  return (
    <div>
      <Navbar isAuthenticated={isAuthenticated} handleLogout={handleLogout} />
      <div className="content">
        <h1 className="lrg-heading">Job Listings</h1>
        {/* Filter Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            getJobListings();
          }}
          className="filter-form"
        >
          {/* Search Filter */}
          <div className="filter-group-wide">
            <label htmlFor="search">Search:</label>
            <input
              type="text"
              name="search"
              value={jobFilters.search}
              onChange={handleFilterChange}
              placeholder="Search by Title or Description"
            />
          </div>
          <div className="inner-filter-group">
            {/* Categories Filter */}
            <div className="filter-group">
              <label htmlFor="jobCategory">Categories:</label>
              <select
                name="jobCategory"
                id="jobCategory"
                value={jobFilters.categories}
                onChange={handleFilterChange}
              >
                <option value="">All Categories</option>
                {categories.map((category, index) => (
                  <option key={index} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Salary Range Filter */}
            <div className="filter-group">
              <label htmlFor="salaryRange">Salary Range:</label>
              <select
                name="salaryRange"
                id="salaryRange"
                value={jobFilters.salaryRange}
                onChange={handleFilterChange}
              >
                <option value="">All Salary Ranges</option>
                {salaryRanges.map((range, index) => (
                  <option key={index} value={range}>
                    {range}
                  </option>
                ))}
              </select>
            </div>

            {/* Employment Type Filter */}
            <div className="filter-group">
              <label htmlFor="employmentType">Employment Type:</label>
              <select
                name="employmentType"
                id="employmentType"
                value={jobFilters.employmentType}
                onChange={handleFilterChange}
              >
                <option value="">All Employment Types</option>
                {employmentTypes.map((type, index) => (
                  <option key={index} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="filter-group">
              <label htmlFor="status">Status:</label>
              <select
                name="status"
                id="status"
                value={jobFilters.status}
                onChange={handleFilterChange}
              >
                <option value="">All Statuses</option>
                <option value="Open">Open</option>
                <option value="On Hold">On Hold</option>
                <option value="Canceled">Canceled</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            {/* Sort By Date Posted */}
            <div className="filter-group">
              <label htmlFor="sortBy">Sort By:</label>
              <select
                name="sortBy"
                id="sortBy"
                value={sortBy}
                onChange={handleSortChange}
              >
                {sortingOptions.map((option, index) => (
                  <option key={index} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button type="submit" className="btn">
            Search
          </button>
        </form>

        <div className="wrapper">
          {/* Job Listings */}
          <div className="job-listing-container">
            {Array.isArray(jobListingData) && jobListingData.length > 0
              ? jobListingData.map((item) => (
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
                      <FaBuilding /> {item.jobCategory}
                    </p>
                    <p className="job-info">
                      <FaMapMarkerAlt /> {item.location}
                    </p>
                    <p className="job-info">
                      <FaClock /> {item.employmentType}
                    </p>
                    <p className="job-info">
                      <FaTag /> {item.status}
                    </p>
                    <p className="job-info">
                      <FaDollarSign /> {item.salaryRange}
                    </p>
                    <p className="job-info">
                      <FaCalendarAlt />
                      {"Deadline:  "}
                      {new Date(item.applicationDeadline).toLocaleDateString()}
                    </p>
                  </div>
                ))
              : searched && (
                  <div className="no-results">
                    <img src={noresults} alt="No results" />
                    <p>We couldn't find any job listings.</p>
                    <p>Please try again.</p>
                  </div>
                )}
          </div>
        </div>
        {errors.length > 0 && (
          <div className="error-messages">
            {errors.map((error, index) => (
              <p key={index}>{error.msg}</p>
            ))}
          </div>
        )}
        {/* Pagination Controls */}
        <div className="pagination">
          <button
            onClick={() => getJobListings(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index + 1}
              onClick={() => getJobListings(index + 1)}
              className={currentPage === index + 1 ? "active" : ""}
            >
              {index + 1}
            </button>
          ))}
          <button
            onClick={() => getJobListings(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
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

export default JobListings;
