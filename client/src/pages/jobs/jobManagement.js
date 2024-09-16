import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../../components/header/Navbar";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../../global.css";
import "../auth/form.css";
import Textarea from 'react-expanding-textarea';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const JobManagement = () => {
    const { isAuthenticated, logout, user } = useAuth();
    const token = localStorage.getItem("token");
    const navigate = useNavigate();
    const [jobListingData, setJobListingData] = useState([]);
    const [jobFilters, setJobFilters] = useState({
        search: "",
        title: "",
        jobCategory: "",
        description: "",
        company: "",
        status: "",
        applicationDeadline: "",
        salaryRange: "",
        employmentType: "",
    });
    const [errors, setErrors] = useState([]);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [sortBy, setSortBy] = useState("newest"); // Sorting Option

    const salaryRanges = [
        "$0-$10,000", "$10,000-$20,000", "$20,000-$40,000", "$40,000-$60,000",
        "$60,000-$80,000", "$80,000-$100,000", "$100,000-$120,000",
        "$120,000-$140,000", "$140,000-$160,000", "$160,000-$180,000",
        "$180,000-$200,000", "$200,000+"
      ];

    const employmentTypes = ["Full-time", "Part-time", "Contract", "Temporary", "Internship"];

    // Sorting Options
    const sortingOptions = [
        { value: "newest", label: "Newest" },
        { value: "oldest", label: "Oldest" },
    ];

    const getJobListings = async (page = 1) => {
        try {
            // Prepare Sort Parameter
            const sortParam = sortBy === "newest" ? -1 : 1; // -1 for descending, 1 for ascending

            const res = await axios.get(`http://localhost:5050/api/jobs/getbyemployer/${user._id}`, {
                params: { ...jobFilters, page, sortBy: sortParam }
            });
            setJobListingData(res.data.jobs)
            setTotalPages(res.data.totalPages);
            setCurrentPage(page);
        } catch (err) {
            if (err.response && err.response.data.errors) {
                setErrors(err.response.data.errors);
            } else {
                console.error(err);
                setErrors([{ msg: "An error occurred: " + err}]);
            }
        }
    }

    // Use useEffect to call getJobListings when the component mounts
    useEffect(() => {
        if (user && user._id) {
        getJobListings();
        }
    }, [user]); // Run the effect when 'user' changes

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
        let updatedJob = { ...job, status: newStatus };  // Prepare the updated job object

        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json'
                }
            };
            // Send a PUT request to update the job
            const res = await axios.put(`http://localhost:5050/api/jobs/update/${jobId}`, updatedJob, config);
            console.log("Update response:", res.data);
            // Update the state to reflect changes without reloading
            setJobListingData(jobListingData.map(j => j._id === jobId ? { ...j, status: newStatus } : j));
        } catch (err) {
            console.error(err.response.data); // Handle errors, e.g., show error message to user
        }
    }

    const handleOnDelete = async (job) => {
        const confirmation = window.confirm("Are you sure you want to delete this job listing?");
        let jobId = job._id;
        if (confirmation) {
            try {
                await axios.delete(`http://localhost:5050/api/jobs/delete/${jobId}`);
                alert("Job listing deleted successfully");
                getJobListings();
            } catch (err) {
                console.error(err.response.data); // Handle errors, e.g., show error message to user
            }
        }
    }

    return (
        <div>
            <Navbar isAuthenticated={isAuthenticated} handleLogout={handleLogout} />
            <div className="content">
                <h1 className="lrg-heading">Your Job Listings</h1>
                {/* <button className="btn button-blue" onClick={getJobListings}>Refresh Job Listings</button> */}
                <button className="btn button-blue" onClick={handleCreateJobButton}>Create Job Listing</button>
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
                    <button type="submit" className="btn button-blue">
                    Search
                    </button>
                </form>
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
                <div className="wrapper">
                    <div className="job-listing-container">
                        {Array.isArray(jobListingData) && jobListingData.length > 0 ? (
                        jobListingData.map((item) => (
                            <div className="box" key={item._id}>
                                <h3>{item.title}</h3>
                                <p>Category: {item.jobCategory}</p>
                                <p>Type: {item.employmentType}</p>
                                <p>Company: {item.company}</p>
                                <p>Listing Status: {item.status}</p>
                                <p>Salary: {item.salaryRange}</p>
                                <p>
                                    Deadline:{" "}
                                    {new Date(item.applicationDeadline).toLocaleDateString()}
                                </p>
                                <button className="btn button-blue" onClick={() => navigate(`/editjob/${item._id}`)}>Edit</button>
                                {/* Conditionally Render the Button */}
                                {item.status === "Draft" && (
                                    <button className="btn button-blue" onClick={() => handleOnPublish(item, 'Open')}>Publish</button>
                                )}
                                {item.status !== "Draft" && (
                                    <button className="btn button-red" onClick={() => handleOnPublish(item, 'Draft')}>Unpublish</button>
                                )}
                                <button className="btn button-red" onClick={() => handleOnDelete(item)}>Delete</button>
                            </div>
                        ))
                        ) : (
                        <p>No job listings found.</p>
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
        </div>
    );
};

export default JobManagement;