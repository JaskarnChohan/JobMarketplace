import React, { useState, useEffect } from "react";
import axios from "axios";
import Modal from "react-modal";
import {
  FaFileUpload,
  FaTrashAlt,
  FaDownload,
  FaFileAlt,
} from "react-icons/fa";
import "../../../styles/profile/Profile.css";
import "../../../styles/profile/Resume.css";

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

  // Fetch the existing resume from the server when the component is mounted
  useEffect(() => {
    const fetchResume = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5050/api/profile/resume/fetch`,
          { withCredentials: true } // Enables sending cookies for authentication
        );
        setExistingResume(response.data.resume); // Set the existing resume in the state
      } catch (error) {
        console.error("Failed to fetch resume:", error); // Handle error
      }
    };

    fetchResume();
  }, [profileId]); // Run only when profileId changes

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
        const formData = new FormData(); // Create FormData to send the file
        formData.append("resume", resumeFile);

        // Make a POST request to upload the resume
        const response = await axios.post(
          `http://localhost:5050/api/profile/resume/upload`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" }, // Set headers for file upload
            withCredentials: true, // Send cookies for authentication
          }
        );

        setExistingResume(response.data.resume); // Update the existing resume with the new file
        closeResumeModal(); // Close the upload modal after successful upload
      }
    } catch (error) {
      console.error("Failed to upload resume:", error); // Handle error
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

  return (
    <div className="section">
      <h2 className="section-title">Resume Upload</h2>
      <p className="section-text">
        Upload your resume to enhance your profile!
      </p>

      {/* Check if a resume exists; if so, display download and delete options */}
      {existingResume ? (
        <div className="resume-card last">
          <div className="resume-card-content">
            <div className="resume-card-icon">
              <FaFileAlt size={50} />
            </div>
            <div className="resume-card-info">
              <h3 className="resume-card-title">{`${firstName} ${lastName}'s Resume`}</h3>
            </div>
            <div className="resume-card-actions">
              <a
                href={`http://localhost:5050/${existingResume}`} // Link to download the existing resume
                download
                className="btn resume-btn"
              >
                <FaDownload />
                <span>Download</span>
              </a>
              <button
                onClick={openConfirmationModal} // Open delete confirmation modal
                className="btn resume-btn"
              >
                <FaTrashAlt />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        // If no resume exists, show the option to upload a new resume
        <button onClick={openResumeModal} className="btn btn-primary">
          <FaFileUpload /> Upload Resume
        </button>
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
                  accept=".pdf,.doc,.docx" // Accept only document file types
                  onChange={handleFileChange} // Trigger file selection handling
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
    </div>
  );
};

export default ResumeUpload;
