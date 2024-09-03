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
    const [jobListingData, setJobListingData] = useState([{
        title: "",
        description: "",
        company: "",
    },]);
    const [errors, setErrors] = useState([]);
    const { employer, title, description, company, location, jobCategory, requirements, benefits, salaryRange, employmentType, applicationDeadline, status } = jobListingData;
    const getJobListings = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.get("http://localhost:5050/api/jobs/", {
                title,
                description,
                company,
            });
            setJobListingData(res.data)
        } catch (err) {
            if (err.response && err.response.data.errors) {
                setErrors(err.response.data.errors);
            } else {
                console.error(err);
                setErrors([{ msg: "An error occurred: " + err}]);
            }
        }
    }

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    return (
        <div>
            <Navbar isAuthenticated={isAuthenticated} handleLogout={handleLogout} />
            <div className="content">
                <h1 className="lrg-heading">Job Listings</h1>
                <button className="btn" onClick={getJobListings}>Get Job Listings</button>
                <div className="form-container-wide">
                    <div className="section">
                        {Array.isArray(jobListingData) && jobListingData.map((item, index) => (
                        <div className="form-container-wide">
                            <h4 key={index}>{item.title}</h4>
                            <h4 key={index}>{item.description}</h4>
                            <h4 key={index}>{item.company}</h4>
                        </div>
                        ))}
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