import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import Modal from "react-modal";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import {
  FaPencilAlt,
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhone,
  FaBriefcase,
} from "react-icons/fa";
import axios from "axios";
import { locations } from "../../../assets/locations.js";
import { categories } from "../../../assets/categories.js";
import profileImage from "../../../assets/profile.png";
import "../../../styles/profile/Profile.css";
import "../../../styles/profile/ProfileInfo.css";
import "../../../styles/Global.css";

Modal.setAppElement("#root"); // Set the app element for accessibility

const ProfileInformation = ({
  formData,
  setFormData,
  profileExists,
  onProfileUpdate,
}) => {
  // Hook for form handling
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  // State to manage modals
  const { user } = useAuth();
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [pictureModalIsOpen, setPictureModalIsOpen] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [fileName, setFileName] = useState("No file chosen");
  const navigate = useNavigate();

  // Reset form data if profile exists
  useEffect(() => {
    if (profileExists) {
      reset(formData);
    }
  }, [formData, profileExists, reset]);

  // Open and reset the profile edit modal
  const openModal = () => {
    reset(formData);
    setModalIsOpen(true);
  };

  // Close the profile edit modal
  const closeModal = () => setModalIsOpen(false);

  // Open the picture upload modal
  const openPictureModal = () => {
    setImageFile(null);
    setFileName("No file chosen");
    setPictureModalIsOpen(true);
  };

  // Close the picture upload modal
  const closePictureModal = () => setPictureModalIsOpen(false);

  // Handle form submission for profile data
  const handleProfileSubmit = async (data) => {
    try {
      const url = profileExists
        ? "http://localhost:5050/api/profile/update"
        : "http://localhost:5050/api/profile/create";
      const response = await axios({
        method: profileExists ? "PUT" : "POST",
        url,
        data,
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
      setFormData(response.data); // Update form data with response
      setModalIsOpen(false); // Close modal after submission
      if (onProfileUpdate) onProfileUpdate(); // Notify parent component of update
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  // Handle file input changes for profile picture upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file || null);
    setFileName(file ? file.name : "No file chosen");
  };

  // Handle image upload
  const handleImageUpload = async (event) => {
    event.preventDefault();
    if (!imageFile) {
      console.error("No file selected");
      return;
    }

    const formData = new FormData();
    formData.append("profilePicture", imageFile); // Append file to FormData

    try {
      await axios.post(
        "http://localhost:5050/api/profile/update-picture",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      // Fetch updated profile data after picture upload
      const response = await axios.get(
        "http://localhost:5050/api/profile/fetch",
        {
          withCredentials: true,
        }
      );

      setFormData(response.data); // Update form data with new profile
      setPictureModalIsOpen(false); // Close picture modal after upload
    } catch (error) {
      console.error("Failed to upload profile picture:", error);
    }
  };

  return (
    <div className="profile-information-container">
      {profileExists ? (
        <div className="profile-header">
          <div className="profile-picture-container" onClick={openPictureModal}>
            <div className="profile-picture-wrapper">
              <img
                src={"http://localhost:5050/" + formData.profilePicture}
                alt="Profile"
                className="profile-picture"
              />
              <div className="overlay">
                <i className="fas fa-pencil-alt pencil-icon"></i>{" "}
                {/* Edit icon */}
              </div>
            </div>
          </div>
          <div className="profile-info">
            <div className="profile-info-details">
              <h1 className="profile-name">
                {formData.firstName} {formData.lastName}
              </h1>
              <p className="profile-location">
                <FaMapMarkerAlt /> {formData.homeLocation}
              </p>
              <p className="profile-email">
                <FaEnvelope /> {formData.email}
              </p>
              <p className="profile-phone">
                <FaPhone /> {formData.phoneNumber}
              </p>
              <p className="profile-classification">
                <FaBriefcase /> {formData.preferredClassification}
              </p>
              <p className="profile-bio">{formData.bio}</p>
            </div>
            <button className="btn edit-profile" onClick={openModal}>
              <FaPencilAlt /> Edit Profile
            </button>
            {/*<button className="btn edit-profile" onClick={() => navigate(`../viewprofile/${user._id}`)}>
              <FaPencilAlt /> View Profile
            </button>*/}
          </div>
        </div>
      ) : (
        <div className="full-height-container">
          <div className="create-profile-container">
            <h2 className="create-profile-title">Create Your Profile</h2>
            <p className="create-profile-description">
              Start by creating your profile to showcase your skills and
              experiences. It's quick and easy—just fill in your details and
              you'll be ready to go!
            </p>
            <img src={profileImage} alt="Profile" />
            <button onClick={openModal} className="btn">
              Get Started
            </button>
          </div>
        </div>
      )}

      {/* Profile Modal for editing or creating profile */}
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
            <label>First Name</label>
            <input
              type="text"
              className={errors.firstName ? "error" : ""}
              {...register("firstName", {
                required: "First name is required",
              })}
            />
            {errors.firstName && (
              <p className="error-messages">
                <i className="fas fa-exclamation-circle error-icon"></i>
                {errors.firstName.message}
              </p>
            )}

            <label>Last Name</label>
            <input
              type="text"
              className={errors.lastName ? "error" : ""}
              {...register("lastName", {
                required: "Last name is required",
              })}
            />
            {errors.lastName && (
              <p className="error-messages">
                <i className="fas fa-exclamation-circle error-icon"></i>
                {errors.lastName.message}
              </p>
            )}

            <label>Home Location</label>
            <select
              className={errors.homeLocation ? "error" : ""}
              {...register("homeLocation", {
                required: "Home location is required",
              })}
            >
              <option value="">Select Location</option>
              {locations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
            {errors.homeLocation && (
              <p className="error-messages">
                <i className="fas fa-exclamation-circle error-icon"></i>
                {errors.homeLocation.message}
              </p>
            )}

            <label>Phone Number</label>
            <input
              type="text"
              className={errors.phoneNumber ? "error" : ""}
              {...register("phoneNumber", {
                required: "Phone number is required",
                pattern: {
                  value: /^\+?[0-9]{6,14}$/,
                  message: "Phone number must be between 6 and 14 digits.",
                },
              })}
            />
            {errors.phoneNumber && (
              <p className="error-messages">
                <i className="fas fa-exclamation-circle error-icon"></i>
                {errors.phoneNumber.message}
              </p>
            )}

            <label>
              Biography <p className="sub-text">(Optional)</p>
            </label>
            <p className="sub-text">
              Showcase your distinctive experiences, goals, and skills.
            </p>
            <textarea
              {...register("bio", {
                maxLength: {
                  value: 600,
                  message: "Biography cannot exceed 600 characters",
                },
              })}
              className={errors.bio ? "error" : ""}
            />
            {errors.bio && (
              <p className="error-messages">
                <i className="fas fa-exclamation-circle error-icon"></i>
                {errors.bio.message}
              </p>
            )}

            <label>Preferred Classification</label>
            <select
              className={errors.preferredClassification ? "error" : ""}
              {...register("preferredClassification", {
                required: "Preferred classification is required",
              })}
            >
              <option value="">Select Classification</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            {errors.preferredClassification && (
              <p className="error-messages">
                <i className="fas fa-exclamation-circle error-icon"></i>
                {errors.preferredClassification.message}
              </p>
            )}

            <div className="btn-container">
              <button className="btn-save" type="submit">
                Save
              </button>
              <button className="btn-cancel" onClick={closeModal}>
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
          <h1 className="lrg-heading">Upload Profile Picture</h1>
          <form onSubmit={handleImageUpload}>
            <label className="modal-label">Profile Picture</label>
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

export default ProfileInformation;
