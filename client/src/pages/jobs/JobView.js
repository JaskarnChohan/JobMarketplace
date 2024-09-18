import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../../components/header/Navbar";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import "../../global.css";
import "../auth/form.css";
import "./jobView.css";  // New CSS file for job view
import Textarea from 'react-expanding-textarea';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const JobView = () => {
  const { _id } = useParams();
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [errors, setError] = useState([]);
  const token = localStorage.getItem("token");
  const [job, setJob] = useState({
    employer: '',
    title: '',
    description: '',
    company: '',
    location: '',
    jobCategory: '',
    requirements: [],
    benefits: [],
    salaryRange: '',
    employmentType: '',
    applicationDeadline: new Date(),
    status: '',
  });

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await axios.get(`http://localhost:5050/api/jobs/${_id}`);
        setJob(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch job');
        setLoading(false);
        console.error(err);
      }
    };

    fetchJob();
  }, [_id]);

  if (!isAuthenticated) {
    navigate("/login");
  }

  const { employer, title, description, company, location, jobCategory, requirements, benefits, salaryRange, employmentType, applicationDeadline, status } = job;

  if (loading) return <div>Loading...</div>;
  if (!job) return <div>Job not found</div>;
  if (!user) {
    return <div>Loading...</div>;
  }

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleApply = async () => {
    try {
        let listingId = _id
        const res = await axios.post(`http://localhost:5050/api/jobs/createapplication`, {
            jobId: _id,   // Send jobId
            userId: user._id,  // Send userId
          });
        console.log(res.data);
        alert("Successfully applied!");
        navigate("/joblistings");
    } catch (err) {
        console.error(err);
        setError([{ msg: "An error occurred: " + err}]);
    }
  };


  return (
    <div>
      <Navbar isAuthenticated={isAuthenticated} handleLogout={handleLogout} />
      <div className="content">
        <h1 className="lrg-heading">Job Listing</h1>
        <div className="job-details-container">
          <div className="job-header">
            <h2>{title}</h2>
            <p className="company-info">{company}</p>
            <p className="location-info">{location}</p>
          </div>

          <div className="job-details">
            <p><strong>Category:</strong> {jobCategory}</p>
            <p><strong>Employment Type:</strong> {employmentType}</p>
            <p><strong>Salary Range:</strong> {salaryRange}</p>
            <p><strong>Application Deadline:</strong> {new Date(applicationDeadline).toLocaleDateString()}</p>
          </div>

          <div className="job-description">
            <h3>Job Description</h3>
            <p>{description}</p>
          </div>

          <div className="job-requirements">
            <h3>Requirements</h3>
            <ul>
              {requirements.map((req, index) => (
                <li key={index}>
                  <p>{req}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="job-benefits">
            <h3>Benefits</h3>
            <ul>
              {benefits.map((benefit, index) => (
                <li key={index}>
                  <p>{benefit}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="apply-button-container">
            <button className="apply-button" onClick={handleApply}>
              Apply Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobView;
