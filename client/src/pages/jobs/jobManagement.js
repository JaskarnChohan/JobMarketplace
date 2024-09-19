import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../../styles/Global.css";
import "../../styles/job/Job.css";
import "../../styles/job/JobCards.css";
import "react-datepicker/dist/react-datepicker.css";
import Modal from "react-modal";
import {
  FaMapMarkerAlt,
  FaDollarSign,
  FaBuilding,
  FaClock,
  FaTag,
  FaCalendarAlt,
} from "react-icons/fa";
import noresults from "../../assets/void.png";

const JobManagement = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();
  const [confirmationModalIsOpen, setConfirmationModalIsOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);
  const [jobListingData, setJobListingData] = useState([]);
  const [jobFilters, setJobFilters] = useState({
    search: "",
    title: "",
    jobCategory: "",
    description: "",
    status: "",
    applicationDeadline: "",
    salaryRange: "",
    employmentType: "",
  });
  const [errors, setErrors] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState("newest");
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

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

  // Sorting Options
  const sortingOptions = [
    { value: "newest", label: "Newest" },
    { value: "oldest", label: "Oldest" },
  ];

  useEffect(() => {
    // Reset searched state when the component mounts
    setSearched(false);
  }, []);

  const getJobListings = async (page = 1) => {
    setSearched(true);
    setLoading(true);
    try {
      // Prepare Sort Parameter
      const sortParam = sortBy === "newest" ? -1 : 1; // -1 for descending, 1 for ascending

      const res = await axios.get(
        `http://localhost:5050/api/jobs/getbyemployer/${user._id}`,
        {
          params: { ...jobFilters, page, sortBy: sortParam },
        }
      );
      setJobListingData(res.data.jobs);
      setTotalPages(res.data.totalPages);
      setCurrentPage(page);
    } catch (err) {
      if (err.response && err.response.data.errors) {
        setErrors(err.response.data.errors);
      } else {
        console.error(err);
        setErrors([{ msg: "An error occurred: " + err }]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJobButton = () => {
    navigate("/createjob");
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Handle Filter Input Changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setJobFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  // Handle Sorting Change
  const handleSortChange = (e) => {
    const { value } = e.target;
    setSortBy(value);
  };

  const handleOnPublish = async (job, newStatus) => {
    let jobId = job._id;
    let updatedJob = { ...job, status: newStatus }; // Prepare the updated job object

    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };
      // Send a PUT request to update the job
      const res = await axios.put(
        `http://localhost:5050/api/jobs/update/${jobId}`,
        updatedJob,
        config
      );
      console.log("Update response:", res.data);
      // Update the state to reflect changes without reloading
      setJobListingData(
        jobListingData.map((j) =>
          j._id === jobId ? { ...j, status: newStatus } : j
        )
      );
    } catch (err) {
      console.error(err.response.data); // Handle errors, e.g., show error message to user
    }
  };

  const handleOnDelete = async () => {
    if (!jobToDelete) return; // Exit if no job is selected for deletion

    let jobId = jobToDelete._id;
    try {
      await axios.delete(`http://localhost:5050/api/jobs/delete/${jobId}`);
      getJobListings();
      closeConfirmationModal();
    } catch (err) {
      console.error(err.response.data); // Handle errors, e.g., show error message to user
    }
  };

  const openConfirmationModal = (job) => {
    setJobToDelete(job);
    setConfirmationModalIsOpen(true);
  };

  const closeConfirmationModal = () => setConfirmationModalIsOpen(false);

  return (
    <div>
      <Navbar isAuthenticated={isAuthenticated} handleLogout={handleLogout} />
      <div className="content">
        <h1 className="lrg-heading">Your Job Listings</h1>
        <div className="create-jobs-btn">
          <button className="btn" onClick={handleCreateJobButton}>
            Create Job Listing
          </button>
        </div>
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
          <div className="job-listing-container">
            {Array.isArray(jobListingData) && jobListingData.length > 0
              ? jobListingData.map((item) => (
                  <div className="job-card job-management-card" key={item._id}>
                    <h3
                      className="job-title"
                      onClick={() => navigate(`/jobview/${item._id}`)}
                    >
                      {item.title}
                    </h3>
                    <p className="company-name">{item.company}</p>
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
                    <div className="job-management-buttons">
                      <button
                        className="btn"
                        onClick={() => navigate(`/editjob/${item._id}`)}
                      >
                        Edit
                      </button>
                      {/* Conditionally Render the Button */}
                      {item.status === "Draft" && (
                        <button
                          className="btn"
                          onClick={() => handleOnPublish(item, "Open")}
                        >
                          Publish
                        </button>
                      )}
                      {item.status !== "Draft" && (
                        <button
                          className="btn button-red"
                          onClick={() => handleOnPublish(item, "Draft")}
                        >
                          Unpublish
                        </button>
                      )}
                      <button
                        className="btn button-red"
                        onClick={() => openConfirmationModal(item)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              : searched &&
                jobListingData.length === 0 &&
                !loading && (
                  <div className="no-results">
                    <img src={noresults} alt="No results" />
                    <p>We couldn't find any job listings. Please try again.</p>
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
      </div>
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
      {/* Confirmation Modal */}
      <Modal
        isOpen={confirmationModalIsOpen}
        onRequestClose={closeConfirmationModal}
        className="modal-wrapper"
      >
        <div className="modal">
          <h1 className="lrg-heading">Delete Job Listing</h1>
          <p className="med-text">
            Are you sure you want to delete this listing?
          </p>
          <div className="btn-container">
            <button onClick={handleOnDelete} className="btn-delete">
              Delete
            </button>
            <button onClick={closeConfirmationModal} className="btn-cancel">
              Cancel
            </button>
          </div>
        </div>
      </Modal>
      <Footer />
    </div>
  );
};

export default JobManagement;
