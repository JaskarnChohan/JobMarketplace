import React, { useState } from "react";
import { useForm } from "react-hook-form";
import Modal from "react-modal";
import { FaPencilAlt, FaPlus, FaTrashAlt } from "react-icons/fa";
import axios from "axios";
import "../../../styles/profile/Profile.css";

Modal.setAppElement("#root");

// Define valid month names for dropdown selection
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

const Education = ({ educations, setEducations, formData }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  // State management for modals and education editing
  const [educationModalIsOpen, setEducationModalIsOpen] = useState(false);
  const [editingEducation, setEditingEducation] = useState(null);
  const [isCurrentlyStudying, setIsCurrentlyStudying] = useState(false);
  const [educationToDelete, setEducationToDelete] = useState(null);
  const [confirmationModalIsOpen, setConfirmationModalIsOpen] = useState(false);
  const [startDateError, setStartDateError] = useState("");
  const [endDateError, setEndDateError] = useState("");

  // State for managing month and year selections
  const [startMonth, setStartMonth] = useState("");
  const [startYear, setStartYear] = useState("");
  const [endMonth, setEndMonth] = useState("");
  const [endYear, setEndYear] = useState("");

  // Function to open the education modal for adding or editing
  const openEducationModal = (education = null) => {
    setEditingEducation(education);
    setIsCurrentlyStudying(education?.current || false);

    if (education) {
      // Normalize month to ensure consistent representation
      const normalizeMonth = (month) => {
        const monthIndex = validMonths.findIndex((m) => m === month);
        return monthIndex >= 0 ? validMonths[monthIndex] : "";
      };

      // Set start date values from the selected education
      const startMonth = normalizeMonth(education.startMonth);
      const startYear = education.startYear;

      if (!startMonth || !startYear) {
        console.error("Start month or year is missing or invalid");
        return;
      }

      setStartMonth(startMonth);
      setStartYear(startYear);

      // Handle end date values if currently studying
      if (education.current) {
        setEndMonth("");
        setEndYear("");
      } else {
        const endMonth = normalizeMonth(education.endMonth);
        const endYear = education.endYear;

        setEndMonth(endMonth);
        setEndYear(endYear);
      }

      const formattedEducation = {
        ...education,
        startMonth: startMonth,
        startYear: startYear,
        endMonth: education.current ? "" : normalizeMonth(education.endMonth),
        endYear: education.current ? "" : education.endYear,
      };

      reset(formattedEducation); // Reset form with formatted education data
    } else {
      // Reset form for new education entry
      reset({
        school: "",
        degree: "",
        fieldOfStudy: "",
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

    setEducationModalIsOpen(true); // Open the education modal
  };

  const closeEducationModal = () => {
    setEducationModalIsOpen(false);
    reset({}); // Reset form on close
  };

  // Handle checkbox for currently studying
  const handleCheckboxChange = (e) => {
    const isChecked = e.target.checked;
    setIsCurrentlyStudying(isChecked);
    if (isChecked) {
      setEndMonth(""); // Clear end date if currently studying
      setEndYear("");
    }
  };

  // Validate start and end dates
  const validateDates = (
    startMonth,
    startYear,
    endMonth,
    endYear,
    isCurrentlyStudying
  ) => {
    const currentDate = new Date();
    const startDate = new Date(`${startMonth} 1, ${startYear}`);

    let errors = {
      startDateError: "",
      endDateError: "",
    };

    if (startDate > currentDate) {
      errors.startDateError = "Start date cannot be in the future.";
    }

    if (!isCurrentlyStudying) {
      const endDate = new Date(`${endMonth} 1, ${endYear}`);

      if (endDate < startDate) {
        errors.endDateError = "End date cannot be before start date.";
      }
    }

    return errors; // Return any validation errors
  };

  // Handle form submission for education
  const handleEducationSubmit = async (data) => {
    const { startDateError, endDateError } = validateDates(
      startMonth,
      startYear,
      endMonth,
      endYear,
      isCurrentlyStudying
    );

    setStartDateError(startDateError || "");
    setEndDateError(endDateError || "");

    if (startDateError || endDateError) {
      return; // Exit if there are validation errors
    }

    try {
      if (isCurrentlyStudying) {
        data.current = true; // Mark as currently studying
      } else {
        data.current = false;
        data.endMonth = endMonth; // Set end date if not currently studying
        data.endYear = endYear;
      }

      const education = {
        ...data,
        profileId: formData._id, // Attach profile ID to the education entry
      };

      if (editingEducation) {
        // Update existing education entry
        const response = await axios.put(
          `http://localhost:5050/api/profile/${formData._id}/education/${editingEducation._id}/update`,
          education,
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          }
        );
        setEducations((prevEducations) =>
          prevEducations.map((edu) =>
            edu._id === editingEducation._id ? response.data : edu
          )
        );
      } else {
        // Create new education entry
        const response = await axios.post(
          `http://localhost:5050/api/profile/${formData._id}/education/create`,
          education,
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          }
        );
        setEducations((prevEducations) => [...prevEducations, response.data]);
      }

      closeEducationModal(); // Close modal after submission
    } catch (error) {
      console.error("Failed to save education:", error);
    }
  };

  // Handle education deletion
  const handleDeleteEducation = async () => {
    try {
      await axios.delete(
        `http://localhost:5050/api/profile/${formData._id}/education/${educationToDelete}/delete`,
        {
          withCredentials: true,
        }
      );

      setEducations((prevEducations) =>
        prevEducations.filter((edu) => edu._id !== educationToDelete)
      );
      closeConfirmationModal(); // Close confirmation modal
    } catch (error) {
      console.error("Failed to delete education:", error);
    }
  };

  // Open modal for confirming deletion
  const openConfirmationModal = (educationId) => {
    setEducationToDelete(educationId);
    setConfirmationModalIsOpen(true);
  };

  const closeConfirmationModal = () => setConfirmationModalIsOpen(false);

  // Generate dropdown options for months and years
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
    return options; // Return generated options
  };

  return (
    <div className="section">
      <h2 className="section-title">Education</h2>
      <p className="section-text">
        List your educational background and achievements.
      </p>
      <ul className="list">
        {educations.map((education) => (
          <li key={education._id} className="card">
            <div className="card-content">
              <div className="card-info">
                <h3 className="card-title">{education.school}</h3>
                <p className="med-title">
                  {education.degree} - {education.fieldOfStudy}
                </p>
                <p className="duration">
                  {education.startMonth} {education.startYear} -{" "}
                  {education.current
                    ? "Present"
                    : education.endMonth + " " + education.endYear}
                </p>
                <p className="description">{education.description}</p>
              </div>
              <div className="card-actions">
                <button
                  onClick={() => openEducationModal(education)}
                  className="smallBtn btn-icon"
                >
                  <FaPencilAlt />
                </button>
                <button
                  onClick={() => openConfirmationModal(education._id)}
                  className="smallBtn btn-icon"
                >
                  <FaTrashAlt />
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <button onClick={() => openEducationModal()} className="btn btn-primary">
        <FaPlus /> Add Education
      </button>

      {/* Education Modal */}
      <Modal
        isOpen={educationModalIsOpen}
        onRequestClose={closeEducationModal}
        className="modal-wrapper"
      >
        <div className="modal">
          <h1 className="lrg-heading">
            {editingEducation ? "Edit Education" : "Add Education"}
          </h1>
          <form onSubmit={handleSubmit(handleEducationSubmit)} className="form">
            <label htmlFor="school">School</label>
            <input
              type="text"
              id="school"
              {...register("school", { required: "School is required" })}
            />
            {errors.school && (
              <p className="error-messages">
                <i className="fas fa-exclamation-circle error-icon"></i>
                {errors.school.message}
              </p>
            )}
            <label htmlFor="degree">Degree</label>
            <input
              type="text"
              id="degree"
              {...register("degree", { required: "Degree is required" })}
            />
            {errors.degree && (
              <p className="error-messages">
                <i className="fas fa-exclamation-circle error-icon"></i>
                {errors.degree.message}
              </p>
            )}
            <label htmlFor="fieldOfStudy">Field of Study</label>
            <input
              type="text"
              id="fieldOfStudy"
              {...register("fieldOfStudy", {
                required: "Field of Study is required",
              })}
            />
            {errors.fieldOfStudy && (
              <p className="error-messages">
                <i className="fas fa-exclamation-circle error-icon"></i>
                {errors.fieldOfStudy.message}
              </p>
            )}
            <label>Start Date</label>
            <div className="date-selector">
              <select
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
            {!isCurrentlyStudying && (
              <>
                <label>End Date</label>
                <div className="date-selector">
                  <select
                    {...register("endMonth", {
                      required: !isCurrentlyStudying && "End month is required",
                    })}
                    value={endMonth}
                    onChange={(e) => setEndMonth(e.target.value)}
                    disabled={isCurrentlyStudying}
                  >
                    <option value="">Month</option>
                    {generateOptions("month")}
                  </select>
                  <select
                    {...register("endYear", {
                      required: !isCurrentlyStudying && "End year is required",
                    })}
                    value={endYear}
                    onChange={(e) => setEndYear(e.target.value)}
                    disabled={isCurrentlyStudying}
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
                checked={isCurrentlyStudying}
                onChange={handleCheckboxChange}
              />
              Currently Studying
            </label>
            <label htmlFor="description">
              Description<p className="sub-text">(Optional)</p>
            </label>
            <textarea id="description" {...register("description")}></textarea>
            <div className="btn-container">
              <button type="submit" className="btn-save">
                Save
              </button>
              <button
                type="button"
                className="btn-cancel"
                onClick={closeEducationModal}
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
          <h1 className="lrg-heading">Delete Education</h1>
          <p className="med-text">
            Are you sure you want to delete this education entry?
          </p>
          <div className="btn-container">
            <button onClick={handleDeleteEducation} className="btn-delete">
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

export default Education;
