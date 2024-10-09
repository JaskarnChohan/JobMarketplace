import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import "../styles/Global.css";
import Modal from "react-modal";
import Spinner from "../components/Spinner/Spinner";

const AIQuestionImprover = () => {
  const { user } = useAuth(); // Get user info from context
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [aiResponse, setAiResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      <div className="ai-improver-section">
        <h2 className="lrg-heading">AI Question and Answer Improver</h2>
        <p className="med-heading">
          Enter a question and answer, and AI will help improve it!
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
        {error && <p className="error-message">{error}</p>}
        <button className="btn improve-btn" onClick={handleImprove}>
          Improve with AI
        </button>

        {loading && <Spinner />}
        {aiResponse && (
          <div className="ai-response">
            <h3>Improved Text:</h3>
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

export default AIQuestionImprover;
