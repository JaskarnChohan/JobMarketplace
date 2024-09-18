import React, { useState } from "react";
import { useForm } from "react-hook-form";
import Modal from "react-modal";
import { FaPencilAlt, FaPlus, FaTrashAlt } from "react-icons/fa";
import axios from "axios";
import "../../styles/profile/Profile.css";

Modal.setAppElement("#root");

const Skills = ({ skills, setSkills, formData }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const [skillModalIsOpen, setSkillModalIsOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [skillToDelete, setSkillToDelete] = useState(null);
  const [confirmationModalIsOpen, setConfirmationModalIsOpen] = useState(false);

  const openSkillModal = (skill = null) => {
    setEditingSkill(skill);

    if (skill) {
      reset(skill);
    } else {
      reset({
        name: "",
        level: "",
        description: "",
      });
    }

    setSkillModalIsOpen(true);
  };

  const closeSkillModal = () => {
    setSkillModalIsOpen(false);
    reset({});
  };

  const handleSkillSubmit = async (data) => {
    try {
      if (editingSkill) {
        const response = await axios.put(
          `http://localhost:5050/api/profile/${formData._id}/skill/${editingSkill._id}/update`,
          data,
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          }
        );
        setSkills((prevSkills) =>
          prevSkills.map((skill) =>
            skill._id === editingSkill._id ? response.data : skill
          )
        );
      } else {
        const response = await axios.post(
          `http://localhost:5050/api/profile/${formData._id}/skill/create`,
          data,
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          }
        );
        setSkills((prevSkills) => [...prevSkills, response.data]);
      }

      closeSkillModal();
    } catch (error) {
      console.error("Failed to save skill:", error);
    }
  };

  const handleDeleteSkill = async () => {
    try {
      await axios.delete(
        `http://localhost:5050/api/profile/${formData._id}/skill/${skillToDelete}/delete`,
        {
          withCredentials: true,
        }
      );

      setSkills((prevSkills) =>
        prevSkills.filter((skill) => skill._id !== skillToDelete)
      );
      closeConfirmationModal();
    } catch (error) {
      console.error("Failed to delete skill:", error);
    }
  };

  const openConfirmationModal = (skillId) => {
    setSkillToDelete(skillId);
    setConfirmationModalIsOpen(true);
  };

  const closeConfirmationModal = () => setConfirmationModalIsOpen(false);

  return (
    <div className="section">
      <h2 className="section-title">Skills</h2>
      <p className="section-text">List your skills and expertise.</p>
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
                <button
                  onClick={() => openSkillModal(skill)}
                  className="smallBtn btn-icon"
                >
                  <FaPencilAlt />
                </button>
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
      <button onClick={() => openSkillModal()} className="btn btn-primary">
        <FaPlus /> Add Skill
      </button>

      {/* Skill Modal */}
      <Modal
        isOpen={skillModalIsOpen}
        onRequestClose={closeSkillModal}
        className="modal-wrapper"
      >
        <div className="modal">
          <h1 className="lrg-heading">
            {editingSkill ? "Edit Skill" : "Add Skill"}
          </h1>
          <form onSubmit={handleSubmit(handleSkillSubmit)} className="form">
            <label htmlFor="name">Skill Name</label>
            <input
              type="text"
              id="name"
              {...register("name", { required: "Skill Name is required" })}
            />
            {errors.name && (
              <p className="error-message">
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
              <p className="error-message">
                <i className="fas fa-exclamation-circle error-icon"></i>
                {errors.level.message}
              </p>
            )}
            <label htmlFor="description">Description (Optional)</label>
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
              <p className="error-message">
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

      {/* Confirmation Modal */}
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
