import React, { useState } from "react";
import { useForm } from "react-hook-form";
import Modal from "react-modal";
import axios from "axios";
import { FaPencilAlt, FaPlus, FaTrashAlt } from "react-icons/fa";
import "../../../styles/profile/Profile.css";

Modal.setAppElement("#root");

// Valid months array for dropdowns
const validMonths = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const Experience = ({ experiences, setExperiences, formData }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  // State variables for modals and editing
  const [experienceModalIsOpen, setExperienceModalIsOpen] = useState(false);
  const [editingExperience, setEditingExperience] = useState(null);
  const [isCurrentlyEmployed, setIsCurrentlyEmployed] = useState(false);
  const [experienceToDelete, setExperienceToDelete] = useState(null);
  const [confirmationModalIsOpen, setConfirmationModalIsOpen] = useState(false);
  const [startDateError, setStartDateError] = useState("");
  const [endDateError, setEndDateError] = useState("");

  // States for start and end month/year
  const [startMonth, setStartMonth] = useState("");
  const [startYear, setStartYear] = useState("");
  const [endMonth, setEndMonth] = useState("");
  const [endYear, setEndYear] = useState("");

  // Open experience modal for adding or editing experience
  const openExperienceModal = (experience = null) => {
    setEditingExperience(experience);
    setIsCurrentlyEmployed(experience?.current || false);

    if (experience) {
      // Convert stored month values to match dropdown options format
      const normalizeMonth = (month) => {
        const monthIndex = validMonths.findIndex((m) => m === month);
        return monthIndex >= 0 ? validMonths[monthIndex] : "";
      };

      // Set start date values
      const startMonth = normalizeMonth(experience.startMonth);
      const startYear = experience.startYear;

      if (!startMonth || !startYear) {
        console.error("Start month or year is missing or invalid");
        return;
      }

      setStartMonth(startMonth);
      setStartYear(startYear);

      // Handle end date values if not currently employed
      if (experience.current) {
        setEndMonth("");
        setEndYear("");
      } else {
        const endMonth = normalizeMonth(experience.endMonth);
        const endYear = experience.endYear;

        setEndMonth(endMonth);
        setEndYear(endYear);
      }

      // Prepare the formatted experience object
      const formattedExperience = {
        ...experience,
        startMonth: startMonth,
        startYear: startYear,
        endMonth: experience.current ? "" : normalizeMonth(experience.endMonth),
        endYear: experience.current ? "" : experience.endYear,
      };

      reset(formattedExperience);
    } else {
      // Reset the form if no experience is provided
      reset({
        title: "",
        company: "",
        startMonth: "",
        startYear: "",
        endMonth: "",
        endYear: "",
        description: "",
      });
      setStartMonth("");
      setStartYear("");
      setEndMonth("");
      setEndYear("");
      setStartDateError("");
      setEndDateError("");
    }

    setExperienceModalIsOpen(true);
  };

  // Close the experience modal
  const closeExperienceModal = () => {
    setExperienceModalIsOpen(false);
    reset({});
  };

  // Handle changes in the "Currently Employed" checkbox
  const handleCheckboxChange = (e) => {
    const isChecked = e.target.checked;
    setIsCurrentlyEmployed(isChecked);
    if (isChecked) {
      setEndMonth("");
      setEndYear("");
    }
  };

  // Validate start and end dates
  const validateDates = (
    startMonth,
    startYear,
    endMonth,
    endYear,
    isCurrentlyEmployed
  ) => {
    const currentDate = new Date();
    const startDate = new Date(`${startMonth} 1, ${startYear}`);

    let errors = {
      startDateError: "",
      endDateError: "",
    };

    // Validate start date is not in the future
    if (startDate > currentDate) {
      errors.startDateError = "Start date cannot be in the future.";
    }

    if (!isCurrentlyEmployed) {
      const endDate = new Date(`${endMonth} 1, ${endYear}`);

      // Validate end date is not before start date
      if (endDate < startDate) {
        errors.endDateError = "End date cannot be before start date.";
      }
    }

    return errors;
  };

  // Handle form submission for experience
  const handleExperienceSubmit = async (data) => {
    const { startDateError, endDateError } = validateDates(
      startMonth,
      startYear,
      endMonth,
      endYear,
      isCurrentlyEmployed
    );

    // Set state for error messages
    setStartDateError(startDateError || "");
    setEndDateError(endDateError || "");

    // Exit early if there are validation errors
    if (startDateError || endDateError) {
      return;
    }

    try {
      // Set employment status in data
      if (isCurrentlyEmployed) {
        data.current = true;
      } else {
        data.current = false;
        data.endMonth = endMonth;
        data.endYear = endYear;
      }

      const experience = {
        ...data,
        profileId: formData._id,
      };

      if (editingExperience) {
        // Update existing experience
        const response = await axios.put(
          `http://localhost:5050/api/profile/${formData._id}/experience/${editingExperience._id}/update`,
          experience,
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          }
        );
        setExperiences((prevExperiences) =>
          prevExperiences.map((exp) =>
            exp._id === editingExperience._id ? response.data : exp
          )
        );
      } else {
        // Create new experience
        const response = await axios.post(
          `http://localhost:5050/api/profile/${formData._id}/experience/create`,
          experience,
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          }
        );
        setExperiences((prevExperiences) => [
          ...prevExperiences,
          response.data,
        ]);
      }

      closeExperienceModal();
    } catch (error) {
      console.error("Failed to save experience:", error);
    }
  };

  // Handle experience deletion
  const handleDeleteExperience = async () => {
    try {
      await axios.delete(
        `http://localhost:5050/api/profile/${formData._id}/experience/${experienceToDelete}/delete`,
        {
          withCredentials: true,
        }
      );

      setExperiences((prevExperiences) =>
        prevExperiences.filter((exp) => exp._id !== experienceToDelete)
      );
      closeConfirmationModal();
    } catch (error) {
      console.error("Failed to delete experience:", error);
    }
  };

  // Open confirmation modal for deletion
  const openConfirmationModal = (experienceId) => {
    setExperienceToDelete(experienceId);
    setConfirmationModalIsOpen(true);
  };

  // Close confirmation modal
  const closeConfirmationModal = () => setConfirmationModalIsOpen(false);

  // Generate month and year options for dropdowns
  const generateOptions = (type) => {
    const options = [];
    if (type === "month") {
      validMonths.forEach((month, index) => {
        options.push(
          <option key={month} value={month}>
            {month}
          </option>
        );
      });
    } else if (type === "year") {
      const currentYear = new Date().getFullYear();
      for (let i = currentYear; i >= 1900; i--) {
        options.push(
          <option key={i} value={i}>
            {i}
          </option>
        );
      }
    }
    return options;
  };

  return (
    <div className="section">
      <h2 className="section-title">Experience</h2>
      <p className="section-text">
        Tell employers about your current and past experiences.
      </p>
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
                    : experience.endMonth + " " + experience.endYear}
                </p>
                <p className="description">{experience.description}</p>
              </div>
              <div className="card-actions">
                <button
                  onClick={() => openExperienceModal(experience)}
                  className="smallBtn btn-icon"
                >
                  <FaPencilAlt />
                </button>
                <button
                  onClick={() => openConfirmationModal(experience._id)}
                  className="smallBtn btn-icon"
                >
                  <FaTrashAlt />
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <button onClick={() => openExperienceModal()} className="btn btn-primary">
        <FaPlus /> Add Experience
      </button>

      {/* Experience Modal */}
      <Modal
        isOpen={experienceModalIsOpen}
        onRequestClose={closeExperienceModal}
        className="modal-wrapper"
      >
        <div className="modal">
          <h1 className="lrg-heading">
            {editingExperience ? "Edit Experience" : "Add Experience"}
          </h1>
          <form onSubmit={handleSubmit(handleExperienceSubmit)}>
            <label htmlFor="title">Job Title</label>
            <input
              id="title"
              type="text"
              {...register("title", { required: "Job title is required" })}
              className={errors.title ? "error" : ""}
            />
            {errors.title && (
              <p className="error-messages">
                <i className="fas fa-exclamation-circle error-icon"></i>
                {errors.title.message}
              </p>
            )}
            <label htmlFor="company">Company</label>
            <input
              id="company"
              type="text"
              {...register("company", { required: "Company is required" })}
              className={errors.company ? "error" : ""}
            />
            {errors.company && (
              <p className="error-messages">
                <i className="fas fa-exclamation-circle error-icon"></i>
                {errors.company.message}
              </p>
            )}
            <label htmlFor="startDate">Start Date</label>
            <div className="date-selector">
              <select
                id="startMonth"
                {...register("startMonth", {
                  required: "Start month is required",
                })}
                value={startMonth}
                onChange={(e) => setStartMonth(e.target.value)}
              >
                <option value="">Month</option>
                {generateOptions("month")}
              </select>
              <select
                id="startYear"
                {...register("startYear", {
                  required: "Start year is required",
                })}
                value={startYear}
                onChange={(e) => setStartYear(e.target.value)}
              >
                <option value="">Year</option>
                {generateOptions("year")}
              </select>
            </div>
            {errors.startMonth && (
              <p className="error-messages">
                <i className="fas fa-exclamation-circle error-icon"></i>
                {errors.startMonth.message}
              </p>
            )}
            {errors.startYear && (
              <p className="error-messages">
                <i className="fas fa-exclamation-circle error-icon"></i>
                {errors.startYear.message}
              </p>
            )}
            {startDateError && (
              <p className="error-messages">
                <i className="fas fa-exclamation-circle error-icon"></i>
                {startDateError}
              </p>
            )}
            {!isCurrentlyEmployed && (
              <>
                <label htmlFor="endDate">End Date</label>
                <div className="date-selector">
                  <select
                    id="endMonth"
                    value={endMonth}
                    {...register("endMonth", {
                      required: !isCurrentlyEmployed && "End month is required",
                    })}
                    onChange={(e) => setEndMonth(e.target.value)}
                    disabled={isCurrentlyEmployed}
                  >
                    <option value="">Month</option>
                    {generateOptions("month")}
                  </select>
                  <select
                    id="endYear"
                    value={endYear}
                    {...register("endYear", {
                      required: !isCurrentlyEmployed && "End year is required",
                    })}
                    onChange={(e) => setEndYear(e.target.value)}
                    disabled={isCurrentlyEmployed}
                  >
                    <option value="">Year</option>
                    {generateOptions("year")}
                  </select>
                </div>
                {errors.endMonth && (
                  <p className="error-messages">
                    <i className="fas fa-exclamation-circle error-icon"></i>
                    {errors.endMonth.message}
                  </p>
                )}
                {errors.endYear && (
                  <p className="error-messages">
                    <i className="fas fa-exclamation-circle error-icon"></i>
                    {errors.endYear.message}
                  </p>
                )}
                {endDateError && (
                  <p className="error-messages">
                    <i className="fas fa-exclamation-circle error-icon"></i>
                    {endDateError}
                  </p>
                )}
              </>
            )}
            <label className="checkbox">
              <input
                type="checkbox"
                checked={isCurrentlyEmployed}
                onChange={handleCheckboxChange}
              />
              Currently Employed
            </label>
            <label htmlFor="description">
              Job Description<p className="sub-text">(Optional)</p>
            </label>
            <p className="sub-text">Describe your role and responsibilities</p>
            <textarea
              id="description"
              {...register("description")}
              className={errors.description ? "error" : ""}
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
                onClick={closeExperienceModal}
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
          <h1 className="lrg-heading">Delete Experience</h1>
          <p className="med-text">
            Are you sure you want to delete this experience?
          </p>
          <div className="btn-container">
            <button onClick={handleDeleteExperience} className="btn-delete">
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

export default Experience;
