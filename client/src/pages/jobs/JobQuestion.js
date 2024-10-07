import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../styles/Global.css";
import "../../styles/job/Job.css";
import "react-datepicker/dist/react-datepicker.css";

const JobApplication = ({ jobId }) => {
  const { user } = useAuth(); // Get authenticated user details
  const navigate = useNavigate();
  const [job, setJob] = useState(null); // Store job details
  const [answers, setAnswers] = useState({}); // Store candidate answers
  const [questions, setQuestions] = useState([]); // Store pre-determined questions

  useEffect(() => {
    // Fetch job details including questions
    const fetchJobDetails = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5050/api/jobs/getjob/${jobId}`
        );
        setJob(res.data.job);
        setQuestions(res.data.job.questions); // Assuming questions are part of job data
      } catch (error) {
        console.error("Error fetching job details", error);
      }
    };
    fetchJobDetails();
  }, [jobId]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAnswers({
      ...answers,
      [name]: value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `http://localhost:5050/api/jobs/apply/${jobId}`,
        { userId: user._id, answers } // Send user answers along with their ID
      );
      navigate("/dashboard"); // Navigate to dashboard after applying
    } catch (error) {
      console.error("Error submitting application", error);
    }
  };

  return (
    <div className="job-application">
      {job ? (
        <div>
          <h1>Apply for {job.title}</h1>
          <form onSubmit={handleSubmit}>
            {questions.map((question, index) => (
              <div key={index} className="question-group">
                <label>{question}</label>
                <input
                  type="text"
                  name={`question-${index}`}
                  value={answers[`question-${index}`] || ""}
                  onChange={handleInputChange}
                  required
                />
              </div>
            ))}
            <button type="submit" className="btn">
              Submit Application
            </button>
          </form>
        </div>
      ) : (
        <p>Loading job details...</p>
      )}
    </div>
  );
};

export default JobApplication;
