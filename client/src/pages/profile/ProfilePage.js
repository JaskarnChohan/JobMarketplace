import React, { useState, useEffect } from "react";
import axios from "axios";
import ProfileInformation from "./job-seeker/ProfileInformation";
import Experience from "./job-seeker/Experience";
import Education from "./job-seeker/Education";
import Skills from "./job-seeker/Skills";
import ResumeUpload from "./job-seeker/ResumeUpload";
import EmployerProfileInformation from "./employer/EmployerProfileInformation";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
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
  const { logout, isEmployer } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Fetch profile data based on whether the user is an employer or job seeker
  const fetchProfileData = async () => {
    setLoading(true);
    try {
      if (isEmployer()) {
        // Fetch employer profile data
        const response = await axios.get(
          "http://localhost:5050/api/employer/profile/fetch", // Employer profile API
          {
            withCredentials: true,
          }
        );

        if (response.data) {
          setFormData(response.data);
          if (response.data._id) {
            setProfileExists(true);
            // Add any additional employer-specific data fetches here if necessary
          } else {
            setProfileExists(false);
          }
        }
      } else {
        // Fetch job seeker profile data
        const response = await axios.get(
          "http://localhost:5050/api/profile/fetch", // Job seeker profile API
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
          {/* Conditional Rendering based on Employer or Job Seeker */}
          {isEmployer() ? (
            <EmployerProfileInformation
              formData={formData}
              setFormData={setFormData}
              profileExists={profileExists}
              onProfileUpdate={handleProfileUpdate}
            />
          ) : (
            <>
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
            </>
          )}
        </div>
      )}
      <Footer />
    </div>
  );
};

export default ProfilePage;
