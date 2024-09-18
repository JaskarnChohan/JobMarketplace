import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import Modal from "react-modal";
import {
  FaPencilAlt,
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhone,
  FaBriefcase,
} from "react-icons/fa";
import axios from "axios";
import { locations } from "../../assets/locations.js";
import profileImage from "../../assets/profile.png";
import "../../styles/profile/Profile.css";
import "../../styles/profile/ProfileInfo.css";
import "../../styles/Global.css";

Modal.setAppElement("#root");

const ProfileInformation = ({
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
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [pictureModalIsOpen, setPictureModalIsOpen] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [fileName, setFileName] = useState("No file chosen");

  useEffect(() => {
    if (profileExists) {
      reset(formData);
    }
  }, [formData, profileExists, reset]);

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
        ? "http://localhost:5050/api/profile/update"
        : "http://localhost:5050/api/profile/create";
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
    formData.append("profilePicture", imageFile);

    try {
      await axios.post(
        "http://localhost:5050/api/profile/update-picture",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      const response = await axios.get(
        "http://localhost:5050/api/profile/fetch",
        {
          withCredentials: true,
        }
      );

      setFormData(response.data);
      setPictureModalIsOpen(false);
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
                <i className="fas fa-pencil-alt pencil-icon"></i>
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
            <label>First Name</label>
            <input
              type="text"
              className={errors.firstName ? "error" : ""}
              {...register("firstName", {
                required: "First name is required",
              })}
            />
            {errors.firstName && (
              <p className="error-message">
                {" "}
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
              <p className="error-message">
                {" "}
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
              <p className="error-message">
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
                  value: /^\+?[0-9]{10,14}$/,
                  message: "Phone number must be between 10 and 14 digits.",
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
              <p className="error-message">
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
              <option value="Accounting">Accounting</option>
              <option value="Administration & Office Support">
                Administration & Office Support
              </option>
              <option value="Advertising, Arts & Media">
                Advertising, Arts & Media
              </option>
              <option value="Banking & Financial Services">
                Banking & Financial Services
              </option>
              <option value="Call Centre & Customer Service">
                Call Centre & Customer Service
              </option>
              <option value="CEO & General Management">
                CEO & General Management
              </option>
              <option value="Community Services & Development">
                Community Services & Development
              </option>
              <option value="Construction">Construction</option>
              <option value="Consulting & Strategy">
                Consulting & Strategy
              </option>
              <option value="Education & Training">Education & Training</option>
              <option value="Engineering">Engineering</option>
              <option value="Farming, Animals & Conservation">
                Farming, Animals & Conservation
              </option>
              <option value="Government">Government</option>
              <option value="Healthcare & Medical">Healthcare & Medical</option>
              <option value="Hospitality & Tourism">
                Hospitality & Tourism
              </option>
              <option value="Human Resources & Recruitment">
                Human Resources & Recruitment
              </option>
              <option value="Information & Communication Technology">
                Information & Communication Technology
              </option>
              <option value="Insurance & Superannuation">
                Insurance & Superannuation
              </option>
              <option value="Legal">Legal</option>
              <option value="Manufacturing, Transport & Logistics">
                Manufacturing, Transport & Logistics
              </option>
              <option value="Marketing & Communications">
                Marketing & Communications
              </option>
              <option value="Mining, Resources & Energy">
                Mining, Resources & Energy
              </option>
              <option value="Real Estate & Property">
                Real Estate & Property
              </option>
              <option value="Retail & Consumer Products">
                Retail & Consumer Products
              </option>
              <option value="Sales">Sales</option>
              <option value="Science & Technology">Science & Technology</option>
              <option value="Trades & Services">Trades & Services</option>
            </select>
            {errors.preferredClassification && (
              <p className="error-message">
                <i className="fas fa-exclamation-circle error-icon"></i>
                {errors.preferredClassification.message}
              </p>
            )}

            <div className="btn-container">
              <button type="submit" className="btn-save">
                Save
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
