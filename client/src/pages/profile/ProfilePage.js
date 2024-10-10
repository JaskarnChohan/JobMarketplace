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

const ProfilePage = () => {
  const [formData, setFormData] = useState({});
  const [experiences, setExperiences] = useState([]);
  const [educations, setEducations] = useState([]);
  const [skills, setSkills] = useState([]);
  const [profileExists, setProfileExists] = useState(false); // Track if a profile exists
  const [loading, setLoading] = useState(true); // Loading state for fetching data
  const { logout, isEmployer } = useAuth(); // Context for authentication
  const navigate = useNavigate(); // For navigating between routes

  const handleLogout = () => {
    logout(); // Call logout function from context
    navigate("/"); // Redirect to home page after logout
  };

  // Function to fetch profile data depending on the user's type (employer/job seeker)
  const fetchProfileData = async () => {
    setLoading(true); // Start loading while fetching data
    try {
      if (isEmployer()) {
        // Fetch data for employer profile
        const response = await axios.get(
          "http://localhost:5050/api/employer/profile/fetch",
          { withCredentials: true } // Ensure credentials (cookies) are included in request
        );

        if (response.data) {
          setFormData(response.data); // Set fetched data to formData state
          setProfileExists(!!response.data._id); // Check if profile exists
        }
      } else {
        // Fetch data for job seeker profile
        const response = await axios.get(
          "http://localhost:5050/api/profile/fetch",
          { withCredentials: true }
        );

        if (response.data) {
          setFormData(response.data); // Set profile data
          if (response.data._id) {
            setProfileExists(true); // If profile exists, set the state
            fetchExperiences(response.data._id); // Fetch related experiences
            fetchEducations(response.data._id); // Fetch related education data
            fetchSkills(response.data._id); // Fetch related skills
            fetchResume(response.data._id); // Fetch resume
          } else {
            setProfileExists(false); // No profile exists
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch profile data:", error);
    } finally {
      setLoading(false); // Stop loading when data fetch is done
    }
  };

  // Fetch job seeker experiences
  const fetchExperiences = async (profileId) => {
    try {
      const response = await axios.get(
        `http://localhost:5050/api/profile/${profileId}/experience/fetch`,
        { withCredentials: true }
      );
      setExperiences(response.data); // Set fetched experiences data
    } catch (error) {
      console.error("Failed to fetch experiences:", error);
    }
  };

  // Fetch job seeker education
  const fetchEducations = async (profileId) => {
    try {
      const response = await axios.get(
        `http://localhost:5050/api/profile/${profileId}/education/fetch`,
        { withCredentials: true }
      );
      setEducations(response.data); // Set fetched education data
    } catch (error) {
      console.error("Failed to fetch educations:", error);
    }
  };

  // Fetch job seeker skills
  const fetchSkills = async (profileId) => {
    try {
      const response = await axios.get(
        `http://localhost:5050/api/profile/${profileId}/skill/fetch`,
        { withCredentials: true }
      );
      setSkills(response.data); // Set fetched skills data
    } catch (error) {
      console.error("Failed to fetch skills:", error);
    }
  };

  // Fetch job seeker resume
  const fetchResume = async (profileId) => {
    try {
      const response = await axios.get(
        `http://localhost:5050/api/profile/resume/fetch`,
        { withCredentials: true }
      );
      setFormData((prevData) => ({
        ...prevData,
        resume: response.data.resume, // Add resume data to the formData state
      }));
    } catch (error) {
      console.error("Failed to fetch resume:", error);
    }
  };

  useEffect(() => {
    fetchProfileData(); // Fetch profile data when component mounts
  }, []);

  // Handle profile update and re-fetch data after any changes
  const handleProfileUpdate = async () => {
    fetchProfileData();
  };

  return (
    <div>
      {/* Navbar with logout button */}
      <Navbar isAuthenticated={true} handleLogout={handleLogout} />

      {loading ? (
        <Spinner /> // Show spinner when loading
      ) : (
        <div className="profile-container">
          {/* Render employer or job seeker profile depending on user type */}
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
                  {/* Render experiences, education, skills, and resume upload if profile exists */}
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
                    profileId={formData._id}
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
      {/* Footer at the bottom of the page */}
      <Footer />
    </div>
  );
};

export default ProfilePage;
