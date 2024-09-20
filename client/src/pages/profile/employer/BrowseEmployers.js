import React, { useState } from "react";
import axios from "axios";
import Spinner from "../../../components/Spinner/Spinner";
import { FaMapMarkerAlt, FaGlobe, FaBriefcase, FaTag } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Navbar from "../../../components/layout/Navbar";
import Footer from "../../../components/layout/Footer";
import { useAuth } from "../../../context/AuthContext";
import "../../../styles/Global.css";
import "../../../styles/job/Job.css";
import noresults from "../../../assets/void.png";

const BrowseEmployers = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  // State variables
  const [employerData, setEmployerData] = useState([]);
  const [search, setSearch] = useState("");
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searched, setSearched] = useState(false); // New state to track search

  // Fetch employers based on search term and current page
  const fetchEmployers = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5050/api/employer", {
        params: { search, page: currentPage },
      });
      setEmployerData(res.data.employers);
      setTotalPages(res.data.totalPages);
      setSearched(true); // Set searched to true when fetching employers
    } catch (err) {
      setErrors([{ msg: "An error occurred: " + err }]);
    } finally {
      setLoading(false);
    }
  };

  // Handle user logout
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Update search input state
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  // Handle search form submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page for new search
    fetchEmployers(); // Fetch employers with the new search term
  };

  // Change the current page and fetch employers for that page
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    fetchEmployers();
  };

  return (
    <div>
      <Navbar isAuthenticated={isAuthenticated} handleLogout={handleLogout} />
      <div className="content browse-employees">
        <h1 className="lrg-heading">Employers</h1>
        <form onSubmit={handleSearchSubmit} className="filter-form">
          <div className="filter-group-wide">
            <label htmlFor="search">Search:</label>
            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Search by Employer Name"
            />
            <button type="submit" className="btn">
              Search
            </button>
          </div>
        </form>

        <div className="wrapper">
          <div className="job-listing-container">
            {loading && <Spinner />}
            {!loading &&
            searched &&
            Array.isArray(employerData) &&
            employerData.length > 0
              ? employerData.map((item) => (
                  <div className="job-card" key={item._id}>
                    <h3
                      className="job-title hover"
                      onClick={() => navigate(`/viewcompany/${item.user}`)}
                    >
                      {item.name}
                    </h3>
                    <p className="job-info">
                      <FaMapMarkerAlt /> Location: {item.location}
                    </p>
                    <p className="job-info">
                      <FaGlobe /> Website: {item.websiteURL}
                    </p>
                    <p className="job-info">
                      <FaBriefcase /> Industry: {item.industry}
                    </p>
                    <p className="job-info">
                      <FaTag /> Active Jobs: {item.jobCount} jobs
                    </p>
                  </div>
                ))
              : !loading &&
                searched && (
                  <div className="no-results">
                    <img src={noresults} alt="No results" />
                    <p>We couldn't find any employers.</p>
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
            onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index + 1}
              onClick={() => handlePageChange(index + 1)}
              className={currentPage === index + 1 ? "active" : ""}
            >
              {index + 1}
            </button>
          ))}
          <button
            onClick={() =>
              handlePageChange(Math.min(currentPage + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BrowseEmployers;
