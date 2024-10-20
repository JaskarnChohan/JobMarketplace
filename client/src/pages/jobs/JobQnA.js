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
  const [editingAnswerIndex, setEditingAnswerIndex] = useState(null); // State to hold the index of the question being edited
  const [answeredQuestion, setAnsweredQuestion] = useState(""); // State to hold the edited question

  //George Haeberlin: check if user has voted on a question
  const hasVoted = (votes, userId, voteType) => {
    if (votes.find((v) => v.voter === userId && v.vote === voteType)) {
      return true;
    } else {
      return false;
    }
  };

  // Handle question deletion
  const handleDeleteQuestion = async (index) => {
    try {
      // Filter out the question to be deleted
      const updatedQnA = job.QnA.filter((_, i) => i !== index);
      const response = await axios.put(
        `http://localhost:5050/api/jobs/update/${job._id}`,
        { QnA: updatedQnA },
        { withCredentials: true }
      );
      // Update the job state with the new QnA
      setJob((prevJob) => ({
        ...prevJob,
        QnA: response.data.QnA,
      }));
    } catch (err) {
      // Log any errors and display an error message
      console.error(err);
      setErrors([{ msg: "Failed to delete question" }]);
    }
  };

  // Handle question deletion confirmation
  const handleDeleteQuestionClick = (index) => {
    setQuestionToDelete(index);
    setConfirmationDialogIsOpen(true);
  };

  // Handle question deletion confirmation
  const handleConfirmDelete = async () => {
    if (questionToDelete !== null) {
      await handleDeleteQuestion(questionToDelete);
      setQuestionToDelete(null);
      setConfirmationDialogIsOpen(false);
    }
  };

  // Handle canceling question deletion
  const handleCancelDelete = () => {
    setQuestionToDelete(null);
    setConfirmationDialogIsOpen(false);
  };

  // Get author name based on user role
  const getAuthorName = async (authorId) => {
    if (authorId === job.employer) {
      return job.company;
    } else if (user.role === "employer") {
      try {
        const response = await axios.get(
          `http://localhost:5050/api/employer/profile/fetch/`,
          { withCredentials: true }
        );
        // Check if the employer has a profile
        if (response.data.name === undefined) {
          return -1;
        }
        let name = response.data.name; // Get the employer name
        return name;
      } catch (err) {
        // Log any errors and return "Unknown" if the name is not found
        console.error("Error fetching company name:", err); // Debugging log
        return "Unknown";
      }
    } else {
      // Fetch the author name from the user profile
      try {
        const response = await axios.get(
          `http://localhost:5050/api/profile/user/${authorId}`
        );
        if (
          response.data.firstName === undefined &&
          response.data.lastName === undefined
        ) {
          return -1;
        }
        let name = response.data.firstName + " " + response.data.lastName; // Combine first and last name
        return name;
      } catch (err) {
        // Log any errors and return "Unknown" if the name is not found
        console.error("Error fetching author name:", err); // Debugging log
        return "Unknown";
      }
    }
  };

  //George Haeberlin: handle new question submission
  const handleSubmitQuestion = async (e) => {
    e.preventDefault();
    try {
      if (!newQuestion) {
        setErrors([{ msg: "Question cannot be empty" }]); // Display error if question is empty
        return; // Do nothing if the question is empty
      }
      const authorName = await getAuthorName(user._id); // Get author name
      if (authorName === -1) {
        setErrors([
          {
            msg: "Failed to get profile name. Must have a profile to ask a question",
          },
        ]); // Display error if author name is not found
        return; // Do nothing if the author name is not found
      }
      // Prepare updated QnA with the new question
      const updatedQnA = [
        ...job.QnA.map((qa) => ({
          author: qa.author,
          authorName: qa.authorName,
          questionInfo: qa.questionInfo,
          answer: qa.answer,
          _id: qa._id, // preserve the _id for existing questions
        })),
        {
          author: user._id,
          authorName: authorName,
          questionInfo: [
            { question: newQuestion, datePosted: new Date(), votes: [] },
          ],
          answer: null,
        }, // Add new question
      ];
      const response = await axios.put(
        `http://localhost:5050/api/jobs/update/${job._id}`,
        {
          QnA: updatedQnA,
          isNewQuestion: true, // Indicate that a new question is being added
        },
        { withCredentials: true }
      );
      setJob((prevJob) => ({
        ...prevJob,
        QnA: response.data.QnA, // Ensure we update the state with the response data
      })); // Update job state
      setNewQuestion(""); // Clear new question inputs
    } catch (err) {
      console.error(err); // Log any errors
    }
  };

  //George Haeberlin: handle vote submission and removal
  const handleVote = async (qaId, vote) => {
    try {
      const updatedQnA = job.QnA.map((qa) => {
        if (qa._id === qaId) {
          if (
            qa.questionInfo[0].votes.find(
              (v) => v.voter === user._id && v.vote === vote
            )
          ) {
            // if the user has already voted, remove the vote
            qa.questionInfo[0].votes = qa.questionInfo[0].votes.filter(
              (v) => v.voter !== user._id
            );
          } else if (
            qa.questionInfo[0].votes.find(
              (v) => v.voter === user._id && v.vote !== vote
            )
          ) {
            // remove vote if user has voted with a different vote
            qa.questionInfo[0].votes = qa.questionInfo[0].votes.filter(
              (v) => v.voter !== user._id
            );
            // add new vote
            qa.questionInfo[0].votes.push({ voter: user._id, vote });
          } else {
            // if the user has not voted, add the vote
            qa.questionInfo[0].votes.push({ voter: user._id, vote });
          }
        }
        return qa;
      });
      const response = await axios.put(
        `http://localhost:5050/api/jobs/update/${job._id}`,
        { QnA: updatedQnA },
        { withCredentials: true }
      );
      setJob((prevJob) => ({
        ...prevJob,
        QnA: response.data.QnA, // Ensure we update the state with the response data
      })); // Update job state
    } catch (err) {
      console.error(err); // Log any errors
    }
  };

  //George Haeberlin: handle editing a question
  const handleEditQuestion = (index) => {
    setEditingQuestionIndex(index);
    setEditedQuestion(job.QnA[index].questionInfo[0].question);
  };

  //George Haeberlin: handle question update
  const handleSubmitEditedQuestion = async (index) => {
    try {
      const updatedQnA = job.QnA.map((qa, i) => {
        if (i === index) {
          qa.questionInfo[0].question = editedQuestion;
        }
        return qa;
      });
      const response = await axios.put(
        `http://localhost:5050/api/jobs/update/${job._id}`,
        { QnA: updatedQnA },
        { withCredentials: true }
      );
      setJob((prevJob) => ({
        ...prevJob,
        QnA: response.data.QnA, // Ensure we update the state with the response data
      })); // Update job state
      setEditingQuestionIndex(null); // Clear editing index
      setEditedQuestion(""); // Clear edited question
    } catch (err) {
      console.error(err); // Log any errors
      setErrors([{ msg: "Failed to update question" }]); // Display error message
    }
  };

  // Handle answering a question
  const handleAnswerQuestion = (index) => {
    setEditingAnswerIndex(index);
    setAnsweredQuestion(job.QnA[index].answer || ""); // Set the answer to the current answer or an empty string
  };

  // Handle submitting an answer
  const handleSubmitAnsweredQuestion = async (index) => {
    try {
      const answeredQuestionAuthor = job.QnA[index].author; // Get the author of the question
      const updatedQnA = job.QnA.map((qa, i) => {
        if (i === index) {
          return {
            ...qa,
            answer: answeredQuestion, // Set the new answer
          };
        }
        return qa;
      });

      // Send the updated QnA and the question author to the backend
      const response = await axios.put(
        `http://localhost:5050/api/jobs/update/${job._id}`,
        {
          QnA: updatedQnA,
          answeredQuestionAuthor, // Add the author of the answered question
        },
        { withCredentials: true }
      );

      // Update job state with the new QnA
      setJob((prevJob) => ({
        ...prevJob,
        QnA: response.data.QnA,
      }));

      // Clear editing index and the input field for answered question
      setEditingAnswerIndex(null);
      setAnsweredQuestion("");
    } catch (err) {
      console.error(err); // Log any errors
      setErrors([{ msg: "Failed to update answer" }]); // Display error message
    }
  };

  // Handle canceling an answer
  const handleCancelAnswer = () => {
    setEditingAnswerIndex(null);
    setAnsweredQuestion("");
  };

  // Handle canceling an edit
  const handleCancelEdit = () => {
    setEditingQuestionIndex(null);
    setEditedQuestion("");
  };

  return (
    <div className="qa-section">
      <h3>Questions & Answers</h3>

      {/* Only job seekers can write a question */}
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
            <div className="qa-vote">
              {/* Votes are only visible and clickable if the user is authenticated and a job seeker */}
              {isAuthenticated && isJobSeeker() && (
                <>
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
                </>
              )}
            </div>
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
                    <div className="btn-container">
                      <button
                        className="qa-submit-edit-btn"
                        onClick={() => handleSubmitEditedQuestion(index)}
                      >
                        Save
                      </button>
                      <button
                        className="qa-cancel-edit-btn"
                        onClick={handleCancelEdit}
                      >
                        Cancel
                      </button>
                    </div>
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
                        user._id === job.employer &&
                        !qa.answer && (
                          <button
                            onClick={() => handleAnswerQuestion(index)}
                            className="answer-question-btn"
                          >
                            Answer
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
              <div className="qa-answer">
                {editingAnswerIndex === index ? (
                  <>
                    <textarea
                      value={answeredQuestion}
                      onChange={(e) => setAnsweredQuestion(e.target.value)}
                      className="qa-edit-textarea"
                    />
                    <div className="btn-container">
                      <button
                        className="qa-submit-edit-btn"
                        onClick={() => handleSubmitAnsweredQuestion(index)}
                      >
                        Save
                      </button>
                      <button
                        className="qa-cancel-edit-btn"
                        onClick={handleCancelAnswer}
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <p>
                      <strong>Answer:</strong> {qa.answer || "No answer yet."}
                    </p>
                    <div className="btn-container">
                      {isAuthenticated &&
                        user &&
                        user._id === job.employer &&
                        qa.answer && (
                          <button
                            onClick={() => handleAnswerQuestion(index)}
                            className="answer-question-btn"
                          >
                            Edit
                          </button>
                        )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
      {confirmationDialogIsOpen && (
        <Modal
          isOpen={confirmationDialogIsOpen}
          onRequestClose={handleCancelDelete}
          className="modal-wrapper"
        >
          <div className="modal">
            <h1 className="lrg-heading">Delete Question</h1>
            <p className="med-text">
              Are you sure you want to delete this question?
            </p>
            <div className="btn-container">
              <button onClick={handleConfirmDelete} className="btn-delete">
                Yes
              </button>
              <button onClick={handleCancelDelete} className="btn-cancel">
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default JobQnA;
