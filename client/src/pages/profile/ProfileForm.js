import React from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import "./ProfileForm.css";

const ProfileForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      formData.append("fullName", data.fullName);
      formData.append("location", data.location);
      formData.append("email", data.email);
      formData.append("jobPreferences", data.jobPreferences);
      formData.append("skills", data.skills);
      formData.append("education", data.education);
      formData.append("experience", data.experience);
      formData.append("certifications", data.certifications);

      if (data.profilePhoto[0]) {
        formData.append("profilePhoto", data.profilePhoto[0]);
      }

      if (data.cvFile[0]) {
        formData.append("cvFile", data.cvFile[0]);
      }

      
      const response = await axios.put(`/api/profile/user/${data.userId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        type="text"
        {...register("fullName", { required: "Full Name is required" })}
        placeholder="Full Name"
      />
      {errors.fullName && <p>{errors.fullName.message}</p>}

      <input
        type="text"
        {...register("location", { required: "Location is required" })}
        placeholder="Location"
      />
      {errors.location && <p>{errors.location.message}</p>}

      <input
        type="email"
        {...register("email", { required: "Email is required" })}
        placeholder="Email"
      />
      {errors.email && <p>{errors.email.message}</p>}

      <input
        type="text"
        {...register("jobPreferences", { required: "Job preferences are required" })}
        placeholder="Jobs you're looking for"
      />
      {errors.jobPreferences && <p>{errors.jobPreferences.message}</p>}

      <input
        type="text"
        {...register("skills", { required: "Skills are required" })}
        placeholder="Skills"
      />
      {errors.skills && <p>{errors.skills.message}</p>}

      <input
        type="text"
        {...register("education", { required: "Education is required" })}
        placeholder="Education"
      />
      {errors.education && <p>{errors.education.message}</p>}

      <input
        type="text"
        {...register("experience", { required: "Experience is required" })}
        placeholder="Experience"
      />
      {errors.experience && <p>{errors.experience.message}</p>}

      <input
        type="text"
        {...register("certifications", { required: "Certifications are required" })}
        placeholder="Achievements/Certifications"
      />
      {errors.certifications && <p>{errors.certifications.message}</p>}

      <input
        type="file"
        {...register("profilePhoto")}
        accept="image/*"
      />
      <p>Upload Profile Picture</p>

      <input
        type="file"
        {...register("cvFile")}
        accept=".pdf,.doc,.docx"
      />
      <p>Upload CV</p>

      <button type="submit">Save Profile</button>
    </form>
  );
};

export default ProfileForm;