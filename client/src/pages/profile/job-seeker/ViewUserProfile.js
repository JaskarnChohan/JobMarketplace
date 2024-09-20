import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhone,
  FaBriefcase,
  FaFileAlt,
  FaDownload,
} from "react-icons/fa";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Navbar from "../../../components/layout/Navbar";
import Spinner from "../../../components/Spinner/Spinner";
import Footer from "../../../components/layout/Footer";
import profileImage from "../../../assets/profile.png";
import "../../../styles/profile/Profile.css";
import "../../../styles/profile/ProfileInfo.css";
import "../../../styles/Global.css";

const ViewUserProfile = () => {
  const { id } = useParams();
  const [profileData, setProfileData] = useState(null);

  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5050/api/profile/user/${id}`,
          { withCredentials: true }
        );
        setProfileData(response.data);
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };

    fetchProfileData();
  }, [id]);

  // If profileData is not fetched yet, display a spinner
  if (!profileData) {
    return <Spinner />;
  }

  // Logout function
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const { skills = [], experiences = [], educations = [] } = profileData;
  const fullName = `${profileData.firstName} ${profileData.lastName}`;

  return (
    <div>
      {/* Navbar with logout button */}
      <Navbar isAuthenticated={true} handleLogout={handleLogout} />
      <div>
        <div className="profile-information-container">
          <div className="profile-header">
            <div className="profile-picture-container">
              <div className="profile-picture-wrapper">
                <img
                  src={
                    profileData.profilePicture
                      ? `http://localhost:5050/${profileData.profilePicture}`
                      : profileImage
                  }
                  alt="Profile"
                  className="profile-picture"
                />
              </div>
            </div>

            <div className="profile-info">
              <div className="profile-info-details">
                <h1 className="profile-name">{fullName}</h1>

                {profileData.homeLocation && (
                  <p className="profile-location">
                    <FaMapMarkerAlt /> {profileData.homeLocation}
                  </p>
                )}

                {profileData.email && (
                  <p className="profile-email">
                    <FaEnvelope /> {profileData.email}
                  </p>
                )}

                {profileData.phoneNumber && (
                  <p className="profile-phone">
                    <FaPhone /> {profileData.phoneNumber}
                  </p>
                )}

                {profileData.preferredClassification && (
                  <p className="profile-classification">
                    <FaBriefcase /> {profileData.preferredClassification}
                  </p>
                )}

                {profileData.bio && (
                  <p className="profile-bio">{profileData.bio}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Experience Section */}
        <div className="section">
          <h2 className="section-title">Experience</h2>
          {experiences.length === 0 ? (
            <p className="section-text">
              {fullName} has not listed any experiences.
            </p>
          ) : (
            <ul className="list">
              {experiences.map((experience) => (
                <li key={experience._id} className="card">
                  <div className="card-content">
                    <div className="card-info">
                      <h3 className="med-title">{experience.title}</h3>
                      <p className="company-name">{experience.company}</p>
                      <p className="duration">
                        {experience.startMonth} {experience.startYear} -{" "}
                        {experience.current
                          ? "Present"
                          : `${experience.endMonth} ${experience.endYear}`}
                      </p>
                      <p className="description">{experience.description}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Education Section */}
        <div className="section">
          <h2 className="section-title">Education</h2>
          {educations.length === 0 ? (
            <p className="section-text">
              {fullName} has not listed any educational background.
            </p>
          ) : (
            <ul className="list">
              {educations.map((education) => (
                <li key={education._id} className="card">
                  <div className="card-content">
                    <div className="card-info">
                      <h3 className="card-title">{education.school}</h3>
                      <p className="med-title">
                        {education.degree} - {education.fieldOfStudy}
                      </p>
                      <p className="duration">
                        {education.startMonth} {education.startYear} -{" "}
                        {education.current
                          ? "Present"
                          : `${education.endMonth} ${education.endYear}`}
                      </p>
                      <p className="description">{education.description}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Skills Section */}
        <div className="section">
          <h2 className="section-title">Skills</h2>
          {skills.length === 0 ? (
            <p className="section-text">
              {fullName} has not listed any skills.
            </p>
          ) : (
            <ul className="list">
              {skills.map((skill) => (
                <li key={skill._id} className="card">
                  <div className="card-content">
                    <div className="card-info">
                      <h3 className="card-title">{skill.name}</h3>
                      <p className="med-title">Level: {skill.level}</p>
                      <p className="description">{skill.description}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Resume Section */}
        <div className="section">
          <h2 className="section-title">Resume Upload</h2>
          {profileData.resume ? (
            <div className="resume-card last">
              <div className="resume-card-content">
                <div className="resume-card-icon">
                  <FaFileAlt size={50} />
                </div>
                <div className="resume-card-info">
                  <h3 className="resume-card-title">
                    {`${profileData.firstName} ${profileData.lastName}'s Resume`}
                  </h3>
                </div>
                <div className="resume-card-actions">
                  <a
                    href={`http://localhost:5050/${profileData.resume}`}
                    download
                    className="btn resume-btn"
                  >
                    <FaDownload />
                    <span>Download</span>
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <p className="section-text">
              {fullName} has not uploaded a resume.
            </p>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ViewUserProfile;
