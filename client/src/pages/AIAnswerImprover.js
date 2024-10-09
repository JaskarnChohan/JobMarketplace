import React, { useState } from "react";
import Navbar from "../components/layout/Navbar";
import axios from "axios";
import { useNavigate, Link, redirect } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/Global.css";
import "../styles/profile/ProfileInfo.css";
import Modal from "react-modal";
import Spinner from "../components/Spinner/Spinner";

const AIAnswerImprover = () => {
  const { logout, user } = useAuth(); // Get logout function and user info from context
  const navigate = useNavigate();
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [aiResponse, setAiResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle user logout
  const handleLogout = () => {
    logout(); // Call logout from context
    navigate("/"); // Redirect to home page
  };

  // Validate the input for a question and answer
  const validateInput = () => {
    if (!question || !answer) {
      setError("Please provide both a question and an answer.");
      return false;
    }
    if (question.length < 5 || answer.length < 10) {
      setError("Your question or answer is too short.");
      return false;
    }
    return true;
  };

  // Call AI service to improve the question and answer
  const handleImprove = async () => {
    if (!validateInput()) return;

    setLoading(true);
    setError("");
    try {
      // Set the Authorization header with the token
      const res = await axios.post(
        "http://localhost:5050/api/ai/improve",
        { question, answer },
        { withCredentials: true } // Add this as a config object
      );

      const improvedText = res.data.improvedText;

      setAiResponse(improvedText);
    } catch (err) {
      console.error("Error improving response:", err);
      setError("There was an error improving your response. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-height">
      <Navbar isAuthenticated={true} handleLogout={handleLogout} />
      <div className="ai-improver-section dashboard">
        <br />
        <div className="dashboard-banner">
          <h2 className="lrg-heading">AI Interview Answer Improver</h2>
          <p className="med-heading">
            Enter a question and answer, and AI will help improve your answer!
          </p>
          <div className="ai-inputs">
            <div className="input-field">
              <label>Question:</label>
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Enter your question"
              />
            </div>
            <div className="input-field">
              <label>Answer:</label>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Enter your answer"
              />
            </div>
          </div>
          {error && <p className="error-messages">{error}</p>}
          <button className="btn" onClick={handleImprove}>
            Improve with AI
          </button>
        </div>
        {loading && <Spinner />}
        {aiResponse && (
          <div className="ai-response">
            <div
              className="improved-text"
              dangerouslySetInnerHTML={{ __html: aiResponse }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAnswerImprover;
