import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import { useAuth } from "../../context/AuthContext";
import Modal from "react-modal";
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
  const [confirmationModalIsOpen, setConfirmationModalIsOpen] = useState(false);
  const [jobToApply, setJobToApply] = useState(null);
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

  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5050/api/jobs/${_id}`
        );
        setJob(response.data);

        // Check if the user has already applied for this job
        if (isAuthenticated && user) {
          const applicationResponse = await axios.get(
            `http://localhost:5050/api/application/check`,
            {
              params: {
                jobId: _id,
                userId: user._id,
              },
            }
          );
          setHasApplied(applicationResponse.data.hasApplied);
        }

        setLoading(false);
      } catch (err) {
        setLoading(false);
        console.error(err);
      }
    };

    fetchJob();
  }, [_id, isAuthenticated, user]);

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

  const openConfirmationModal = (job) => {
    setJobToApply(job);
    setConfirmationModalIsOpen(true);
  };

  const closeConfirmationModal = () => setConfirmationModalIsOpen(false);

  const handleApply = async () => {
    try {
      const res = await axios.post(`http://localhost:5050/api/application/`, {
        jobId: _id,
        userId: user._id,
      });
      console.log(res.data);
      setHasApplied(true);
      navigate("/dashboard");
    } catch (err) {
      closeConfirmationModal();
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
              isJobSeeker() && job.status === "Open" && !hasApplied ? (
                <div className="apply-button-container">
                  <button
                    className="btn"
                    onClick={() => openConfirmationModal(job)}
                  >
                    Quick Apply
                  </button>
                </div>
              ) : hasApplied ? (
                <p className="applied-notification">
                  You have already applied for this job.
                </p>
              ) : (
                <p className="status-notification">
                  This job is currently not accepting applications.
                </p>
              )
            ) : (
              <div className="login-prompt-container">
                <button className="btn" onClick={() => navigate("/login")}>
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
      {/* Confirmation Modal */}
      <Modal
        isOpen={confirmationModalIsOpen}
        onRequestClose={closeConfirmationModal}
        className="modal-wrapper"
      >
        <div className="modal">
          <h1 className="lrg-heading">Confirm Application</h1>
          <p className="med-text">
            By applying to this job, the employer can see your profile.
          </p>
          <div className="btn-container">
            <button onClick={handleApply} className="btn-delete">
              Confirm
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

export default JobView;
