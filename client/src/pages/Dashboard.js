import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/layout/Navbar";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Modal from "react-modal";
import "../styles/Global.css";
import "../styles/job/Job.css";
import "../styles/job/JobCards.css";
import { FaTag } from "react-icons/fa";
import Spinner from "../components/Spinner/Spinner";

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

  // Show spinner while loading user data
  if (!user) {
    return <Spinner />;
  }

  return (
    <div className="min-height">
      <Navbar isAuthenticated={true} handleLogout={handleLogout} />
      <div className="section dashboard">
        <h2 className="lrg-heading">Application Dashboard</h2>
        <p className="med-heading">Manage all your applications here!</p>
        <br />

        {user.role === "employer" ? (
          <>
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
          </>
        ) : user.role === "jobSeeker" ? (
          <>
            <h3 className="page-title">Your Applications</h3>
            {Object.keys(groupedApplications).map((status) => (
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
                          {new Date(application.appliedAt).toLocaleDateString()}
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
                  <p className="sub-headings">No applications for {status}.</p>
                )}
              </div>
            ))}
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
              <button
                className="btn btn-delete"
                onClick={handleDeleteApplication}
              >
                Confirm
              </button>
              <button
                className="btn btn-cancel"
                onClick={closeConfirmationModal}
              >
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
