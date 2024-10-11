import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/layout/Navbar";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link, redirect } from "react-router-dom";
import Modal from "react-modal";
import "../styles/Global.css";
import "../styles/job/Job.css";
import "../styles/job/JobCards.css";
import { FaTag } from "react-icons/fa";
import Spinner from "../components/Spinner/Spinner";
import AIAnswerImprover from "./AIAnswerImprover";

const Dashboard = () => {
  const { logout, user } = useAuth(); // Get logout function and user info from context
  const navigate = useNavigate();
  const [userJobs, setUserJobs] = useState([]); // State to hold user's jobs
  const [jobApplicationsMap, setJobApplicationsMap] = useState({}); // Map to track job applications
  const [userProfilesMap, setUserProfilesMap] = useState({}); // Map to track user profiles
  const [groupedApplications, setGroupedApplications] = useState({}); // Group applications by status
  const [errors, setErrors] = useState([]); // State to hold error messages
  const [currentApplication, setCurrentApplication] = useState(null); // Current application for deletion
  const [confirmationModalIsOpen, setConfirmationModalIsOpen] = useState(false); // Modal visibility state
  // George Haeberlin: Added savedJobIds and savedJobs states
  const [savedJobIds, setSavedJobIds] = useState([]); // State to hold saved job ids
  const [savedJobs, setSavedJobs] = useState([]); // State to hold saved jobs

  // Fetch user jobs or applications based on user role
  useEffect(() => {
    if (user) {
      if (user.role === "employer") {
        fetchUserJobs(); // Employers fetch their jobs
      } else if (user.role === "jobSeeker") {
        fetchUserApplications(); // Job seekers fetch their applications
      }
    }
  }, [user]);

  // Fetch jobs for the logged-in employer
  const fetchUserJobs = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5050/api/jobs/getbyemployer/${user._id}`
      );
      const openJobs = res.data.jobs.filter((job) => job.status === "Open");
      setUserJobs(openJobs); // Set state with open jobs
      await fetchApplicationsForJobs(openJobs); // Fetch applications for these jobs
    } catch (err) {
      setErrors([
        { msg: "An error occurred while fetching your jobs: " + err.message },
      ]);
    }
  };

  // Fetch job applications for the logged-in job seeker
  const fetchUserApplications = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5050/api/application/${user._id}`
      );
      const applications = res.data.applications;

      // Group applications by their status
      const grouped = applications.reduce((acc, application) => {
        const status = application.status || "Unknown";
        if (!acc[status]) acc[status] = [];
        acc[status].push(application);
        return acc;
      }, {});

      setGroupedApplications(grouped); // Set state with grouped applications
    } catch (err) {
      setErrors([
        {
          msg:
            "An error occurred while fetching your applications: " +
            err.message,
        },
      ]);
    }
  };

  // Fetch applications for the given jobs
  const fetchApplicationsForJobs = async (jobs) => {
    const newJobApplicationsMap = {};
    const newUserProfilesMap = {};

    await Promise.all(
      jobs.map(async (job) => {
        const res = await axios.get(
          `http://localhost:5050/api/application/job/${job._id}`
        );
        newJobApplicationsMap[job._id] = res.data; // Map applications by job ID

        // Fetch user profiles for each application
        await Promise.all(
          res.data.map(async (app) => {
            if (!newUserProfilesMap[app.userId]) {
              const profileRes = await axios.get(
                `http://localhost:5050/api/profile/user/${app.userId._id}`
              );
              newUserProfilesMap[app.userId] = profileRes.data; // Map user profile
            }
            app.userProfile = newUserProfilesMap[app.userId]; // Associate profile with application
          })
        );
      })
    );

    setJobApplicationsMap(newJobApplicationsMap); // Update job applications map
    setUserProfilesMap(newUserProfilesMap); // Update user profiles map
  };

  // Handle user logout
  const handleLogout = () => {
    logout(); // Call logout from context
    navigate("/"); // Redirect to home page
  };

  // Open confirmation modal for deleting an application
  const openConfirmationModal = (application) => {
    setCurrentApplication(application); // Set current application
    setConfirmationModalIsOpen(true); // Open modal
  };

  // Close confirmation modal
  const closeConfirmationModal = () => {
    setConfirmationModalIsOpen(false); // Close modal
    setCurrentApplication(null); // Clear current application
  };

  // George Haeberlin: Get saved jobs functionality
  // get saved job IDs
  const getSavedJobIds = async () => {
    try {
      // Send request to fetch saved jobs
      const response = await axios.get(`/api/profile/getSavedJobs`);
      setSavedJobIds(response.data.savedJobs); // Update saved jobs state
    } catch (err) {
      console.error(err);
    }
  };

  // George Haeberlin: Fetch saved jobs functionality
  // fetch saved jobs
  const fetchSavedJobs = async () => {
    try {
      const jobPromises = savedJobIds.map((jobId) =>
        axios.get(`/api/jobs/${jobId}`)
      );
      const jobResponses = await Promise.all(jobPromises);
      const jobs = jobResponses.map((res) => res.data);
      setSavedJobs(jobs); // Update saved jobs state
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const fetchSavedJobsData = async () => {
      await getSavedJobIds(); // Fetch saved job IDs
    };
    fetchSavedJobsData();
  }, []);

  useEffect(() => {
    if (savedJobIds.length > 0) {
      fetchSavedJobs(); // Fetch saved jobs
    }
  }, [savedJobIds]);

  // Handle application deletion
  const handleDeleteApplication = async () => {
    try {
      await axios.delete(
        `http://localhost:5050/api/application/${currentApplication._id}`
      );
      closeConfirmationModal(); // Close modal after deletion
      // Refresh jobs or applications based on user role
      if (user.role === "employer") {
        fetchUserJobs();
      } else {
        fetchUserApplications();
      }
    } catch (err) {
      setErrors([
        {
          msg:
            "An error occurred while deleting the application: " + err.message,
        },
      ]);
    }
  };

  // Handle status change for an application
  const handleStatusChange = async (appId, newStatus) => {
    try {
      await axios.put(`http://localhost:5050/api/application/${appId}`, {
        status: newStatus,
      });
      // Refresh jobs or applications based on user role
      if (user.role === "employer") {
        fetchUserJobs();
      } else {
        fetchUserApplications();
      }
    } catch (err) {
      setErrors([
        {
          msg:
            "An error occurred while updating the application status: " +
            err.message,
        },
      ]);
    }
  };

  // George Haeberlin: Handle quick apply for job
  // Handle quick apply for job
  const handleQuickApply = async (jobId) => {
    try {
      await axios.post(`http://localhost:5050/api/application`, {
        userId: user._id,
        jobId: jobId,
      });
      fetchUserApplications(); // Refresh applications after applying
      navigate("/dashboard"); // Redirect to dashboard after applying
    } catch (err) {
      setErrors([
        {
          msg: "An error occurred while applying for the job: " + err.message,
        },
      ]);
    }
  };

  // George Haeberlin: Handle unsave job
  // Handle unsave job
  const handleUnsaveJob = async (jobId) => {
    try {
      const updatedSavedJobIds = savedJobIds.filter((id) => id !== jobId);
      setSavedJobIds(updatedSavedJobIds); // Update saved job IDs
      await axios.put(
        `http://localhost:5050/api/profile/updateSavedJobs`,
        { savedJobs: updatedSavedJobIds },
        { withCredentials: true }
      );
      redirect("/dashboard"); // Redirect to dashboard after unsaving
    } catch (err) {
      setErrors([
        {
          msg: "An error occurred while unsaving the job: " + err.message,
        },
      ]);
    }
  };

  // Show spinner while loading user data
  if (!user) {
    return <Spinner />;
  }

  // Filter out saved jobs with status "Draft"
  const filteredSavedJobs = savedJobs.filter((job) => job.status !== "Draft");

  return (
    <div className="min-height">
      <Navbar isAuthenticated={true} handleLogout={handleLogout} />
      <div className="dashboard">
        <br />

        {user.role === "employer" ? (
          <>
            <div className="dashboard-banner">
              <h2 className="lrg-heading">Application Dashboard</h2>
              <p className="med-heading">Manage all your applications here!</p>
              <div className="help-guide">
                <h2>Employer Help Guide</h2>
                <div className="help-links">
                  <Link to="/createjob">
                    <button className="btn help-button">Post a New Job</button>
                  </Link>
                  <Link to="/jobmanagement">
                    <button className="btn help-button">Manage Jobs</button>
                  </Link>
                  <Link to="/messages">
                    <button className="btn help-button">Messages</button>
                  </Link>
                  <Link to="/browse-employers">
                    <button className="btn help-button">
                      Browse Job Seekers
                    </button>
                  </Link>
                </div>
              </div>
            </div>
            <div>
              <h3 className="dashboard-title">Open Job Listings</h3>
              {userJobs.length > 0 ? (
                <div className="user-jobs-list">
                  {userJobs.map((job) => (
                    <div key={job._id} className="job-card">
                      <h3
                        className="job-title hover"
                        onClick={() => navigate(`/jobview/${job._id}`)}
                      >
                        {job.title}
                      </h3>
                      <h4>Applicants:</h4>
                      <div className="applicants-grid">
                        {jobApplicationsMap[job._id] &&
                        jobApplicationsMap[job._id].length > 0 ? (
                          jobApplicationsMap[job._id].map((app) => (
                            <div className="applicant" key={app._id}>
                              <p>
                                <p
                                  className="user-name hover"
                                  onClick={() =>
                                    navigate(`/viewprofile/${app.userId._id}`)
                                  }
                                >
                                  {app.userProfile
                                    ? `${app.userProfile.firstName} ${app.userProfile.lastName}`
                                    : "Unknown User"}{" "}
                                </p>
                                <select
                                  value={app.status}
                                  onChange={(e) =>
                                    handleStatusChange(app._id, e.target.value)
                                  }
                                >
                                  <option value="Pending">Pending</option>
                                  <option value="Reviewed">Reviewed</option>
                                  <option value="Accepted">Accepted</option>
                                  <option value="Rejected">Rejected</option>
                                </select>
                                <button
                                  className="small-btn"
                                  onClick={() => openConfirmationModal(app)}
                                >
                                  Delete Application
                                </button>
                              </p>
                              <div className="application-details">
                                {/* Only show applicant answers if there are any questions */}
                                {app.questions && app.questions.length > 0 && (
                                  <>
                                    <h4 className="application-heading">
                                      Applicant Answers:
                                    </h4>
                                    {app.questions.map((question, index) => (
                                      <div
                                        key={index}
                                        className="question-detail"
                                      >
                                        <p>
                                          <strong>Question:</strong>{" "}
                                          {question.question}
                                        </p>
                                        <p>
                                          <strong>Answer:</strong>{" "}
                                          {question.userAnswer}
                                        </p>
                                        <br />
                                      </div>
                                    ))}
                                  </>
                                )}
                                {/* Display AI Evaluation results at the application level */}
                                {app.aiEvaluation && (
                                  <div className="ai-evaluation">
                                    <h4 className="application-heading">
                                      AI Evaluation:
                                    </h4>
                                    <p>
                                      <strong>Score:</strong>{" "}
                                      {app.aiEvaluation.score}
                                    </p>
                                    <p>
                                      <strong>Evaluation:</strong>{" "}
                                      {app.aiEvaluation.evaluation}
                                    </p>
                                    <p>
                                      <strong>Recommended Outcome:</strong>{" "}
                                      {app.aiEvaluation.recommendedOutcome}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="sub-headings">No applicants yet.</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="sub-headings">You have no job listings yet.</p>
              )}
            </div>
          </>
        ) : user.role === "jobSeeker" ? (
          <>
            <div className="dashboard-banner">
              <h2 className="lrg-heading">Dashboard</h2>
              <p className="med-heading">Manage your Applications!</p>
              <div className="help-guide">
                <h2>Improve Yourself</h2>
                <div className="help-links">
                  <Link to="/enchanceanswers">
                    <button className="btn help-button">
                      Enhance Interview Answers
                    </button>
                  </Link>
                </div>
              </div>
              <div className="help-guide">
                <h2>Help Guide</h2>
                <div className="help-links">
                  <Link to="/joblistings">
                    <button className="btn help-button">
                      View Job Listings
                    </button>
                  </Link>
                  <Link to="/profile">
                    <button className="btn help-button">
                      Manage Your Profile
                    </button>
                  </Link>
                  <Link to="/messages">
                    <button className="btn help-button">Messages</button>
                  </Link>
                  <Link to="/browse-employers">
                    <button className="btn help-button">
                      Browse Employers
                    </button>
                  </Link>
                </div>
              </div>
            </div>
            <div>
              <h3 className="page-title">Your Applications</h3>

              {/* Check if there are any grouped applications */}
              {Object.keys(groupedApplications).length > 0 ? (
                Object.keys(groupedApplications).map((status) => (
                  <div key={status}>
                    <h4 className="sub-headings">{status}</h4>
                    {groupedApplications[status].length > 0 ? (
                      <div className="applicants-grid">
                        {groupedApplications[status].map((application) => (
                          <div key={application._id} className="applicant">
                            <h4
                              className="job-title hover"
                              onClick={() =>
                                navigate(`/jobview/${application.jobId._id}`)
                              }
                            >
                              {application.jobId.title}
                            </h4>
                            <p className="job-info">
                              <FaTag /> {application.status}
                            </p>
                            <p className="job-info">
                              Applied At:{" "}
                              {new Date(
                                application.appliedAt
                              ).toLocaleDateString()}
                            </p>
                            <button
                              className="small-btn"
                              onClick={() => openConfirmationModal(application)}
                            >
                              Delete Application
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="sub-headings">
                        No applications for {status}.
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <p className="sub-headings">You have no applications yet.</p>
              )}
            </div>
            {/* Saved Jobs Section */}
            <div>
              <h3 className="page-title">Saved Jobs</h3>

              {/* Check if there are any saved jobs */}
              {filteredSavedJobs.length > 0 ? (
                <div className="applicants-grid">
                  {filteredSavedJobs.map((job) => (
                    <div key={job._id} className="applicant">
                      <h4
                        className="job-title hover"
                        onClick={() => navigate(`/jobview/${job._id}`)}
                      >
                        {job.title}
                      </h4>
                      <p className="job-info">
                        <FaTag /> {job.status}
                      </p>
                      <p className="job-info">
                        Posted At:{" "}
                        {new Date(job.createdAt).toLocaleDateString()}
                      </p>
                      <button
                        className="small-btn"
                        onClick={() => handleQuickApply(job._id)}
                      >
                        Quick Apply
                      </button>
                      <button
                        className="small-btn btn-delete"
                        onClick={() => handleUnsaveJob(job._id)}
                      >
                        Unsave Job
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="sub-headings">You have no saved jobs yet.</p>
              )}
            </div>
          </>
        ) : (
          <p className="sub-headings">
            You are not authorized to view this section.
          </p>
        )}

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
            <h1 className="lrg-heading">Confirm Deletion</h1>
            <p className="med-text">
              Are you sure you want to delete this application?
            </p>
            <div className="btn-container">
              <button className="btn-delete" onClick={handleDeleteApplication}>
                Confirm
              </button>
              <button className="btn-cancel" onClick={closeConfirmationModal}>
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default Dashboard;
