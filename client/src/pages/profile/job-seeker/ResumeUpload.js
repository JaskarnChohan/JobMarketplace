import React, { useState, useEffect } from "react";
import axios from "axios";
import Modal from "react-modal";
import {
  FaFileUpload,
  FaTrashAlt,
  FaDownload,
  FaFileAlt,
  FaLock,
  FaUnlock,
} from "react-icons/fa";
import "../../../styles/profile/Profile.css";
import "../../../styles/profile/Resume.css";
import Spinner from "../../../components/Spinner/Spinner";

// Required to make the modal accessible by specifying the root element
Modal.setAppElement("#root");

const ResumeUpload = ({ profileId, firstName, lastName }) => {
  // State to manage resume modal visibility
  const [resumeModalIsOpen, setResumeModalIsOpen] = useState(false);

  // State to handle selected resume file
  const [resumeFile, setResumeFile] = useState(null);

  // State for displaying chosen file name
  const [resumeFileName, setResumeFileName] = useState("No file chosen");

  // State for managing confirmation modal visibility (used for deletion confirmation)
  const [confirmationModalIsOpen, setConfirmationModalIsOpen] = useState(false);

  // State to hold any existing resume fetched from the backend
  const [existingResume, setExistingResume] = useState(null);

  // State to manage privacy toggle modal visibility
  const [privacyToggleModalIsOpen, setPrivacyToggleModalIsOpen] =
    useState(false);

  // State to manage the privacy setting of the resume
  const [isResumePublic, setIsResumePublic] = useState(false);

  const [premiumModalIsOpen, setPremiumModalIsOpen] = useState(false); // Modal state for premium access

  // AI feedback states
  const [aiFeedback, setAiFeedback] = useState(null);
  const [loading, setLoading] = useState(false); // Loading state for API calls

  // Fetch the existing resume from the server when the component is mounted
  useEffect(() => {
    const fetchResume = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5050/api/profile/resume/fetch`,
          { withCredentials: true }
        );

        setExistingResume(response.data.resume); // Set existing resume
        setIsResumePublic(response.data.privacySetting === "public"); // Set privacy state based on fetched data
      } catch (error) {
        console.error("Failed to fetch resume:", error);
      }
    };

    fetchResume();
  }, [profileId]); // Run only when profileId changes

  // Open the modal for premium access
  const openPremiumModal = () => {
    setPremiumModalIsOpen(true);
  };

  // Close the modal
  const closePremiumModal = () => {
    setPremiumModalIsOpen(false);
  };

  // Opens the resume upload modal
  const openResumeModal = () => {
    setResumeFile(null); // Clear any previously selected file
    setResumeFileName("No file chosen"); // Reset file name display
    setResumeModalIsOpen(true); // Show the modal
  };

  // Closes the resume upload modal
  const closeResumeModal = () => {
    setResumeModalIsOpen(false); // Hide the modal
    setResumeFile(null); // Clear file selection
    setResumeFileName("No file chosen"); // Reset file name display
  };

  // Handles file input change
  const handleFileChange = (e) => {
    const file = e.target.files[0]; // Get the first selected file
    setResumeFile(file || null); // Set the file in state (null if no file selected)
    setResumeFileName(file ? file.name : "No file chosen"); // Display the selected file name or default message
  };

  // Opens the confirmation modal for resume deletion
  const openConfirmationModal = () => {
    setConfirmationModalIsOpen(true);
  };

  // Closes the confirmation modal
  const closeConfirmationModal = () => {
    setConfirmationModalIsOpen(false);
  };

  // Handles the resume upload process
  const handleResumeUpload = async (e) => {
    e.preventDefault();
    try {
      if (resumeFile) {
        const formData = new FormData();
        formData.append("resume", resumeFile);
        formData.append("resumePrivacy", "private");

        const response = await axios.post(
          `http://localhost:5050/api/profile/resume/upload`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
            withCredentials: true,
          }
        );

        setExistingResume(response.data.resume);
        closeResumeModal();
        setIsResumePublic(false); // Set privacy state to private
      }
    } catch (error) {
      console.error("Failed to upload resume:", error);
    }
  };

  // Handles the resume deletion process
  const handleResumeDelete = async () => {
    try {
      await axios.delete(`http://localhost:5050/api/profile/resume/delete`, {
        withCredentials: true, // Send cookies for authentication
      });
      setExistingResume(null); // Remove the resume from state after successful deletion
      closeConfirmationModal(); // Close the confirmation modal
    } catch (error) {
      console.error("Failed to delete resume:", error); // Handle error
    }
  };

  // Opens the privacy toggle modal
  const openPrivacyToggleModal = () => {
    setPrivacyToggleModalIsOpen(true);
  };

  // Closes the privacy toggle modal
  const closePrivacyToggleModal = () => {
    setPrivacyToggleModalIsOpen(false);
  };

  // Handles the privacy toggle process
  const handlePrivacyToggle = async () => {
    try {
      const newPrivacySetting = isResumePublic ? "private" : "public";
      await axios.put(
        `http://localhost:5050/api/profile/resume/privacy`,
        {
          privacySetting: newPrivacySetting,
        },
        {
          withCredentials: true,
        }
      );
      setIsResumePublic(!isResumePublic); // Update local state
      closePrivacyToggleModal();
    } catch (error) {
      console.error("Failed to update privacy setting:", error);
    }
  };

  // Handle AI evaluation behind the paywall
  const handleAiFeedback = async () => {
    setLoading(true); // Set loading state to true

    try {
      // Check subscription status
      const subscriptionResponse = await axios.get(
        "http://localhost:5050/api/payment/subscription-status",
        { withCredentials: true }
      );

      const { subscriptionType, status } = subscriptionResponse.data;

      // If the user has "JobHive Premium", proceed with AI evaluation
      if (subscriptionType === "JobHive Premium" && status === "active") {
        const response = await axios.post(
          `http://localhost:5050/api/ai/resume-feedback/${profileId}`,
          { withCredentials: true }
        );

        // If AI evaluation succeeds, set the AI results
        if (response.data.feedbackText) {
          setAiFeedback(response.data.feedbackText); // Store feedback
        } else {
          console.error("Error evaluating resume:", response.data.error);
        }
      } else {
        // If not a premium user, open the modal
        openPremiumModal();
      }

      setLoading(false); // Set loading state to false
    } catch (error) {
      console.error("Error during AI evaluation:", error);
      setLoading(false); // Set loading state to false
    }
  };

  // If loading then display a spinner
  if (loading) {
    return <Spinner />;
  }

  return (
    <div>
      <div className="section">
        <h2 className="section-title">Resume Upload</h2>
        <p className="section-text">
          Upload your resume to enhance your profile!
        </p>

        {existingResume ? (
          <div className="resume-card last">
            <div className="resume-card-content">
              <div className="resume-card-icon">
                <FaFileAlt size={50} />
              </div>
              <div className="resume-card-info">
                <h3 className="resume-card-title">{`${firstName} ${lastName}'s Resume`}</h3>
                <p>Privacy Setting: {isResumePublic ? "Public" : "Private"}</p>
              </div>
              <div className="resume-card-actions">
                <a
                  href={`http://localhost:5050/${existingResume}`}
                  download
                  className="btn resume-btn"
                >
                  <FaDownload />
                  <span>Download</span>
                </a>
                {/* Button for AI Feedback */}
                <button
                  className="btn resume-btn ai-evaluation-btn"
                  onClick={handleAiFeedback} // Pass as a function
                >
                  AI Feedback
                </button>
                <button
                  onClick={openConfirmationModal}
                  className="btn resume-btn"
                >
                  <FaTrashAlt />
                  <span>Delete</span>
                </button>
                <button
                  onClick={openPrivacyToggleModal}
                  className="btn resume-btn"
                >
                  {isResumePublic ? <FaLock /> : <FaUnlock />}
                  <span>{isResumePublic ? "Make Private" : "Make Public"}</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button onClick={openResumeModal} className="btn btn-primary">
            <FaFileUpload /> Upload Resume
          </button>
        )}
      </div>
      {/* AI Feedback Results Section */}
      {aiFeedback && (
        <div className="section">
          <h3 className="section-title">AI Feedback</h3>
          <div className="ai-response">
            <div
              className="improved-text"
              dangerouslySetInnerHTML={{ __html: aiFeedback }}
            />
          </div>
        </div>
      )}

      {/* Resume Upload Modal */}
      <Modal
        isOpen={resumeModalIsOpen}
        onRequestClose={closeResumeModal}
        className="modal-wrapper"
      >
        <div className="modal">
          <h1 className="lrg-heading">Upload Resume</h1>
          <form onSubmit={handleResumeUpload} className="form">
            <label className="modal-label">Resume File</label>
            <div className="file-upload">
              <div className="file-select">
                <div className="file-select-button">Choose File</div>
                <div className="file-select-name">{resumeFileName}</div>
                <input
                  type="file"
                  accept=".pdf,.docx"
                  onChange={handleFileChange}
                />
              </div>
            </div>
            <div className="btn-container">
              <button type="submit" className="btn-save">
                Upload
              </button>
              <button
                type="button"
                className="btn-cancel"
                onClick={closeResumeModal}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Confirmation Modal */}
      <Modal
        isOpen={confirmationModalIsOpen}
        onRequestClose={closeConfirmationModal}
        className="modal-wrapper"
      >
        <div className="modal">
          <h1 className="lrg-heading">Delete Resume</h1>
          <p className="med-text">
            Are you sure you want to delete your resume?
          </p>
          <div className="btn-container">
            <button onClick={handleResumeDelete} className="btn-delete">
              Delete
            </button>
            <button onClick={closeConfirmationModal} className="btn-cancel">
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* Privacy Toggle Modal */}
      <Modal
        isOpen={privacyToggleModalIsOpen}
        onRequestClose={closePrivacyToggleModal}
        className="modal-wrapper"
      >
        <div className="modal">
          <h1 className="lrg-heading">Resume Privacy</h1>
          <p className="med-text">
            Are you sure you want to make your resume{" "}
            {isResumePublic ? "private" : "public"}?
          </p>
          <div className="btn-container">
            <button onClick={handlePrivacyToggle} className="btn-confirm">
              Confirm
            </button>
            <button onClick={closePrivacyToggleModal} className="btn-cancel">
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* Premium access required modal */}
      <Modal
        isOpen={premiumModalIsOpen}
        onRequestClose={closePremiumModal}
        className="modal-wrapper"
      >
        <div className="modal">
          <h1 className="lrg-heading">Premium Feature</h1>
          <p className="med-text">
            You need a JobHive Premium subscription to access the AI resume
            evaluation feature.
          </p>
          <div className="btn-container">
            <button onClick={closePremiumModal} className="btn-close">
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ResumeUpload;
