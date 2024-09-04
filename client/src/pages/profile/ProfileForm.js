import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import "./ProfileForm.css";

const ProfileForm = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    fullName: "",
    email: user?.email || "",
    location: "",
    jobPreferences: "",
    profilePhoto: "",
    skills: "",
    education: "",
    experience: "",
    certifications: "",
    cvFile: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`/api/profile/user/${user._id}`);
        setProfile(res.data);
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };
    fetchProfile();
  }, [user]);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      for (const key in profile) {
        formData.append(key, profile[key]);
      }
      await axios.put(`/api/profile/user/${user._id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="profile-form">
      <input
        type="text"
        name="fullName"
        value={profile.fullName}
        onChange={handleChange}
        placeholder="Full Name"
      />
      <input
        type="email"
        name="email"
        value={profile.email}
        onChange={handleChange}
        placeholder="Email"
        disabled
      />
      <input
        type="text"
        name="location"
        value={profile.location}
        onChange={handleChange}
        placeholder="Location"
      />
      <input
        type="text"
        name="jobPreferences"
        value={profile.jobPreferences}
        onChange={handleChange}
        placeholder="Jobs You're Looking For"
      />
      <input
        type="text"
        name="skills"
        value={profile.skills}
        onChange={handleChange}
        placeholder="Skills"
      />
      <textarea
        name="education"
        value={profile.education}
        onChange={handleChange}
        placeholder="Education"
      />
      <textarea
        name="experience"
        value={profile.experience}
        onChange={handleChange}
        placeholder="Work Experience"
      />
      <textarea
        name="certifications"
        value={profile.certifications}
        onChange={handleChange}
        placeholder="Achievements/Certifications"
      />
      <input
        type="file"
        name="profilePhoto"
        onChange={handleFileChange}
        accept="image/*"
        placeholder="Profile Photo"
      />
      <input
        type="file"
        name="cvFile"
        onChange={handleFileChange}
        accept=".pdf,.doc,.docx"
        placeholder="Upload CV"
      />
      <button type="submit">Save Profile</button>
    </form>
  );
};

export default ProfileForm;