import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import "../../styles/Global.css";
import "../../styles/job/Job.css";

const JobQuestion = () => {
  const { jobId } = useParams(); 
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([""]); 
  const [job, setJob] = useState(null); 
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const res = await axios.get(`http://localhost:5050/api/jobs/getjob/${jobId}`);
        setJob(res.data.job);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching job details", error);
        setLoading(false);
      }
    };
    fetchJobDetails();
  }, [jobId]);

  const handleInputChange = (index, event) => {
    const newQuestions = [...questions];
    newQuestions[index] = event.target.value;
    setQuestions(newQuestions);
  };

  const addQuestion = () => {
    setQuestions([...questions, ""]); 
  };

  const removeQuestion = (index) => {
    const newQuestions = questions.filter((_, i) => i !== index); 
    setQuestions(newQuestions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`http://localhost:5050/api/jobs/addquestions/${jobId}`, {
        questions,
      });
      navigate("/dashboard"); 
    } catch (error) {
      console.error("Error saving questions", error);
    }
  };

  return (
    <div className="job-question">
      {loading ? (
        <p>Loading job details...</p>
      ) : job ? (
        <div>
          <h1>Add Questions for {job.title}</h1>
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
                <button type="button" onClick={() => removeQuestion(index)}>
                  Remove
                </button>
              </div>
            ))}
            <button type="button" onClick={addQuestion}>
              Add Another Question
            </button>
            <button type="submit" className="btn">
              Save Questions
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
