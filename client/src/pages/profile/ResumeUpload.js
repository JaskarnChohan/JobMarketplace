import React, { useState, useEffect } from "react";
import axios from "axios";
import Modal from "react-modal";
import {
  FaFileUpload,
  FaTrashAlt,
  FaDownload,
  FaFileAlt,
} from "react-icons/fa"; // Import download icon
import "../../styles/profile/Profile.css";
import "../../styles/profile/Resume.css";

Modal.setAppElement("#root");

const ResumeUpload = ({ profileId, firstName, lastName }) => {
  const [resumeModalIsOpen, setResumeModalIsOpen] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeFileName, setResumeFileName] = useState("No file chosen");
  const [confirmationModalIsOpen, setConfirmationModalIsOpen] = useState(false);
  const [existingResume, setExistingResume] = useState(null);

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5050/api/profile/resume/fetch`,
          { withCredentials: true }
        );
        setExistingResume(response.data.resume);
      } catch (error) {
        console.error("Failed to fetch resume:", error);
      }
    };

    fetchResume();
  }, [profileId]);

  const openResumeModal = () => {
    setResumeFile(null);
    setResumeFileName("No file chosen");
    setResumeModalIsOpen(true);
  };

  const closeResumeModal = () => {
    setResumeModalIsOpen(false);
    setResumeFile(null);
    setResumeFileName("No file chosen");
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setResumeFile(file || null);
    setResumeFileName(file ? file.name : "No file chosen");
  };

  const openConfirmationModal = () => {
    setConfirmationModalIsOpen(true);
  };

  const closeConfirmationModal = () => {
    setConfirmationModalIsOpen(false);
  };

  const handleResumeUpload = async (e) => {
    e.preventDefault();
    try {
      if (resumeFile) {
        const formData = new FormData();
        formData.append("resume", resumeFile);

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
      }
    } catch (error) {
      console.error("Failed to upload resume:", error);
    }
  };

  const handleResumeDelete = async () => {
    try {
      await axios.delete(`http://localhost:5050/api/profile/resume/delete`, {
        withCredentials: true,
      });
      setExistingResume(null);
      closeConfirmationModal();
    } catch (error) {
      console.error("Failed to delete resume:", error);
    }
  };

  return (
    <div className="section">
      <h2 className="section-title">Resume Upload</h2>
      <p className="section-text">
        Upload your resume to enhance your profile!
      </p>
      {existingResume ? (
        <div className="resume-card">
          <div className="resume-card-content">
            <div className="resume-card-icon">
              <FaFileAlt size={50} />
            </div>
            <div className="resume-card-info">
              <h3 className="resume-card-title">{`${firstName} ${lastName}'s Resume`}</h3>
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
              <button
                onClick={openConfirmationModal}
                className="btn resume-btn"
              >
                <FaTrashAlt />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
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
                  accept=".pdf,.doc,.docx"
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
    </div>
  );
};

export default ResumeUpload;
