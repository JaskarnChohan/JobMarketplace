import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import axios from "axios";
import Modal from "react-modal";
import "./ProfileForm.css";

const ProfileForm = () => {
  const { register, handleSubmit, formState: { errors }, control } = useForm();
  const [modalType, setModalType] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const openModal = (type) => {
    setModalType(type);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const handleModalSubmit = (data) => {
    console.log("Modal data:", data); 
    closeModal();
  };

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

      if (data.profilePhoto && data.profilePhoto.length > 0) {
        formData.append("profilePhoto", data.profilePhoto[0]);
      }

      if (data.cvFile && data.cvFile.length > 0) {
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
    <div className="profile-form">
      <div className="profile-picture" style={{ backgroundImage: `url('path/to/default-picture.jpg')` }}>
        <input type="file" {...register("profilePhoto")} />
      </div>

      <h2>Profile Information</h2>

      <form onSubmit={handleSubmit(onSubmit)}>
        <input
          type="text"
          {...register("fullName")}
          placeholder="Full Name"
        />
        {errors.fullName && <p>{errors.fullName.message}</p>}

        <input
          type="text"
          {...register("location")}
          placeholder="Location"
        />
        {errors.location && <p>{errors.location.message}</p>}

        <input
          type="email"
          {...register("email")}
          placeholder="Email"
        />
        {errors.email && <p>{errors.email.message}</p>}

        <input
          type="text"
          {...register("jobPreferences")}
          placeholder="Jobs you're looking for"
        />
        {errors.jobPreferences && <p>{errors.jobPreferences.message}</p>}

        <input
          type="text"
          {...register("skills")}
          placeholder="Skills"
        />
        {errors.skills && <p>{errors.skills.message}</p>}

        <input
          type="text"
          {...register("education")}
          placeholder="Education"
        />
        {errors.education && <p>{errors.education.message}</p>}

        <input
          type="text"
          {...register("experience")}
          placeholder="Experience"
        />
        {errors.experience && <p>{errors.experience.message}</p>}

        <input
          type="text"
          {...register("certifications")}
          placeholder="Achievements/Certifications"
        />
        {errors.certifications && <p>{errors.certifications.message}</p>}

        <input
          type="file"
          {...register("cvFile")}
          accept=".pdf,.doc,.docx"
        />
        <p>Upload CV (optional)</p>

        <button type="button" onClick={() => openModal("experience")}>Add Experience</button>
        <button type="button" onClick={() => openModal("skills")}>Add Skills</button>
        <button type="button" onClick={() => openModal("education")}>Add Education</button>

        <button type="submit">Save Profile</button>
      </form>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Add Details"
        className="modal"
        overlayClassName="modal-overlay"
      >
        <h2>
          {modalType === "experience" && "Add Experience"}
          {modalType === "skills" && "Add Skills"}
          {modalType === "education" && "Add Education"}
        </h2>

        {modalType === "experience" && (
          <form onSubmit={handleSubmit(handleModalSubmit)}>
            <Controller
              name="jobTitle"
              control={control}
              defaultValue=""
              render={({ field }) => <input {...field} placeholder="Job Title" />}
            />
            <Controller
              name="company"
              control={control}
              defaultValue=""
              render={({ field }) => <input {...field} placeholder="Company" />}
            />
            <Controller
              name="timeWorked"
              control={control}
              defaultValue=""
              render={({ field }) => <input {...field} placeholder="Time Worked" />}
            />
            <Controller
              name="description"
              control={control}
              defaultValue=""
              render={({ field }) => <textarea {...field} placeholder="Description" />}
            />
            <button type="submit">Submit Experience</button>
          </form>
        )}

        {modalType === "skills" && (
          <form onSubmit={handleSubmit(handleModalSubmit)}>
            <Controller
              name="skill"
              control={control}
              defaultValue=""
              render={({ field }) => <input {...field} placeholder="Skill" />}
            />
            <button type="submit">Submit Skill</button>
          </form>
        )}

        {modalType === "education" && (
          <form onSubmit={handleSubmit(handleModalSubmit)}>
            <Controller
              name="education"
              control={control}
              defaultValue=""
              render={({ field }) => <input {...field} placeholder="Education" />}
            />
            <button type="submit">Submit Education</button>
          </form>
        )}

        <button onClick={closeModal}>Close</button>
      </Modal>
    </div>
  );
};

export default ProfileForm;
