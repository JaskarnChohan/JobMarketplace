import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/layout/Navbar";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Modal from "react-modal";
import "../styles/Global.css";
import {
  FaBuilding,
  FaMapMarkerAlt,
  FaClock,
  FaTag,
  FaDollarSign,
} from "react-icons/fa";

const Dashboard = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [userJobs, setUserJobs] = useState([]);
  const [jobApplicationsMap, setJobApplicationsMap] = useState({});
  const [userProfilesMap, setUserProfilesMap] = useState({});
  const [groupedApplications, setGroupedApplications] = useState({});
  const [errors, setErrors] = useState([]);
  const [currentApplication, setCurrentApplication] = useState(null);
  const [confirmationModalIsOpen, setConfirmationModalIsOpen] = useState(false);

  useEffect(() => {
    if (user) {
      if (user.role === "employer") {
        fetchUserJobs();
      } else if (user.role === "jobSeeker") {
        fetchUserApplications();
      }
    }
  }, [user]);

  const fetchUserJobs = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5050/api/jobs/getbyemployer/${user._id}`
      );
      const openJobs = res.data.jobs.filter((job) => job.status === "Open");
      setUserJobs(openJobs);
      await fetchApplicationsForJobs(openJobs);
    } catch (err) {
      setErrors([
        { msg: "An error occurred while fetching your jobs: " + err.message },
      ]);
    }
  };

  const fetchUserApplications = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5050/api/application/${user._id}`
      );
      const applications = res.data.applications;

      const grouped = applications.reduce((acc, application) => {
        const status = application.status || "Unknown";
        if (!acc[status]) acc[status] = [];
        acc[status].push(application);
        return acc;
      }, {});

      setGroupedApplications(grouped);
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

  const fetchApplicationsForJobs = async (jobs) => {
    const newJobApplicationsMap = {};
    const newUserProfilesMap = {};

    await Promise.all(
      jobs.map(async (job) => {
        const res = await axios.get(
          `http://localhost:5050/api/application/job/${job._id}`
        );
        newJobApplicationsMap[job._id] = res.data; // Store applications by job ID

        // Fetch user profiles for each application
        await Promise.all(
          res.data.map(async (app) => {
            if (!newUserProfilesMap[app.userId]) {
              const profileRes = await axios.get(
                `http://localhost:5050/api/profile/user/${app.userId._id}`
              );
              newUserProfilesMap[app.userId] = profileRes.data; // Store the profile
            }
            app.userProfile = newUserProfilesMap[app.userId]; // Associate profile with application
          })
        );
      })
    );

    setJobApplicationsMap(newJobApplicationsMap);
    setUserProfilesMap(newUserProfilesMap);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const openConfirmationModal = (application) => {
    setCurrentApplication(application);
    setConfirmationModalIsOpen(true);
  };

  const closeConfirmationModal = () => {
    setConfirmationModalIsOpen(false);
    setCurrentApplication(null);
  };

  const handleDeleteApplication = async () => {
    try {
      await axios.delete(
        `http://localhost:5050/api/application/${currentApplication._id}`
      );
      closeConfirmationModal();
      if (user.role === "employer") {
        fetchUserJobs(); // Refresh applications after status update
      } else {
        fetchUserApplications(); // Refresh applications after status update
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

  const handleStatusChange = async (appId, newStatus) => {
    try {
      await axios.put(`http://localhost:5050/api/application/${appId}`, {
        status: newStatus,
      });
      if (user.role === "employer") {
        fetchUserJobs(); // Refresh applications after status update
      } else {
        fetchUserApplications(); // Refresh applications after status update
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

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Navbar isAuthenticated={true} handleLogout={handleLogout} />
      <div className="content">
        <h2>Welcome to your dashboard!</h2>
        <h3>Your Details:</h3>
        <p>Email: {user.email}</p>
        <p>Role: {user.role}</p>
        <p>
          Account Created At: {new Date(user.createdAt).toLocaleDateString()}
        </p>
        <br />

        {user.role === "employer" ? (
          <>
            <h3>Your Open Job Listings</h3>
            {userJobs.length > 0 ? (
              <div className="user-jobs-list">
                {userJobs.map((job) => (
                  <div key={job._id} className="job-card">
                    <h4 onClick={() => navigate(`/jobview/${job._id}`)}>
                      {job.title}
                    </h4>
                    <p>Status: {job.status}</p>
                    <h5>Applicants:</h5>
                    {jobApplicationsMap[job._id] &&
                    jobApplicationsMap[job._id].length > 0 ? (
                      jobApplicationsMap[job._id].map((app) => (
                        <div key={app._id}>
                          <p>
                            {app.userProfile
                              ? `${app.userProfile.firstName} ${app.userProfile.lastName}`
                              : "Unknown User"}{" "}
                            -
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
                              className="btn"
                              onClick={() => openConfirmationModal(app)}
                            >
                              Delete Application
                            </button>
                          </p>
                        </div>
                      ))
                    ) : (
                      <p>No applicants yet.</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p>You have no job listings yet.</p>
            )}
          </>
        ) : user.role === "jobSeeker" ? (
          <>
            <h3>Your Applications</h3>
            {Object.keys(groupedApplications).map((status) => (
              <div key={status}>
                <h4>{status}</h4>
                {groupedApplications[status].length > 0 ? (
                  <div className="applied-jobs-list">
                    {groupedApplications[status].map((application) => (
                      <div key={application._id} className="job-card">
                        <h4
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
                          className="btn"
                          onClick={() => openConfirmationModal(application)}
                        >
                          Delete Application
                        </button>

                        {/* Show Job Details Below Application */}
                        {jobApplicationsMap[application.jobId._id] && (
                          <div className="job-details">
                            <h1>
                              {jobApplicationsMap[application.jobId._id].title}
                            </h1>
                            <p>
                              {
                                jobApplicationsMap[application.jobId._id]
                                  .description
                              }
                            </p>
                            <p className="job-info">
                              <FaBuilding />{" "}
                              {
                                jobApplicationsMap[application.jobId._id]
                                  .jobCategory
                              }
                            </p>
                            <p className="job-info">
                              <FaMapMarkerAlt />{" "}
                              {
                                jobApplicationsMap[application.jobId._id]
                                  .location
                              }
                            </p>
                            <p className="job-info">
                              <FaClock />{" "}
                              {
                                jobApplicationsMap[application.jobId._id]
                                  .employmentType
                              }
                            </p>
                            <p className="job-info">
                              <FaDollarSign />{" "}
                              {
                                jobApplicationsMap[application.jobId._id]
                                  .salaryRange
                              }
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No applications for {status}.</p>
                )}
              </div>
            ))}
          </>
        ) : (
          <p>You are not authorized to view this section.</p>
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
