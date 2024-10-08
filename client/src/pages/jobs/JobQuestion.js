import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import "../../styles/Global.css";
import "../../styles/job/Job.css";

const JobQuestion = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Fetch the job details and questions
  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const res = await axios.get(`http://localhost:5050/api/jobs/getjob/${jobId}`);
        setJob(res.data.job);
        if (res.data.job.questions) {
          setQuestions(res.data.job.questions);
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching job details", err);
        setError("Failed to load job details. Please try again later.");
        setLoading(false);
      }
    };
    fetchJobDetails();
  }, [jobId]);

  // Handle input change for each question
  const handleInputChange = (index, event) => {
    const newQuestions = [...questions];
    newQuestions[index] = event.target.value;
    setQuestions(newQuestions);
  };

  // Add a new question input field
  const addQuestion = () => {
    setQuestions([...questions, ""]);
  };

  // Remove a question input field
  const removeQuestion = (index) => {
    const newQuestions = questions.filter((_, i) => i !== index);
    setQuestions(newQuestions);
  };

  // Handle form submission to save questions
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (questions.some(q => q.trim() === "")) {
      setError("Please fill out all questions before saving.");
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(`http://localhost:5050/api/jobs/addquestions/${jobId}`, {
        questions,
      });
      navigate("/dashboard");  // Redirect to dashboard after successful submission
    } catch (err) {
      console.error("Error saving questions", err);
      setError("An error occurred while saving questions. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="job-question">
      {loading ? (
        <p>Loading job details...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : job ? (
        <div>
          <h1>Add Questions for {job.title}</h1>
          {error && <p className="error">{error}</p>}
          <form onSubmit={handleSubmit}>
            {questions.map((question, index) => (
              <div key={index} className="question-group">
                <label>Question {index + 1}</label>
                <input
                  type="text"
                  value={question}
                  onChange={(e) => handleInputChange(index, e)}
                  required
                />
                <button
                  type="button"
                  onClick={() => removeQuestion(index)}
                  disabled={submitting}  // Disable while submitting
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addQuestion}
              disabled={submitting}  // Disable while submitting
            >
              Add Another Question
            </button>
            <button
              type="submit"
              className="btn"
              disabled={submitting}  // Disable while submitting
            >
              {submitting ? "Saving..." : "Save Questions"}
            </button>
          </form>
        </div>
      ) : (
        <p>Job not found or does not exist.</p>
      )}
    </div>
  );
};

export default JobQuestion;
