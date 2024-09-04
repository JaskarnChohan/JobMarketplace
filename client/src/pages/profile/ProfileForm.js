import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

const ProfileForm = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    fullName: "",
    location: "",
    phoneNumber: "",
    bio: "",
    profilePhoto: "",
    cvFile: "",
    skills: [],
    education: [],
    jobPreferences: "",
    experience: [],
    certifications: [],
  });

  useEffect(() => {
    
    const fetchProfile = async () => {
      const res = await axios.get(`/api/profile/user/${user._id}`);
      setProfile(res.data);
    };
    fetchProfile();
  }, [user]);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.put(`/api/profile/user/${user._id}`, profile);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="fullName"
        value={profile.fullName}
        onChange={handleChange}
        placeholder="Full Name"
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
        name="phoneNumber"
        value={profile.phoneNumber}
        onChange={handleChange}
        placeholder="Phone Number"
      />
      <textarea
        name="bio"
        value={profile.bio}
        onChange={handleChange}
        placeholder="Short Bio"
      />
      <button type="submit">Save Profile</button>
    </form>
  );
};

export default ProfileForm;