import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../../styles/Global.css";
import "../../styles/job/Job.css";
import { locations } from "../../assets/locations.js";
import { categories } from "../../assets/categories.js";
import Spinner from "../../components/Spinner/Spinner";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaTrash } from "react-icons/fa";

const CreateJob = () => {
  // Reference for the job description textarea
  const textareaRef = useRef(null);
  const { logout, user, isAuthenticated, isEmployer } = useAuth();
  const navigate = useNavigate();

  // State to hold job listing form data
  const [formData, setFormData] = useState({
    employer: user._id,
    title: "",
    description: "",
    company: "",
    location: "",
    jobCategory: "",
    requirements: [],
    questions: [],
    benefits: [],
    salaryRange: "",
    employmentType: "",
    applicationDeadline: new Date(),
    status: "Draft",
  });

  // State for error messages and profile existence check
  const [errors, setErrors] = useState([]);
  const [profileExists, setProfileExists] = useState(false);

  // Effect to check authentication and fetch employer profile
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/dashboard");
    } else if (isEmployer()) {
      const fetchProfile = async () => {
        try {
          const response = await axios.get(
            "http://localhost:5050/api/employer/profile/fetch",
            { withCredentials: true }
          );

          if (response.data) {
            // Check if employer profile exists
            if (response.data._id) {
              setProfileExists(true);
              // Set company name from the profile
              setFormData((prevData) => ({
                ...prevData,
                company: response.data.name,
              }));
            } else {
              setProfileExists(false);
            }
          }
        } catch (err) {
          console.error("Failed to fetch employer profile:", err);
        }
      };

      fetchProfile();
    }
  }, [isAuthenticated, isEmployer, navigate]);

  // Function to handle user logout
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Destructure form data for easier access
  const {
    title,
    description,
    location,
    jobCategory,
    requirements,
    questions,
    benefits,
    salaryRange,
    employmentType,
    applicationDeadline,
    status,
  } = formData;

  // Function to update form data on input change
  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Function to handle form submission
  const onSubmit = async (e) => {
    e.preventDefault();

    // Ensure profile exists before submitting the job
    if (!profileExists) {
      setErrors([
        { msg: "You must create your profile before creating a job." },
      ]);
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:5050/api/jobs/create",
        formData
      );
      // Navigate to job management page on success
      navigate("/jobmanagement");
    } catch (err) {
      // Handle errors from the server
      if (err.response && err.response.data.errors) {
        setErrors(err.response.data.errors);
      } else {
        setErrors([{ msg: "An error occurred. Please try again later." }]);
      }
    }
  };

  // State for input fields to add requirements and benefits
  const [requirementInputItem, setRequirementInputValue] = useState("");
  const [questionInputItem, setQuestionInputValue] = useState("");
  const [benefitsInputItem, setBenefitInputValue] = useState("");

  // Handle input changes for requirement, requirement questions, and benefit fields
  const handleRequirementInputChange = (e) => {
    setRequirementInputValue(e.target.value);
  };

  const handleQuestionInputChange = (e) => {
    setQuestionInputValue(e.target.value); // Update state for questions
  };

  const handleBenefitInputChange = (e) => {
    setBenefitInputValue(e.target.value);
  };

  // Function to add requirement to the list
  const handleAddRequirementItem = () => {
    if (requirementInputItem.trim()) {
      const updatedRequirements = [...requirements, requirementInputItem];
      setRequirementInputValue(""); // Clear input field
      setFormData({ ...formData, requirements: updatedRequirements });
    }
  };

  // Function to add  question to the list
  const handleAddQuestionItem = () => {
    if (questionInputItem.trim()) {
      const updatedQuestions = [...questions, questionInputItem];
      setQuestionInputValue(""); // Clear input field
      setFormData({
        ...formData,
        questions: updatedQuestions,
      });
    }
  };

  // Function to add benefit to the list
  const handleBenefitAddItem = () => {
    if (benefitsInputItem.trim()) {
      const updatedBenefits = [...benefits, benefitsInputItem];
      setFormData({ ...formData, benefits: updatedBenefits });
      setBenefitInputValue(""); // Clear input field
    }
  };

  // Function to remove a requirement from the list
  const removeRequirementItem = (index) => {
    const updatedRequirements = requirements.filter((_, i) => i !== index);
    setFormData({ ...formData, requirements: updatedRequirements });
  };

  // Function to remove a question from the list
  const removeQuestionItem = (index) => {
    const updatedQuestions = questions.filter((_, i) => i !== index);
    setFormData({ ...formData, questions: updatedQuestions });
  };

  // Function to remove a benefit from the list
  const removeBenefitItem = (index) => {
    const updatedBenefits = benefits.filter((_, i) => i !== index);
    setFormData({ ...formData, benefits: updatedBenefits });
  };

  // Function to handle date selection for the application deadline
  const handleDateChange = (date) => {
    setFormData({ ...formData, applicationDeadline: date });
  };

  // Show a loading spinner if user data is not yet available
  if (!user) {
    return <Spinner />;
  }

  return (
    <div>
      <Navbar isAuthenticated={true} handleLogout={handleLogout} user={user} />
      <div className="content">
        <form
          onSubmit={onSubmit}
          className="form-container update-job-container"
        >
          <h1 className="lrg-heading">Job Listing Form</h1>
          <div className="form-wrapper">
            {/* Left Section */}
            <div className="form-section">
              <label htmlFor="title">Title</label>
              <input
                type="text"
                name="title"
                id="title"
                value={title}
                onChange={onChange}
                placeholder="Title"
                required
              />

              <label htmlFor="location">Location</label>
              <select
                name="location"
                id="location"
                value={location}
                onChange={onChange}
                required
              >
                <option value="">Select Location</option>
                {locations.map((loc, index) => (
                  <option key={index} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>

              <label htmlFor="jobCategory">Job Category</label>
              <select
                name="jobCategory"
                id="jobCategory"
                value={jobCategory}
                onChange={onChange}
                required
              >
                <option value="">Select Category</option>
                {categories.map((cat, index) => (
                  <option key={index} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              <label htmlFor="employmentType">Employment Type</label>
              <select
                name="employmentType"
                id="employmentType"
                value={employmentType}
                onChange={onChange}
                required
              >
                <option value="">Select a work type</option>
                <option value="Full-time">Full Time</option>
                <option value="Part-time">Part Time</option>
                <option value="Contract">Contract</option>
                <option value="Temporary">Temporary</option>
                <option value="Internship">Internship</option>
              </select>

              <label htmlFor="salaryRange">Salary Range</label>
              <select
                name="salaryRange"
                id="salaryRange"
                value={salaryRange}
                onChange={onChange}
                required
              >
                <option value="">Select a salary range</option>
                <option value="$0-$10,000">$0 - $10,000</option>
                <option value="$10,000-$20,000">$10,000 - $20,000</option>
                <option value="$20,000-$40,000">$20,000 - $40,000</option>
                <option value="$40,000-$60,000">$40,000 - $60,000</option>
                <option value="$60,000-$80,000">$60,000 - $80,000</option>
                <option value="$80,000-$100,000">$80,000 - $100,000</option>
                <option value="$100,000-$120,000">$100,000 - $120,000</option>
                <option value="$120,000-$140,000">$120,000 - $140,000</option>
                <option value="$140,000-$160,000">$140,000 - $160,000</option>
                <option value="$160,000-$180,000">$160,000 - $180,000</option>
                <option value="$180,000-$200,000">$180,000 - $200,000</option>
                <option value="$200,000+">$200,000+</option>
              </select>

              <label htmlFor="status">Job Status</label>
              <select
                name="status"
                id="status"
                value={status}
                onChange={onChange}
                required
              >
                <option>Select a status</option>
                <option value="Open">Open</option>
                <option value="Closed">Closed</option>
                <option value="On Hold">On Hold</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Draft">Draft</option>
              </select>

              <label htmlFor="applicationDeadline">Application Deadline</label>
              <DatePicker
                className="datepicker"
                selected={applicationDeadline}
                onChange={handleDateChange}
              />
            </div>

            {/* Right Section */}
            <div className="form-section">
              <label htmlFor="description">Job Description</label>
              <textarea
                type="text"
                name="description"
                id="description"
                maxLength="5000"
                value={description}
                onChange={onChange}
                placeholder="Description of job"
                required
                ref={textareaRef}
              />

              <label htmlFor="requirements">Enter Requirement:</label>
              <input
                type="text"
                id="requirements"
                value={requirementInputItem}
                onChange={handleRequirementInputChange}
              />
              <button
                className="small-btn"
                type="button"
                onClick={handleAddRequirementItem}
              >
                Add to List of Requirements
              </button>

              <label htmlFor="benefits">Enter Benefit:</label>
              <input
                type="text"
                id="benefits"
                value={benefitsInputItem}
                onChange={handleBenefitInputChange}
              />
              <button
                className="small-btn"
                type="button"
                onClick={handleBenefitAddItem}
              >
                Add to List of Benefits
              </button>
            </div>
          </div>

          <div className="form-section">
            <div className="add-questions">
              <h4>Questions</h4>
              <input
                type="text"
                placeholder="Add Question..."
                value={questionInputItem}
                onChange={handleQuestionInputChange}
                className="input-field"
              />
              <button
                type="button"
                className="small-btn"
                onClick={handleAddQuestionItem}
              >
                Add Question
              </button>
            </div>
          </div>

          <div className="form-bottom">
            <div className="list-container">
              <h3>Requirements:</h3>
              <ul className="item-list">
                {requirements.map((item, index) => (
                  <li key={index}>
                    {item}{" "}
                    <FaTrash
                      className="red-btn"
                      onClick={() => removeRequirementItem(index)}
                    />
                  </li>
                ))}
              </ul>
            </div>
            <div className="list-container">
              <h3>Benefits:</h3>
              <ul className="item-list">
                {benefits.map((item, index) => (
                  <li key={index}>
                    {item}{" "}
                    <FaTrash
                      className="red-btn"
                      onClick={() => removeBenefitItem(index)}
                    />
                  </li>
                ))}
              </ul>
            </div>
            <div className="list-container">
              <h3>Questions:</h3>
              <ul className="item-list">
                {questions.map((question, index) => (
                  <li key={index}>
                    {question}{" "}
                    <FaTrash
                      className="red-btn"
                      onClick={() => removeQuestionItem(index)}
                    />
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <button className="btn" type="submit">
            Create Job Listing
          </button>
          {errors.length > 0 && (
            <div className="error-messages">
              {errors.map((error, index) => (
                <p key={index}>{error.msg}</p>
              ))}
            </div>
          )}
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default CreateJob;
