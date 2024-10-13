import React, { useState } from "react";
import Navbar from "../components/layout/Navbar";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/Global.css";
import "../styles/profile/ProfileInfo.css";
import Spinner from "../components/Spinner/Spinner";

const JobInsights = () => {
  const { logout, user } = useAuth(); // Get logout function and user info from context
  const navigate = useNavigate();
  const [jobTitle, setJobTitle] = useState("");
  const [location, setLocation] = useState("");
  const [aiResponse, setAiResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle user logout
  const handleLogout = () => {
    logout(); // Call logout from context
    navigate("/"); // Redirect to home page
  };

  // Validate the input for job title and location
  const validateInput = () => {
    if (!jobTitle || !location) {
      setError("Please provide both a job title and a location.");
      return false;
    }
    if (jobTitle.length < 3 || location.length < 3) {
      setError("Your job title or location is too short.");
      return false;
    }
    return true;
  };

  // Call AI service to get job insights based on the job title and location
  const handleGetInsights = async () => {
    if (!validateInput()) return;

    setLoading(true);
    setError("");
    try {
      const res = await axios.post(
        "http://localhost:5050/api/ai/job-insights",
        { jobTitle, location }
      );

      // Check if the response has insights
      const jobInsights = res.data.insights;

      if (jobInsights) {
        setAiResponse(jobInsights);
      } else {
        throw new Error("No job insights received.");
      }
    } catch (err) {
      console.error("Error fetching job insights:", err);
      setError("There was an error fetching job insights. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-height">
      <Navbar isAuthenticated={true} handleLogout={handleLogout} />
      <div className="ai-improver-section  dashboard">
        <br />
        <div className="dashboard-banner">
          <h2 className="lrg-heading">AI Job Insights</h2>
          <p className="med-heading">
            Enter a job title and location, and AI will provide insights about
            the job to assist you in creating a job listing!
          </p>
          <div className="ai-inputs job-insights">
            <div className="input-field">
              <label>Job Title:</label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="Enter the job title"
              />
            </div>
            <div className="input-field">
              <label>Location:</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter the location"
              />
            </div>
          </div>
          {error && <p className="error-messages">{error}</p>}
          <button className="btn" onClick={handleGetInsights}>
            Get Job Insights with AI
          </button>
        </div>
        {loading && <Spinner />}
        {aiResponse && (
          <div className="ai-response">
            <div
              className="insights-text"
              dangerouslySetInnerHTML={{ __html: aiResponse }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default JobInsights;
