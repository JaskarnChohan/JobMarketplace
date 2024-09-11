import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../../components/header/Navbar';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../../global.css';

const JobListings = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();
  const [jobListings, setJobListings] = useState([]);
  const [errors, setErrors] = useState([]);

  // Fetch job listings
  useEffect(() => {
    async function fetchJobListings() {
      try {
        const res = await axios.get('http://localhost:5050/api/jobs'); // Assuming you have a backend endpoint
        setJobListings(res.data);
      } catch (err) {
        setErrors([{ msg: 'An error occurred while fetching job listings: ' + err.message }]);
      }
    }

    fetchJobListings();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Function to apply to a job
  const applyToJob = async (jobId) => {
    try {
      const res = await axios.post('http://localhost:5050/api/apply', {
        userId: user._id, // Pass the user ID
        jobId, // Pass the job ID
      });
      alert('Applied to job successfully');
    } catch (err) {
      setErrors([{ msg: 'An error occurred while applying: ' + err.message }]);
    }
  };

  return (
    <div>
      <Navbar isAuthenticated={isAuthenticated} handleLogout={handleLogout} />
      <div className="content">
        <h1 className="lrg-heading">Job Listings</h1>
        <div className="form-container-wide">
          {jobListings.map((job, index) => (
            <div key={index} className="job-listing">
              <h4>{job.title}</h4>
              <p>{job.description}</p>
              <p>{job.company}</p>
              <button className="btn" onClick={() => applyToJob(job._id)}>
                Apply
              </button>
            </div>
          ))}
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
