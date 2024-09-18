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

const JobListings = () => {
    const { isAuthenticated, logout, user } = useAuth();
    const navigate = useNavigate();
    const [jobListingData, setJobListingData] = useState([]);
    const [jobFilters, setJobFilters] = useState({
        search: "",
        title: "",
        jobCategory: "",
        description: "",
        company: "",
        status: "Open",
        applicationDeadline: "",
        salaryRange: "",
        employmentType: "",
    });
    const [errors, setErrors] = useState([]);
    const [filteredCompanies, setFilteredCompanies] = useState([]); // Filtered companies for autocomplete
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

            const res = await axios.get("http://localhost:5050/api/jobs/", {
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
    const [companies, setCompanies] = useState([]);
    const getCompanies = async () => {
        try {
            let res = await axios.get("http://localhost:5050/api/jobs/companies", {});
            const uniqueCompanies = res.data.companies;
            setCompanies(uniqueCompanies); // Assuming you have a state called 'companies'
        } catch (err) {
            console.error("Error fetching companies:", err);
        }
    };

     // Use useEffect to call getJobListings when the component mounts
     useEffect(() => {
        if (user && user._id) {
            getJobListings();
            getCompanies(); // Fetch unique companies when the component mounts
        }
    }, [user]); // Run the effect when 'user' changes

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

    const handleApply = async (jobId) => {
        try {
            const res = await axios.post(`http://localhost:5050/api/jobs/createapplication`, {
                jobId: jobId,   // Send jobId
                userId: user._id,  // Send userId
              });
            console.log(res.data);
            alert("Successfully applied!");
            navigate("/joblistings");
        } catch (err) {
            console.error(err);
            setErrors([{ msg: "An error occurred: " + err}]);
        }
      };

    return (
        <div>
            <Navbar isAuthenticated={isAuthenticated} handleLogout={handleLogout} />
            <div className="content">
                <h1 className="lrg-heading">Job Listings</h1>
                {/* <button className="btn" onClick={getJobListings}>Refresh Job Listings</button> */}
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
                    {/* Company Filter */}
                    <div className="filter-group">
                        <label htmlFor="company">Company:</label>
                        <select
                        name="company"
                        id="company"
                        value={jobFilters.company}
                        onChange={handleFilterChange}
                        >
                        <option value="">All Companies</option>
                        {companies.map((company, index) => (
                            <option key={index} value={company}>
                            {company}
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
                                <h3 htmlFor="title" onClick={() => navigate(`/jobview/${item._id}`)}>{item.title}</h3>
                                <p>Category: {item.jobCategory}</p>
                                <p>Type: {item.employmentType}</p>
                                <p>Company: {item.company}</p>
                                <p>Listing Status: {item.status}</p>
                                <p>Salary: {item.salaryRange}</p>
                                <p>
                                    Deadline:{" "}
                                    {new Date(item.applicationDeadline).toLocaleDateString()}
                                </p>
                                <button className="btn button-blue" onClick={() => handleApply(item._id)}>
                                Apply Now
                                </button>
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

export default JobListings;