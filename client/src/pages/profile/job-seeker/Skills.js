import React, { useState } from "react";
import { useForm } from "react-hook-form";
import Modal from "react-modal";
import { FaPencilAlt, FaPlus, FaTrashAlt } from "react-icons/fa";
import axios from "axios";
import "../../../styles/profile/Profile.css";

// Set root element for modal accessibility
Modal.setAppElement("#root");

const Skills = ({ skills, setSkills, formData }) => {
  // Destructuring react-hook-form methods for managing form input and validation
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  // Modal state management
  const [skillModalIsOpen, setSkillModalIsOpen] = useState(false); // Tracks if skill modal is open
  const [editingSkill, setEditingSkill] = useState(null); // Tracks skill being edited, if any
  const [skillToDelete, setSkillToDelete] = useState(null); // Tracks which skill is being deleted
  const [confirmationModalIsOpen, setConfirmationModalIsOpen] = useState(false); // Manages confirmation modal visibility

  // Opens the modal for adding or editing a skill
  const openSkillModal = (skill = null) => {
    setEditingSkill(skill); // Set the skill to edit, or null for a new skill

    // If editing an existing skill, pre-fill the form with skill data, otherwise reset the form
    if (skill) {
      reset(skill);
    } else {
      reset({
        name: "",
        level: "",
        description: "",
      });
    }

    setSkillModalIsOpen(true); // Open the modal
  };

  // Closes the skill modal and resets the form
  const closeSkillModal = () => {
    setSkillModalIsOpen(false);
    reset({});
  };

  // Handles form submission for creating or updating a skill
  const handleSkillSubmit = async (data) => {
    try {
      // If editing, send a PUT request to update the skill
      if (editingSkill) {
        const response = await axios.put(
          `http://localhost:5050/api/profile/${formData._id}/skill/${editingSkill._id}/update`,
          data,
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          }
        );
        // Update the skills list in state
        setSkills((prevSkills) =>
          prevSkills.map((skill) =>
            skill._id === editingSkill._id ? response.data : skill
          )
        );
      } else {
        // Otherwise, send a POST request to create a new skill
        const response = await axios.post(
          `http://localhost:5050/api/profile/${formData._id}/skill/create`,
          data,
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          }
        );
        // Add the new skill to the skills list
        setSkills((prevSkills) => [...prevSkills, response.data]);
      }

      closeSkillModal(); // Close the modal after submitting
    } catch (error) {
      console.error("Failed to save skill:", error);
    }
  };

  // Handles deleting a skill
  const handleDeleteSkill = async () => {
    try {
      // Send a DELETE request to remove the skill
      await axios.delete(
        `http://localhost:5050/api/profile/${formData._id}/skill/${skillToDelete}/delete`,
        {
          withCredentials: true,
        }
      );

      // Remove the deleted skill from the state
      setSkills((prevSkills) =>
        prevSkills.filter((skill) => skill._id !== skillToDelete)
      );
      closeConfirmationModal(); // Close confirmation modal after deletion
    } catch (error) {
      console.error("Failed to delete skill:", error);
    }
  };

  // Opens the confirmation modal for deleting a skill
  const openConfirmationModal = (skillId) => {
    setSkillToDelete(skillId); // Set the skill ID to be deleted
    setConfirmationModalIsOpen(true); // Open confirmation modal
  };

  // Closes the confirmation modal
  const closeConfirmationModal = () => setConfirmationModalIsOpen(false);

  return (
    <div className="section">
      <h2 className="section-title">Skills</h2>
      <p className="section-text">List your skills and expertise.</p>

      {/* Skill List */}
      <ul className="list">
        {skills.map((skill) => (
          <li key={skill._id} className="card">
            <div className="card-content">
              <div className="card-info">
                <h3 className="card-title">{skill.name}</h3>
                <p className="med-title">Level: {skill.level}</p>
                <p className="description">{skill.description}</p>
              </div>
              <div className="card-actions">
                {/* Edit Skill */}
                <button
                  onClick={() => openSkillModal(skill)}
                  className="smallBtn btn-icon"
                >
                  <FaPencilAlt />
                </button>
                {/* Delete Skill */}
                <button
                  onClick={() => openConfirmationModal(skill._id)}
                  className="smallBtn btn-icon"
                >
                  <FaTrashAlt />
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* Add Skill Button */}
      <button onClick={() => openSkillModal()} className="btn btn-primary">
        <FaPlus /> Add Skill
      </button>

      {/* Skill Modal for Add/Edit */}
      <Modal
        isOpen={skillModalIsOpen}
        onRequestClose={closeSkillModal}
        className="modal-wrapper"
      >
        <div className="modal">
          <h1 className="lrg-heading">
            {editingSkill ? "Edit Skill" : "Add Skill"}
          </h1>
          {/* Skill Form */}
          <form onSubmit={handleSubmit(handleSkillSubmit)} className="form">
            <label htmlFor="name">Skill Name</label>
            <input
              type="text"
              id="name"
              {...register("name", { required: "Skill Name is required" })}
            />
            {errors.name && (
              <p className="error-messages">
                <i className="fas fa-exclamation-circle error-icon"></i>
                {errors.name.message}
              </p>
            )}
            <label htmlFor="level">Level</label>
            <select
              id="level"
              {...register("level", { required: "Level is required" })}
            >
              <option value="">Select Level</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Expert">Expert</option>
            </select>
            {errors.level && (
              <p className="error-messages">
                <i className="fas fa-exclamation-circle error-icon"></i>
                {errors.level.message}
              </p>
            )}
            <label htmlFor="description">
              Description <p className="sub-text">(Optional)</p>
            </label>
            <textarea
              id="description"
              {...register("description", {
                maxLength: {
                  value: 500,
                  message: "Description cannot exceed 500 characters",
                },
              })}
            ></textarea>
            {errors.description && (
              <p className="error-messages">
                <i className="fas fa-exclamation-circle error-icon"></i>
                {errors.description.message}
              </p>
            )}
            <div className="btn-container">
              <button type="submit" className="btn-save">
                Save
              </button>
              <button
                type="button"
                className="btn-cancel"
                onClick={closeSkillModal}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Confirmation Modal for Deleting Skill */}
      <Modal
        isOpen={confirmationModalIsOpen}
        onRequestClose={closeConfirmationModal}
        className="modal-wrapper"
      >
        <div className="modal">
          <h1 className="lrg-heading">Delete Skill</h1>
          <p className="med-text">
            Are you sure you want to delete this skill entry?
          </p>
          <div className="btn-container">
            <button onClick={handleDeleteSkill} className="btn-delete">
              Delete
            </button>
            <button onClick={closeConfirmationModal} className="btn-cancel">
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Skills;
