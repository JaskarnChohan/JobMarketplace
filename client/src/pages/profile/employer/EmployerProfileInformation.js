import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import Modal from "react-modal";
import {
  FaPencilAlt,
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhone,
  FaBriefcase,
  FaDollarSign,
  FaBuilding,
  FaClock,
  FaTag,
  FaCalendarAlt,
  FaGlobe,
} from "react-icons/fa";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { locations } from "../../../assets/locations.js";
import profileImage from "../../../assets/profile.png";
import "../../../styles/profile/Profile.css";
import "../../../styles/profile/ProfileInfo.css";
import "../../../styles/Global.css";

Modal.setAppElement("#root");

const EmployerProfileInformation = ({
  formData,
  setFormData,
  profileExists,
  onProfileUpdate,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  const { user } = useAuth();
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const navigate = useNavigate();
  const [pictureModalIsOpen, setPictureModalIsOpen] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [fileName, setFileName] = useState("No file chosen");
  const [jobListings, setJobListings] = useState([]);

  useEffect(() => {
    if (profileExists) {
      reset(formData);
      fetchJobListings();
    }
  }, [formData, profileExists, reset]);

  const fetchJobListings = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5050/api/jobs/getbyemployer/${user._id}`,
        {
          withCredentials: true,
        }
      );
      const openJobListings = response.data.jobs.filter(
        (job) => job.status === "Open"
      );
      setJobListings(openJobListings);
    } catch (error) {
      console.error("Failed to fetch job listings:", error);
    }
  };

  const openModal = () => {
    reset(formData);
    setModalIsOpen(true);
  };

  const closeModal = () => setModalIsOpen(false);

  const openPictureModal = () => {
    setImageFile(null);
    setFileName("No file chosen");
    setPictureModalIsOpen(true);
  };
  const closePictureModal = () => setPictureModalIsOpen(false);

  const handleProfileSubmit = async (data) => {
    try {
      const url = profileExists
        ? "http://localhost:5050/api/employer/update"
        : "http://localhost:5050/api/employer/create";
      const response = await axios({
        method: profileExists ? "PUT" : "POST",
        url,
        data,
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
      setFormData(response.data);
      setModalIsOpen(false);
      if (onProfileUpdate) onProfileUpdate();
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file || null);
    setFileName(file ? file.name : "No file chosen");
  };

  const handleImageUpload = async (event) => {
    event.preventDefault();
    if (!imageFile) {
      console.error("No file selected");
      return;
    }

    const formData = new FormData();
    formData.append("logo", imageFile);

    try {
      await axios.post(
        "http://localhost:5050/api/employer/update-logo",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      const response = await axios.get(
        "http://localhost:5050/api/employer/profile/fetch",
        {
          withCredentials: true,
        }
      );

      setFormData(response.data);
      setPictureModalIsOpen(false);
    } catch (error) {
      console.error("Failed to upload company logo:", error);
    }
  };

  return (
    <div className="profile-information-container">
      {profileExists ? (
        <div className="profile-header">
          <div className="profile-picture-container" onClick={openPictureModal}>
            <div className="profile-picture-wrapper">
              <img
                src={"http://localhost:5050/" + formData.logo}
                alt="Company Logo"
                className="profile-picture"
              />
              <div className="overlay">
                <i className="fas fa-pencil-alt pencil-icon"></i>
              </div>
            </div>
          </div>
          <div className="profile-info">
            <div className="profile-info-details">
              <h1 className="profile-name">{formData.name}</h1>
              <p className="profile-location">
                <FaMapMarkerAlt /> {formData.location}
              </p>{" "}
              <p className="profile-email">
                <FaEnvelope /> {formData.email}
              </p>
              <p className="profile-website">
                <FaGlobe /> {formData.websiteURL}
              </p>
              <p className="profile-phone">
                <FaPhone /> {formData.phoneNumber}
              </p>
              <p className="profile-industry">
                <FaBriefcase /> {formData.industry}
              </p>
            </div>
            <button className="btn edit-profile" onClick={openModal}>
              <FaPencilAlt /> Edit Profile
            </button>
          </div>
        </div>
      ) : (
        <div className="full-height-container">
          <div className="create-profile-container">
            <h2 className="create-profile-title">
              Create Your Company Profile
            </h2>
            <p className="create-profile-description">
              Start by creating your company profile to showcase your business
              and capabilities. It's quick and easy—just fill in your details
              and you'll be ready to go!
            </p>
            <img src={profileImage} alt="Company Profile" />
            <button onClick={openModal} className="btn">
              Get Started
            </button>
          </div>
        </div>
      )}

      {profileExists && formData && (
        <div>
          <div className="section">
            <h2 className="section-title">About {formData.name}</h2>
            <pre className="section-text wrap">{formData.description}</pre>
          </div>
          <div className="section">
            <h2 className="section-title">Active Job Listings</h2>
            <div className="job-listing-container">
              {Array.isArray(jobListings) && jobListings.length > 0 ? (
                jobListings.map((job) => (
                  <div className="job-card job-management-card" key={job._id}>
                    <h3
                      className="job-title"
                      onClick={() => navigate(`/jobview/${job._id}`)}
                    >
                      {job.title}
                    </h3>
                    <p className="job-info">
                      <FaBuilding /> {job.jobCategory}
                    </p>
                    <p className="job-info">
                      <FaMapMarkerAlt /> {job.location}
                    </p>
                    <p className="job-info">
                      <FaClock /> {job.employmentType}
                    </p>
                    <p className="job-info">
                      <FaTag /> {job.status}
                    </p>
                    <p className="job-info">
                      <FaDollarSign /> {job.salaryRange}
                    </p>
                    <p className="job-info">
                      <FaCalendarAlt />
                      {"Deadline:  "}
                      {new Date(job.applicationDeadline).toLocaleDateString()}
                    </p>
                  </div>
                ))
              ) : (
                <p className="section-text">
                  No active job listings available.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Profile Modal */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        className="modal-wrapper"
      >
        <div className="modal">
          <h1 className="lrg-heading">
            {profileExists ? "Edit Profile" : "Create Profile"}
          </h1>
          <form onSubmit={handleSubmit(handleProfileSubmit)}>
            <label>Name</label>
            <input
              type="text"
              className={errors.name ? "error" : ""}
              {...register("name", {
                required: "Company name is required",
              })}
            />
            {errors.name && (
              <p className="error-message">
                {" "}
                <i className="fas fa-exclamation-circle error-icon"></i>
                {errors.name.message}
              </p>
            )}

            <label>Location</label>
            <select
              className={errors.location ? "error" : ""}
              {...register("location", {
                required: "Location is required",
              })}
            >
              <option value="">Select Location</option>
              {locations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
            {errors.location && (
              <p className="error-message">
                <i className="fas fa-exclamation-circle error-icon"></i>
                {errors.location.message}
              </p>
            )}

            <label>Industry</label>
            <input
              type="text"
              className={errors.industry ? "error" : ""}
              {...register("industry", {
                required: "Industry is required",
              })}
            />
            {errors.industry && (
              <p className="error-message">
                <i className="fas fa-exclamation-circle error-icon"></i>
                {errors.industry.message}
              </p>
            )}

            <label>Website URL</label>
            <input
              type="text"
              className={errors.websiteURL ? "error" : ""}
              {...register("websiteURL", {
                required: "Website URL is required",
                pattern: {
                  value:
                    /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/.*)?$/,
                  message: "Enter a valid URL",
                },
              })}
            />
            {errors.websiteURL && (
              <p className="error-message">
                <i className="fas fa-exclamation-circle error-icon"></i>
                {errors.websiteURL.message}
              </p>
            )}

            <label>Phone Number</label>
            <input
              type="text"
              className={errors.phoneNumber ? "error" : ""}
              {...register("phoneNumber", {
                required: "Phone number is required",
                pattern: {
                  value: /^\+?[0-9]{6,15}$/,
                  message: "Phone number must be between 6 and 15 digits.",
                },
              })}
            />
            {errors.phoneNumber && (
              <p className="error-message">
                <i className="fas fa-exclamation-circle error-icon"></i>
                {errors.phoneNumber.message}
              </p>
            )}

            <label>
              Description<p className="sub-text">(Optional)</p>
            </label>
            <p className="sub-text">
              Highlight your company’s unique vision, values, and achievements
              to stand out in the industry.
            </p>
            <textarea
              {...register("description", {
                maxLength: {
                  value: 10000,
                  message: "Description cannot exceed 10000 characters",
                },
              })}
              className={errors.description ? "error" : ""}
            />
            {errors.description && (
              <p className="error-message">
                <i className="fas fa-exclamation-circle error-icon"></i>
                {errors.description.message}
              </p>
            )}
            <div className="btn-container">
              <button type="submit" className="btn-save">
                {profileExists ? "Update" : "Create"}
              </button>
              <button type="button" className="btn-cancel" onClick={closeModal}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </Modal>
      {/* Picture Modal */}
      <Modal
        isOpen={pictureModalIsOpen}
        onRequestClose={closePictureModal}
        className="modal-wrapper"
      >
        <div className="modal">
          <h1 className="lrg-heading">Upload Company Logo</h1>
          <form onSubmit={handleImageUpload}>
            <label className="modal-label">Company Logo</label>
            <div className="file-upload">
              <div className="file-select">
                <div className="file-select-button">Choose File</div>
                <div className="file-select-name">{fileName}</div>
                <input
                  type="file"
                  accept="image/*"
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
                onClick={closePictureModal}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default EmployerProfileInformation;
