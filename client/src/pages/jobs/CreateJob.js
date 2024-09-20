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
  const textareaRef = useRef(null);
  const { logout, user, isAuthenticated, isEmployer } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    employer: user._id,
    title: "",
    description: "",
    company: "",
    location: "",
    jobCategory: "",
    requirements: [],
    benefits: [],
    salaryRange: "",
    employmentType: "",
    applicationDeadline: new Date(),
    status: "Draft",
  });

  const [errors, setErrors] = useState([]);
  const [profileExists, setProfileExists] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/dashboard");
    } else if (isEmployer()) {
      // Fetch employer profile data
      const fetchProfile = async () => {
        try {
          const response = await axios.get(
            "http://localhost:5050/api/employer/profile/fetch",
            {
              withCredentials: true,
            }
          );

          if (response.data) {
            if (response.data._id) {
              setProfileExists(true);
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

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const {
    title,
    description,
    location,
    jobCategory,
    requirements,
    benefits,
    salaryRange,
    employmentType,
    applicationDeadline,
    status,
  } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    // Check if the profile exists
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
      console.log(res.data);
      console.log(formData);
      navigate("/jobmanagement");
    } catch (err) {
      if (err.response && err.response.data.errors) {
        setErrors(err.response.data.errors);
      } else {
        console.error(err);
        setErrors([{ msg: "An error occurred. Please try again later." }]);
      }
    }
  };

  const [requirementinputitem, setInputValue] = useState("");
  const [benefitsinputitem, setBenefitInputValue] = useState("");

  // Handle input change
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleBenefitInputChange = (e) => {
    setBenefitInputValue(e.target.value);
  };

  const handleAddItem = () => {
    if (requirementinputitem.trim()) {
      const updatedRequirements = [...requirements, requirementinputitem];
      setInputValue("");
      setFormData({ ...formData, requirements: updatedRequirements });
    }
  };

  const handleBenefitAddItem = () => {
    if (benefitsinputitem.trim()) {
      const updatedBenefits = [...benefits, benefitsinputitem];
      setFormData({ ...formData, benefits: updatedBenefits });
      setBenefitInputValue("");
    }
  };

  const removeItem = (index) => {
    const updatedRequirements = requirements.filter((_, i) => i !== index);
    setFormData({ ...formData, requirements: updatedRequirements });
  };

  const removeBenefitItem = (index) => {
    const updatedBenefits = benefits.filter((_, i) => i !== index);
    setFormData({ ...formData, benefits: updatedBenefits });
  };

  const handleDateChange = (date) => {
    setFormData({ ...formData, applicationDeadline: date });
  };

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
                value={requirementinputitem}
                onChange={handleInputChange}
              />
              <button
                className="small-btn"
                type="button"
                onClick={handleAddItem}
              >
                Add to List of Requirements
              </button>

              <label htmlFor="benefits">Enter Benefit:</label>
              <input
                type="text"
                id="benefits"
                value={benefitsinputitem}
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

          <div className="form-bottom">
            <div className="list-container">
              <h3>Requirements:</h3>
              <ul className="item-list">
                {requirements.map((item, index) => (
                  <li key={index}>
                    {item}{" "}
                    <FaTrash
                      className="red-btn"
                      onClick={() => removeItem(index)}
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
