import React, { useEffect, useState, useRef, useLayoutEffect } from "react";
import axios from "axios";
import Navbar from "../../components/header/Navbar";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../../global.css";
import "../auth/form.css";
import Textarea from 'react-expanding-textarea';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const CreateJob = () => {
  const textareaRef = useRef(null)
  const { logout, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [formData, setFormData] = useState({
    employer: token,
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
    status: "Open",
  });

  const [errors, setErrors] = useState([]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    textareaRef.current.focus()
  }, [])

  const handleLogout = () => {
    logout();
    navigate("/");
  };
  // const { employer, title, company, location, jobCategory, workType, pay, description  } = formData;
  const { employer, title, description, company, location, jobCategory, requirements, benefits, salaryRange, employmentType, applicationDeadline, status } = formData;
  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5050/api/jobs/create", {
        employer,
        title,
        description,
        company,
        location,
        jobCategory,
        requirements,
        benefits,
        salaryRange,
        employmentType,
        applicationDeadline,
        status,
      });
      console.log(res.data);
      navigate("/");
    } catch (err) {
      if (err.response && err.response.data.errors) {
        setErrors(err.response.data.errors);
      } else {
        console.error(err);
        setErrors([{ msg: "An error occurred. Please try again later." }]);
      }
    }
  };

  const [requirementinputitem, setInputValue] = useState('');
  const [requirementslist, setItems] = useState([]);
  const [benefitsinputitem, setBenefitInputValue] = useState('');
  const [benefitslist, setBenefitItems] = useState([]);

  // Handle input change
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };
  const handleBenefitInputChange = (e) => {
    setBenefitInputValue(e.target.value);
  };

  // Handle adding item to the list
  const handleAddItem = () => {
    if (requirementinputitem.trim()) {  // Add only if input is not empty
      setItems([...requirementslist, requirementinputitem]);
      setInputValue(''); // Clear the input field
      setFormData({...formData, ['requirements']: requirementslist.values});
    }
  };
  const handleBenefitAddItem = () => {
    if (benefitsinputitem.trim()) {  // Add only if input is not empty
      setBenefitItems([...benefitslist, benefitsinputitem]);
      setBenefitInputValue(''); // Clear the input field
      setFormData({...formData, ['benefits']: benefitslist.values});
    }
  };

  // Function to remove an item based on index and item value
  const removeItem = (index, item) => {
    setItems(prevItems => prevItems.filter((_, i) => i !== index || prevItems[i] !== item));
  };
  const removeBenefitItem = (index, item) => {
    setBenefitItems(prevItems => prevItems.filter((_, i) => i !== index || prevItems[i] !== item));
  };

  const handleDateChange = (date) => {
    setFormData({...formData, ['applicationDeadline']: date});;
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Navbar isAuthenticated={true} handleLogout={handleLogout} user={user} />
      <div className="content">
          <form onSubmit={onSubmit}>
            <h1 className="lrg-heading">Job Listing Form</h1>
            <div className="form-container-wide">
              <div className="section">
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

                <label htmlFor="company">Company</label>
                <input
                type="text"
                name="company"
                id="company"
                value={company}
                onChange={onChange}
                placeholder="Company Name"
                required
                />

                <label htmlFor="location">Location of company</label>
                <input
                type="text"
                name="location"
                id="location"
                value={location}
                onChange={onChange}
                placeholder="Location of company"
                required
                />

                <label htmlFor="jobCategory">Job Category</label>
                <select
                name="jobCategory"
                id="jobCategory"
                value={jobCategory}
                onChange={onChange}
                required
                >
                    <option>Select a category</option>
                    <option value="test">Test</option>
                    <option value="test2">Test2</option>
                    <option value="test3">Test3</option>
                </select> 

                <label htmlFor="applicationdeadline">Application Deadline</label>
                <DatePicker className="datepicker"
                  selected={applicationDeadline}
                  onChange={(date) => handleDateChange(date)}
                />
              </div>

                {/* <label htmlFor="requirements">Requirements</label>
                <input
                type="text"
                name="requirements"
                id="requirements"
                value={requirements}
                onChange={onChange}
                placeholder="Enter job requirements"
                required
                /> */}
              <div className="section">
                <label htmlFor="description">Job Description</label>
                <Textarea
                className="expandable-textarea"
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
                <button className="small-btn" type="button" onClick={handleAddItem}>
                  Add to List of Requirements
                </button>
                <div className="list-container">
                  <h3>Requirements:</h3>
                  <ul className="item-list">
                    {requirementslist.map((item, index) => (
                      <li key={index}>{item} <button className="red-btn" type="button" onClick={() => removeItem(index, item)}>Delete</button></li>
                    ))}
                  </ul>   
                </div> 
                <button className="btn" type="submit">
                Post Job Listing
                </button>
              </div>

              <div className="section">
                <label htmlFor="employmentType">Employment Type</label>
                <select
                name="employmentType"
                id="employmentType"
                value={employmentType}
                onChange={onChange}
                required
                >
                    <option>Select a work type</option>
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
                    <option>Select a salary range</option>
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

                <label htmlFor="benefits">Enter Benefit:</label>
                <input
                  type="text"
                  id="benefits"
                  value={benefitsinputitem}
                  onChange={handleBenefitInputChange}
                />
                <button className="small-btn" type="button" onClick={handleBenefitAddItem}>
                  Add to List of Benefits
                </button>
                <div className="list-container">
                  <h3>Benefits:</h3>
                  <ul className="item-list">
                    {benefitslist.map((item, index) => (
                      <li key={index}>{item} <button className="red-btn" type="button" onClick={() => removeBenefitItem(index, item)}>Delete</button></li>
                    ))}
                  </ul>   
                </div>
                
              </div>
            </div>
            {errors.length > 0 && (
            <div className="error-messages">
                {errors.map((error, index) => (
                <p key={index}>{error.msg}</p>
                ))}
            </div>
            )}
            {/* {res.data === true && (
                <div className="success-messages">
                <p>Successfully create a job listing!</p>
            </div>
            )} */}
          </form>
      </div>
    </div>
  );
};

export default CreateJob;
