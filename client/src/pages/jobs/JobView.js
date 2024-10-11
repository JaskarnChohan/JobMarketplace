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
import { FaArrowUp, FaArrowDown } from 'react-icons/fa'; // Import arrow icons

const JobView = () => {
  const { _id } = useParams(); // Extract the job ID from the URL
  const { isAuthenticated, logout, user, isJobSeeker } = useAuth(); // Grab authentication details from context
  const [hasProfile, setHasProfile] = useState(false); // State to track if user has a profile
  const [confirmationModalIsOpen, setConfirmationModalIsOpen] = useState(false); // State to manage modal visibility
  const navigate = useNavigate(); // Hook to navigate programmatically
  const [loading, setLoading] = useState(true); // State to manage loading status
  const [errors, setErrors] = useState([]); // State to hold error messages

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login"); // Redirect to login page if user is not authenticated
    }
  }, [isAuthenticated, navigate]);

  // Handle user logout
  const handleLogout = async () => {
    try {
      await logout(); // Call the logout function from the context
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  // State to hold job details
  const [job, setJob] = useState({
    _id: "",
    employer: "",
    title: "",
    description: "",
    company: "",
    location: "",
    jobCategory: "",
    requirements: [],
    benefits: [],
    QnA: [],
    salaryRange: "",
    employmentType: "",
    applicationDeadline: new Date(),
    status: "",
    datePosted: "",
  });

  const [savedJobs, setSavedJobs] = useState([]); // State to hold saved jobs
  const [hasApplied, setHasApplied] = useState(false); // Track if the user has applied
  const [newQuestion, setNewQuestion] = useState(""); // State to hold new question
  const [editingQuestionIndex, setEditingQuestionIndex] = useState(null); // State to hold the index of the question being edited
  const [editedQuestion, setEditedQuestion] = useState(""); // State to hold the edited question
  const [confirmationDialogIsOpen, setConfirmationDialogIsOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState(null);


  // Fetch job details on component mount
  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5050/api/jobs/${_id}`
        );
        setJob(response.data);

        if (isAuthenticated && user && user._id) {
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
          setHasApplied(applicationResponse.data.hasApplied);

          // Check if the user has a profile
          const profileResponse = await axios.get(
            `http://localhost:5050/api/profile/fetch/`,
            { withCredentials: true } // Ensure credentials (cookies) are included in request
          );

          // Update profile existence state based on response
          setHasProfile(profileResponse.data.profileExists);
        }

        setLoading(false);
      } catch (err) {
        setLoading(false);
        console.error(err);
      }
    };

    fetchJob();
  }, [_id, isAuthenticated, user]);

  // Fetch saved jobs on component mount
  useEffect(() => {
    if (isJobSeeker()) {
      const fetchSavedJobs = async () => {
        try {
          const response = await axios.get(`/api/profile/getSavedJobs`);
          setSavedJobs(response.data.savedJobs); // Update saved jobs state
        } catch (err) {
          console.error(err);
        }
      };

      fetchSavedJobs();
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

  // get saved jobs
  const getSavedJobs = async () => {
    try {
      // Send request to fetch saved jobs
      const response = await axios.get(`/api/profile/getSavedJobs`);
      setSavedJobs(response.data.savedJobs); // Update saved jobs state
    } catch (err) {
      console.error(err);
    }
  };

  const openConfirmationModal = () => {
    setConfirmationModalIsOpen(true); // Open the confirmation modal
  };

  const closeConfirmationModal = () => setConfirmationModalIsOpen(false); // Close the modal

  const handleApply = async () => {
    try {
      // Send application request
      if (user && user._id){
        await axios.post(`http://localhost:5050/api/application/`, {
          jobId: _id,
          userId: user._id,
        });
        setHasApplied(true); // Update applied status
        navigate("/dashboard"); // Redirect to dashboard
      }
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
        `http://localhost:5050/api/profile/updateSavedJobs`,
        { savedJobs: updatedSavedJobs }, // Ensure the payload is correctly formatted
        { withCredentials: true } // Ensure credentials (cookies) are included in request
      );
    } catch (err) {
      console.error(err);
    }
  };

  //George Haeberlin: get author name
  const getAuthorName = async (authorId) => {
    console.log("getAuthorName called with authorId:", authorId); // Debugging log
    if (authorId === job.employer) {
      return job.company;
    // } else if (authorId === user._id) {
    //   return user.name;
    } else {
      try {
        const response = await axios.get(
          `http://localhost:5050/api/profile/user/${authorId}`
        );
        console.log("API response:", response.data); // Debugging log
        let name = response.data.firstName + " " + response.data.lastName;
        return name;
      } catch (err) {
        console.error("Error fetching author name:", err); // Debugging log
        return "Unknown";
      }
    }
  };

  //George Haeberlin: handle new question submission
  const handleSubmitQuestion  = async (e) => {
    e.preventDefault();
    console.log("User._id:", user._id); // Debugging log
    try {
      if (!newQuestion) {
        setErrors([{ msg: "Question cannot be empty" }]); // Display error if question is empty
        return; // Do nothing if the question is empty
      }
      const authorName = await getAuthorName(user._id); // Get author name
      const updatedQnA = [
        ...job.QnA.map((qa) => ({
          author: qa.author,
          authorName: qa.authorName,
          questionInfo: qa.questionInfo,
          answer: qa.answer,
          _id: qa._id, // preserve the _id for existing questions
        })), 
        { 
          author: user._id, 
          authorName: authorName, 
          questionInfo: [{ question: newQuestion, datePosted: new Date(), votes: [] }], 
          answer: null 
        }, // Add new question
      ];
      const response = await axios.put(
        `http://localhost:5050/api/jobs/update/${job._id}`,
        { QnA: updatedQnA },
        { withCredentials: true }
      );
      setJob((prevJob) => ({ 
        ...prevJob, 
        QnA: response.data.QnA, // Ensure we update the state with the response data
      })); // Update job state
      setNewQuestion(""); // Clear new question inputs
    } catch (err) {
      console.error(err); // Log any errors
    }
  };

  const handleRemoveError = (index) => {
    setErrors((prevErrors) => prevErrors.filter((_, i) => i !== index));
  };

  //George Haeberlin: check if user has voted on a question
  const hasVoted = (votes, userId, voteType) => {
    if (votes.find((v) => v.voter === userId && v.vote === voteType)) {
      return true;
    } else {
      return false;
    }
  };

  //George Haeberlin: handle vote submission and removal
  const handleVote = async (qaId, vote) => {
    console.log("handleVote called with qaId:", qaId, "and vote:", vote); // Debugging log
    try {
      const updatedQnA = job.QnA.map((qa) => {
        if (qa._id === qaId) {
          if (qa.questionInfo[0].votes.find((v) => v.voter === user._id && v.vote === vote)) {
            // if the user has already voted, remove the vote
            qa.questionInfo[0].votes = qa.questionInfo[0].votes.filter((v) => v.voter !== user._id);
          } else if (qa.questionInfo[0].votes.find((v) => v.voter === user._id && v.vote !== vote)) {
            // remove vote if user has voted with a different vote
            qa.questionInfo[0].votes = qa.questionInfo[0].votes.filter((v) => v.voter !== user._id);
            // add new vote
            qa.questionInfo[0].votes.push({ voter: user._id, vote });
          } else {
            // if the user has not voted, add the vote
            qa.questionInfo[0].votes.push({ voter: user._id, vote });
          }
        }
        return qa;
      });
      const response = await axios.put(
        `http://localhost:5050/api/jobs/update/${job._id}`,
        { QnA: updatedQnA },
        { withCredentials: true }
      );
      setJob((prevJob) => ({ 
        ...prevJob, 
        QnA: response.data.QnA, // Ensure we update the state with the response data
      })); // Update job state
    } catch (err) {
      console.error(err); // Log any errors
    }
  };

  //George Haeberlin: handle editing a question
  const handleEditQuestion = (index) => {
    setEditingQuestionIndex(index);
    setEditedQuestion(job.QnA[index].questionInfo[0].question);
  };

  const handleDeleteQuestion = async (index) => {
    try {
      const updatedQnA = job.QnA.filter((_, i) => i !== index); // Remove the question at the specified index
      const response = await axios.put(
        `http://localhost:5050/api/jobs/update/${job._id}`,
        { QnA: updatedQnA },
        { withCredentials: true }
      );
      setJob((prevJob) => ({
        ...prevJob,
        QnA: response.data.QnA, // Ensure we update the state with the response data
      })); // Update job state
    } catch (err) {
      console.error(err); // Log any errors
      setErrors([{ msg: "Failed to delete question" }]); // Display error message
    }
  };

  //George Haeberlin: handle question update
  const handleSubmitEditedQuestion = async (index) => {
    try {
      const updatedQnA = job.QnA.map((qa, i) => {
        if (i === index) {
          qa.questionInfo[0].question = editedQuestion;
        }
        return qa;
      });
      const response = await axios.put(
        `http://localhost:5050/api/jobs/update/${job._id}`,
        { QnA: updatedQnA },
        { withCredentials: true }
      );
      setJob((prevJob) => ({
        ...prevJob,
        QnA: response.data.QnA, // Ensure we update the state with the response data
      })); // Update job state
      setEditingQuestionIndex(null); // Clear editing index
      setEditedQuestion(""); // Clear edited question
    } catch (err) {
      console.error(err); // Log any errors
      setErrors([{ msg: "Failed to update question" }]); // Display error message
    }
  };

  if (!user) {
    return null; // or some fallback UI
  }

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
              hasProfile ? (
                isJobSeeker() && job.status === "Open" && !hasApplied ? (
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
      {/* display errors */}
      {errors.length > 0 && (
        <div className="error-messages">
          {errors.map((error, index) => (
            <div key={index} className="error-message">
              <p>{error.msg}</p>
              <button onClick={() => handleRemoveError(index)} className="remove-error-btn">X</button>
            </div>
          ))}
        </div>
      )}
      {/* George Haeberlin: Add QnA section */}
      <div className="qa-section">
        <h3>Questions & Answers</h3>
        {isAuthenticated && (
          <form className="qa-form" onSubmit={handleSubmitQuestion}>
            <textarea
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="Ask a question..."
              className="qa-textarea"
            />
            <button className="btn qa-submit-btn" type="submit">
              Submit Question
            </button>
          </form>
        )}
        <ul className="qa-list">
          {job.QnA.sort((a, b) => {
            const aVotes = a.questionInfo[0]?.votes.reduce((acc, vote) => acc + vote.vote, 0) || 0;
            const bVotes = b.questionInfo[0]?.votes.reduce((acc, vote) => acc + vote.vote, 0) || 0;
            return bVotes - aVotes;
          }).map((qa, index) => (
            <li key={index} className="qa-item">
              <div className="qa-vote">
                <button
                  className={`btn btn-upvote ${hasVoted(qa.questionInfo[0]?.votes, user._id, 1) ? 'voted-up' : ''}`}
                  onClick={() => handleVote(qa._id, 1)}
                >
                  <FaArrowUp />
                </button>
                <p>{qa.questionInfo[0]?.votes.reduce((acc, vote) => acc + vote.vote, 0)}</p>
                <button
                  className={`btn btn-downvote ${hasVoted(qa.questionInfo[0]?.votes, user._id, -1) ? 'voted-down' : ''}`}
                  onClick={() => handleVote(qa._id, -1)}
                >
                  <FaArrowDown />
                </button>
              </div>
              <div className="qa-content">
              <div className="qa-question">
                <p><strong>Asked by:</strong> {qa.authorName}</p>
                  {editingQuestionIndex === index ? (
                    <>
                      <textarea
                        value={editedQuestion}
                        onChange={(e) => setEditedQuestion(e.target.value)}
                        className="qa-edit-textarea"
                      />
                      <button
                        className="btn qa-submit-edit-btn"
                        onClick={() => handleSubmitEditedQuestion(index)}
                      >
                        Save
                      </button>
                    </>
                  ) : (
                    <>
                      <p><strong>Question:</strong> {qa.questionInfo[0]?.question}</p>
                      <p className="posted-date"><strong>Posted on:</strong> {qa.questionInfo[0]?.datePosted ? new Date(qa.questionInfo[0].datePosted).toLocaleDateString() : "Invalid date"}</p>
                        <div className="btn-container">
                          {isAuthenticated && user && user._id === qa.author && (
                            <button onClick={() => handleEditQuestion(index)} className="edit-question-btn">Edit</button>
                          )}
                          {isAuthenticated && user && (user._id === qa.author || user._id === job.employer) && (
                            <button onClick={() => handleDeleteQuestion(index)} className="delete-question-btn">Delete</button>
                          )}
                        </div>
                    </>
                  )}
                </div>
                <div className="qa-answer">
                  <p><strong>Answer:</strong> {qa.answer || "No answer yet."}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
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
