import React, { useEffect, useState } from "react";
import Navbar from "../../components/header/Navbar";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../global.css";

const Dashboard = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    if (user) {
      if (user.role !== 'employer') {
        const fetchAppliedJobs = async () => {
          try {
            const res = await axios.get(`http://localhost:5050/api/applications/${user._id}`);
            setAppliedJobs(res.data);
          } catch (err) {
            setErrors([{ msg: 'An error occurred while fetching applied jobs: ' + err.message }]);
          }
        };

        fetchAppliedJobs();
      }
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Navbar isAuthenticated={true} handleLogout={handleLogout} />
      <div className="content">
        <h2>Welcome to your dashboard!</h2>
        <p>This is where you can manage your profile, job listings, and more.</p>
        <h3>Your Details:</h3>
        <p>Email: {user.email}</p>
        <p>Role: {user.role}</p>
        <p>Account Created At: {new Date(user.createdAt).toLocaleDateString()}</p>
        <br />
        {user.role !== 'employer' ? (
          <>
            <h3>Your Applied Applications</h3>
            {appliedJobs.length > 0 ? (
              <div className="applied-jobs-list">
                {appliedJobs.map((application) => (
                  <div key={application._id} className="applied-job">
                    <p>Job Title: {application.job.title}</p>
                    <p>Status: {application.status}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p>You have not applied to any jobs yet.</p>
            )}
          </>
        ) : (
          <p></p>
        )}
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

export default Dashboard;
