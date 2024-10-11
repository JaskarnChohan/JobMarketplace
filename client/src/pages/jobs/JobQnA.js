import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { FaArrowUp, FaArrowDown } from "react-icons/fa"; // Ensure to import necessary icons
import Modal from "react-modal"; // Ensure you have Modal component imported
import "../../styles/job/JobView.css";

const JobQnA = ({ job, setErrors, setJob }) => {
  const { isAuthenticated, user, isJobSeeker } = useAuth(); // Grab authentication details from context
  const [confirmationDialogIsOpen, setConfirmationDialogIsOpen] =
    useState(false);
  const [questionToDelete, setQuestionToDelete] = useState(null);
  const [newQuestion, setNewQuestion] = useState("");
  const [editingQuestionIndex, setEditingQuestionIndex] = useState(null);
  const [editedQuestion, setEditedQuestion] = useState("");

  //George Haeberlin: check if user has voted on a question
  const hasVoted = (votes, userId, voteType) => {
    if (votes.find((v) => v.voter === userId && v.vote === voteType)) {
      return true;
    } else {
      return false;
    }
  };

  const handleDeleteQuestion = async (index) => {
    try {
      const updatedQnA = job.QnA.filter((_, i) => i !== index);
      const response = await axios.put(
        `http://localhost:5050/api/jobs/update/${job._id}`,
        { QnA: updatedQnA },
        { withCredentials: true }
      );
      setJob((prevJob) => ({
        ...prevJob,
        QnA: response.data.QnA,
      }));
    } catch (err) {
      console.error(err);
      setErrors([{ msg: "Failed to delete question" }]);
    }
  };

  const handleDeleteQuestionClick = (index) => {
    setQuestionToDelete(index);
    setConfirmationDialogIsOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (questionToDelete !== null) {
      await handleDeleteQuestion(questionToDelete);
      setQuestionToDelete(null);
      setConfirmationDialogIsOpen(false);
    }
  };

  const handleCancelDelete = () => {
    setQuestionToDelete(null);
    setConfirmationDialogIsOpen(false);
  };

  const getAuthorName = async (authorId) => {
    if (authorId === job.employer) {
      return job.company;
    } else {
      try {
        const response = await axios.get(
          `http://localhost:5050/api/profile/user/${authorId}`
        );
        return `${response.data.firstName} ${response.data.lastName}`;
      } catch (err) {
        console.error("Error fetching author name:", err);
        return "Unknown";
      }
    }
  };

  const handleSubmitQuestion = async (e) => {
    e.preventDefault();
    try {
      if (!newQuestion) {
        setErrors([{ msg: "Question cannot be empty" }]);
        return;
      }
      console.log("User: ", user);
      const authorName = await getAuthorName(user._id);
      const newQnA = {
        author: user._id,
        authorName,
        questionInfo: [
          { question: newQuestion, datePosted: new Date(), votes: [] },
        ],
        answer: null,
      };

      const updatedQnA = [...job.QnA, newQnA];

      await updateJobQnA(job._id, updatedQnA);
      setNewQuestion("");
    } catch (err) {
      console.error(err);
    }
  };

  const updateJobQnA = async (jobId, updatedQnA) => {
    try {
      const response = await axios.put(
        `http://localhost:5050/api/jobs/update/${jobId}`,
        { QnA: updatedQnA },
        { withCredentials: true }
      );
      setJob((prevJob) => ({
        ...prevJob,
        QnA: response.data.QnA,
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleVote = async (qaId, vote) => {
    try {
      const updatedQnA = job.QnA.map((qa) => {
        if (qa._id === qaId) {
          const hasVoted = qa.questionInfo[0].votes.find(
            (v) => v.voter === user._id
          );

          if (hasVoted) {
            if (hasVoted.vote === vote) {
              qa.questionInfo[0].votes = qa.questionInfo[0].votes.filter(
                (v) => v.voter !== user._id
              );
            } else {
              hasVoted.vote = vote; // Change vote to new value
            }
          } else {
            qa.questionInfo[0].votes.push({ voter: user._id, vote });
          }
        }
        return qa;
      });
      await updateJobQnA(job._id, updatedQnA);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditQuestion = (index) => {
    setEditingQuestionIndex(index);
    setEditedQuestion(job.QnA[index].questionInfo[0].question);
  };

  const handleSubmitEditedQuestion = async (index) => {
    try {
      const updatedQnA = job.QnA.map((qa, i) => {
        if (i === index) {
          qa.questionInfo[0].question = editedQuestion;
        }
        return qa;
      });
      await updateJobQnA(job._id, updatedQnA);
      setEditingQuestionIndex(null);
      setEditedQuestion("");
    } catch (err) {
      console.error(err);
      setErrors([{ msg: "Failed to update question" }]);
    }
  };

  return (
    <div className="qa-section">
      <h3>Questions & Answers</h3>
      {isAuthenticated && isJobSeeker() && (
        <form className="qa-form" onSubmit={handleSubmitQuestion}>
          <textarea
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            placeholder="Ask a question..."
            className="qa-textarea"
          />
          <button className="btn qa-submit-btn" type="submit">
            Submit Question
          </button>
        </form>
      )}
      <ul className="qa-list">
        {job.QnA.sort((a, b) => {
          const aVotes =
            a.questionInfo[0]?.votes.reduce(
              (acc, vote) => acc + vote.vote,
              0
            ) || 0;
          const bVotes =
            b.questionInfo[0]?.votes.reduce(
              (acc, vote) => acc + vote.vote,
              0
            ) || 0;
          return bVotes - aVotes;
        }).map((qa, index) => (
          <li key={index} className="qa-item">
            {isAuthenticated && (
              <div className="qa-vote">
                <button
                  className={`btn btn-upvote ${
                    hasVoted(qa.questionInfo[0]?.votes, user._id, 1)
                      ? "voted-up"
                      : ""
                  }`}
                  onClick={() => handleVote(qa._id, 1)}
                >
                  <FaArrowUp />
                </button>
                <p>
                  {qa.questionInfo[0]?.votes.reduce(
                    (acc, vote) => acc + vote.vote,
                    0
                  )}
                </p>
                <button
                  className={`btn btn-downvote ${
                    hasVoted(qa.questionInfo[0]?.votes, user._id, -1)
                      ? "voted-down"
                      : ""
                  }`}
                  onClick={() => handleVote(qa._id, -1)}
                >
                  <FaArrowDown />
                </button>
              </div>
            )}
            <div className="qa-content">
              <div className="qa-question">
                <p>
                  <strong>Asked by:</strong> {qa.authorName}
                </p>
                {editingQuestionIndex === index ? (
                  <>
                    <textarea
                      value={editedQuestion}
                      onChange={(e) => setEditedQuestion(e.target.value)}
                      className="qa-edit-textarea"
                    />
                    <button
                      className="btn qa-submit-edit-btn"
                      onClick={() => handleSubmitEditedQuestion(index)}
                    >
                      Save
                    </button>
                  </>
                ) : (
                  <>
                    <p>
                      <strong>Question:</strong> {qa.questionInfo[0]?.question}
                    </p>
                    <p className="posted-date">
                      <strong>Posted on:</strong>{" "}
                      {qa.questionInfo[0]?.datePosted
                        ? new Date(
                            qa.questionInfo[0].datePosted
                          ).toLocaleDateString()
                        : "Invalid date"}
                    </p>
                    <div className="btn-container">
                      {isAuthenticated && user && user._id === qa.author && (
                        <button
                          onClick={() => handleEditQuestion(index)}
                          className="edit-question-btn"
                        >
                          Edit
                        </button>
                      )}
                      {isAuthenticated &&
                        user &&
                        (user._id === qa.author ||
                          user._id === job.employer) && (
                          <button
                            onClick={() => handleDeleteQuestionClick(index)}
                            className="delete-question-btn"
                          >
                            Delete
                          </button>
                        )}
                    </div>
                  </>
                )}
              </div>
              {qa.answer && (
                <div className="qa-answer">
                  <p>
                    <strong>Answer:</strong> {qa.answer}
                  </p>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
      <Modal
        isOpen={confirmationDialogIsOpen}
        onRequestClose={handleCancelDelete}
        contentLabel="Confirm Delete"
        className="modal-wrapper"
      >
        <div className="modal">
          <h1 className="lrg-heading">Confirm Delete</h1>
          <p className="med-text">
            Are you sure you want to delete this question?
          </p>
          <div className="btn-container">
            <button onClick={handleConfirmDelete} className="btn-delete">
              Delete
            </button>
            <button onClick={handleCancelDelete} className="btn-cancel">
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default JobQnA;
