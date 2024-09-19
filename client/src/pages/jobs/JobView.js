import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import "../../styles/job/JobView.css";
import Spinner from "../../components/Spinner/Spinner";
import {
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaClock,
  FaBriefcase,
} from "react-icons/fa";
import "react-datepicker/dist/react-datepicker.css";

const JobView = () => {
  const { _id } = useParams();
  const { isAuthenticated, logout, user, isJobSeeker } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const [job, setJob] = useState({
    employer: "",
    title: "",
    description: "",
    company: "",
    location: "",
    jobCategory: "",
    requirements: [],
    benefits: [],
    salaryRange: "",
    employmentType: "",
    applicationDeadline: new Date(),
    status: "",
    datePosted: "",
  });

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5050/api/jobs/${_id}`
        );
        setJob(response.data);
        setLoading(false);
      } catch (err) {
        setLoading(false);
        console.error(err);
      }
    };

    fetchJob();
  }, [_id]);

  if (loading) return <Spinner />;
  if (!job)
    return (
      <div>
        <h1 className="lrg-heading">Job Not Found</h1>
      </div>
    );

  const daysAgo = Math.floor(
    (new Date() - new Date(job.datePosted)) / (1000 * 60 * 60 * 24)
  );

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleLoginRedirect = () => {
    navigate("/login");
  };

  const handleApply = async () => {
    try {
      const res = await axios.post(
        `http://localhost:5050/api/jobs/createapplication`,
        {
          jobId: _id,
          userId: user._id,
        }
      );
      console.log(res.data);
      alert("Successfully applied!");
      navigate("/joblistings");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <Navbar isAuthenticated={isAuthenticated} handleLogout={handleLogout} />
      <div className="content">
        <h1 className="lrg-heading">Job Listing</h1>
        <div className="job-details-container">
          <div className="job-header">
            <h2>{job.title}</h2>
            <p className="company-info">{job.company}</p>
          </div>

          <div className="job-icons">
            <p>
              <FaMapMarkerAlt /> {job.location}
            </p>
            <p>
              <FaMoneyBillWave /> {job.salaryRange}
            </p>
            <p>
              <FaBriefcase /> {job.jobCategory}
            </p>
            <p>
              <FaClock /> {job.employmentType}
            </p>
            <p>
              <FaCalendarAlt /> Application Deadline:{" "}
              {new Date(job.applicationDeadline).toLocaleDateString()}
            </p>
            <p>
              {daysAgo === 0 ? "Posted Today" : `Posted ${daysAgo} days ago`}
            </p>

            {isAuthenticated ? (
              isJobSeeker() ? (
                <div className="apply-button-container">
                  <button className="btn" onClick={handleApply}>
                    Quick Apply
                  </button>
                </div>
              ) : null
            ) : (
              <div className="login-prompt-container">
                <button className="btn" onClick={handleLoginRedirect}>
                  Login to Apply
                </button>
              </div>
            )}
          </div>
          <div className="job-description">
            <h3>Description</h3>
            <pre className="job-description">{job.description}</pre>
          </div>

          <div className="job-requirements">
            <h3>Requirements</h3>
            <ul>
              {job.requirements.map((req, index) => (
                <li key={index}>
                  <p>{req}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="job-benefits">
            <h3>Benefits</h3>
            <ul>
              {job.benefits.map((benefit, index) => (
                <li key={index}>
                  <p>{benefit}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default JobView;
