import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import { useAuth } from "../../context/AuthContext";
import Modal from "react-modal";
import { useNavigate, useParams } from "react-router-dom";
import "../../styles/job/JobView.css";
import Spinner from "../../components/Spinner/Spinner";
import JobQnA from "./JobQnA";
import {
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaClock,
  FaBriefcase,
} from "react-icons/fa";
import "react-datepicker/dist/react-datepicker.css";

const JobView = () => {
  const { _id } = useParams(); // Extract the job ID from the URL
  const { isAuthenticated, logout, user, isJobSeeker } = useAuth(); // Grab authentication details from context
  const [hasProfile, setHasProfile] = useState(false); // State to track if user has a profile
  const [confirmationModalIsOpen, setConfirmationModalIsOpen] = useState(false); // State to manage modal visibility
  const navigate = useNavigate(); // Hook to navigate programmatically
  const [loading, setLoading] = useState(true); // State to manage loading status
  const [errors, setErrors] = useState([]); // State to hold error messages

  const [questions, setQuestions] = useState([]); // State to hold job questions
  const [answers, setAnswers] = useState({}); // State to hold user answers

  // State to hold job details
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

  const [savedJobs, setSavedJobs] = useState([]); // State to hold saved jobs

  const [hasApplied, setHasApplied] = useState(false); // Track if the user has applied

  // Fetch job details on component mount
  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5050/api/jobs/${_id}`
        );
        setJob(response.data);
        setQuestions(response.data.questions);

        if (isAuthenticated && user) {
          // Check if the user has already applied for this job
          const applicationResponse = await axios.get(
            `http://localhost:5050/api/application/check`,
            {
              params: {
                jobId: _id,
                userId: user._id,
              },
            }
          );
          setHasApplied(applicationResponse.data.hasApplied); // Update applied status

          // Check if the user has a profile
          const profileResponse = await axios.get(
            `http://localhost:5050/api/profile/fetch/`,
            { withCredentials: true } // Ensure credentials (cookies) are included in request
          );

          // Update profile existence state based on response
          setHasProfile(profileResponse.data.profileExists);
        }

        setLoading(false); // Set loading state to false
      } catch (err) {
        setLoading(false); // Set loading state to false
        console.error(err); // Log any errors
      }
    };

    fetchJob();
  }, [_id, isAuthenticated, user]);

  // Fetch saved jobs on component mount
  useEffect(() => {
    // Fetch saved jobs if the user is a job seeker
    if (isJobSeeker()) {
      const fetchSavedJobs = async () => {
        try {
          const response = await axios.get(`/api/profile/savedjobs`);
          setSavedJobs(response.data.savedJobs); // Update saved jobs state
        } catch (err) {
          // Log any errors
          console.error(err);
        }
      };
      fetchSavedJobs(); // Call the fetchSavedJobs function
    }
  }, []);

  if (loading) return <Spinner />; // Show loading spinner while data is being fetched
  if (!job)
    // If job data isn't found
    return (
      <div>
        <h1 className="lrg-heading">Job Not Found</h1>{" "}
        {/* Display not found message */}
      </div>
    );

  // Calculate how many days ago the job was posted
  const daysAgo = Math.floor(
    (new Date() - new Date(job.datePosted)) / (1000 * 60 * 60 * 24)
  );

  // Handle user logout
  const handleLogout = () => {
    logout(); // Call logout function
    navigate("/"); // Redirect to home page
  };

  const openConfirmationModal = () => {
    setConfirmationModalIsOpen(true); // Open the confirmation modal
  };

  const closeConfirmationModal = () => setConfirmationModalIsOpen(false); // Close the modal

  // Handle answer change
  const handleAnswerChange = (question, answer) => {
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [question]: answer,
    }));
  };

  // Modify the handleApply function to include answers
  const handleApply = async () => {
    const unansweredQuestions = questions.filter(
      (question) => !answers[question]
    );

    if (unansweredQuestions.length > 0) {
      // Set error message for unanswered questions
      setErrors([{ msg: "Please answer all questions before applying." }]);
      return; // Exit the function to prevent further execution
    }
    try {
      setLoading(true); // Set loading state to true
      // Prepare the questions and answers for submission
      const questionsAndAnswers = questions.map((question) => ({
        question,
        userAnswer: answers[question] || "", // Default to empty if no answer provided
      }));

      // Send application request with answers
      await axios.post(`http://localhost:5050/api/application/`, {
        jobId: _id,
        userId: user._id,
        questions: questionsAndAnswers, // Include questions and answers
      });

      // Reset errors
      setErrors([]);

      setHasApplied(true); // Update applied status
      navigate("/dashboard"); // Redirect to dashboard
      setLoading(false); // Set loading state to false
    } catch (err) {
      closeConfirmationModal(); // Close modal on error
    }
  };

  const isJobSaved = () => {
    return savedJobs.includes(job._id); // Check if job is saved
  };

  const handleSaveJob = async (job) => {
    try {
      let updatedSavedJobs = []; // Initialize updated saved jobs array
      if (savedJobs.includes(job._id)) {
        // Remove job from saved jobs if already saved
        updatedSavedJobs = savedJobs.filter((savedJob) => savedJob !== job._id);
      } else {
        // Add job to saved jobs if not already saved
        updatedSavedJobs = [...savedJobs, job._id];
      }
      setSavedJobs(updatedSavedJobs); // Update saved jobs state
      await axios.put(
        `http://localhost:5050/api/profile/updatesavedjobs`,
        { savedJobs: updatedSavedJobs }, // Ensure the payload is correctly formatted
        { withCredentials: true } // Ensure credentials (cookies) are included in request
      );
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
            <p
              className="company-info hover"
              onClick={() => navigate(`/viewcompany/${job.employer}`)}
            >
              {job.company}
            </p>
            {/* Check if user is authenticated and is a job seeker before showing the save button */}
            {isAuthenticated && isJobSeeker() ? (
              isJobSaved(job._id) ? (
                <button
                  className="btn btn-delete"
                  onClick={() => handleSaveJob(job)}
                >
                  Unsave Job
                </button>
              ) : (
                <button className="btn" onClick={() => handleSaveJob(job)}>
                  Save Job
                </button>
              )
            ) : null}{" "}
            {/* Don't show anything if not logged in or not a job seeker */}
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
              isJobSeeker() &&
              (hasProfile ? (
                job.status === "Open" && !hasApplied ? (
                  <div className="apply-button-container">
                    <button
                      className="btn"
                      onClick={() => openConfirmationModal(true)}
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
                <p className="profile-notification">
                  You need to complete your profile before applying.
                </p>
              ))
            ) : (
              // Show "Login to Apply" button if the user isn't authenticated
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
      <JobQnA job={job} setErrors={setErrors} setJob={setJob} />
      {/* display errors */}
      {errors.length > 0 && (
        <div className="error-messages">
          {errors.map((error, index) => (
            <p key={index}>{error.msg}</p>
          ))}
        </div>
      )}
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
          {questions.map((question, index) => (
            <div key={index}>
              <label>{question}</label>
              <input
                required
                type="text"
                value={answers[question] || ""}
                onChange={(e) => handleAnswerChange(question, e.target.value)}
              />
            </div>
          ))}
          {/* Display errors */}
          {errors.length > 0 && (
            <div className="error-messages">
              {errors.map((error, index) => (
                <p key={index}>{error.msg}</p>
              ))}
            </div>
          )}
          <div className="btn-container">
            <button onClick={handleApply} className="btn-confirm">
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
