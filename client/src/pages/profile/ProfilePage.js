import React, { useState, useEffect } from "react";
import axios from "axios";
import ProfileInformation from "./ProfileInformation";
import Experience from "./Experience";
import Education from "./Education";
import Skills from "./Skills";
import ResumeUpload from "./ResumeUpload";
import Navbar from "../../components/header/Navbar";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Spinner from "../../components/Spinner/Spinner";

const ProfilePage = ({ onProfileUpdate }) => {
  const [formData, setFormData] = useState({});
  const [experiences, setExperiences] = useState([]);
  const [educations, setEducations] = useState([]);
  const [skills, setSkills] = useState([]);
  const [profileExists, setProfileExists] = useState(false);
  const [loading, setLoading] = useState(true);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "http://localhost:5050/api/profile/fetch",
        {
          withCredentials: true,
        }
      );

      if (response.data) {
        setFormData(response.data);
        if (response.data._id) {
          setProfileExists(true);
          fetchExperiences(response.data._id);
          fetchEducations(response.data._id);
          fetchSkills(response.data._id);
          fetchResume(response.data._id);
        } else {
          setProfileExists(false);
        }
      }
    } catch (error) {
      console.error("Failed to fetch profile data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchExperiences = async (profileId) => {
    try {
      const response = await axios.get(
        `http://localhost:5050/api/profile/${profileId}/experience/fetch`,
        { withCredentials: true }
      );
      setExperiences(response.data);
    } catch (error) {
      console.error("Failed to fetch experiences:", error);
    }
  };

  const fetchEducations = async (profileId) => {
    try {
      const response = await axios.get(
        `http://localhost:5050/api/profile/${profileId}/education/fetch`,
        { withCredentials: true }
      );
      setEducations(response.data);
    } catch (error) {
      console.error("Failed to fetch educations:", error);
    }
  };

  const fetchSkills = async (profileId) => {
    try {
      const response = await axios.get(
        `http://localhost:5050/api/profile/${profileId}/skill/fetch`,
        { withCredentials: true }
      );
      setSkills(response.data);
    } catch (error) {
      console.error("Failed to fetch skills:", error);
    }
  };

  const fetchResume = async (profileId) => {
    try {
      const response = await axios.get(
        `http://localhost:5050/api/profile/resume/fetch`,
        { withCredentials: true }
      );
      setFormData((prevData) => ({
        ...prevData,
        resume: response.data.resume,
      }));
    } catch (error) {
      console.error("Failed to fetch resume:", error);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const handleProfileUpdate = async () => {
    fetchProfileData();
  };

  return (
    <div>
      <Navbar isAuthenticated={true} handleLogout={handleLogout} />

      {loading ? (
        <Spinner />
      ) : (
        <div className="profile-container">
          <ProfileInformation
            formData={formData}
            setFormData={setFormData}
            profileExists={profileExists}
            onProfileUpdate={handleProfileUpdate}
          />
          {profileExists && (
            <>
              <Experience
                experiences={experiences}
                setExperiences={setExperiences}
                formData={formData}
                onProfileUpdate={handleProfileUpdate}
              />
              <Education
                educations={educations}
                setEducations={setEducations}
                formData={formData}
                onProfileUpdate={handleProfileUpdate}
              />
              <Skills
                skills={skills}
                setSkills={setSkills}
                formData={formData}
                onProfileUpdate={handleProfileUpdate}
              />
              <ResumeUpload
                firstName={formData.firstName}
                lastName={formData.lastName}
                formData={formData}
                onProfileUpdate={handleProfileUpdate}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
