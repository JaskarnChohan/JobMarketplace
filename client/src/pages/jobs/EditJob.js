import React, { useEffect, useState, useRef, useLayoutEffect } from "react";
import axios from "axios";
import Navbar from "../../components/header/Navbar";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import "../../global.css";
import "../auth/form.css";
import Textarea from 'react-expanding-textarea';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const EditJob = () => {
  const { _id } = useParams();
  const [job, setJob] = useState({
    employer: '',
    title: '',
    description: '',
    company: '',
    location: '',
    jobCategory: '',
    requirements: [],
    benefits: [],
    salaryRange: '',
    employmentType: '',
    applicationDeadline: new Date(),
    status: '',
  });
  const [loading, setLoading] = useState(true);
  const [errors, setError] = useState([]);
  const textareaRef = useRef(null)
  const { logout, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  // State to toggle between select and input
  const [isCustomInput, setIsCustomInput] = useState(false);
  const [isCustomInput2, setIsCustomInput2] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await axios.get(`http://localhost:5050/api/jobs/${_id}`);
        setJob(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch job');
        setLoading(false);
        console.error(err);
      }
    };

    fetchJob();
  }, [_id]);

  useEffect(() => {
    if (textareaRef.current && !loading) {  // Only focus if loading is complete
      textareaRef.current.focus();    // Focus only once after the job is fetched
    }
  }, [loading]);  // Now it only runs once when loading becomes false

  const [requirementinputitem, setInputValue] = useState('');
  const [requirementslist, setItems] = useState([]);
  const [benefitsinputitem, setBenefitInputValue] = useState('');
  const [benefitslist, setBenefitItems] = useState([]);

  const [companies, setCompanies] = useState([]);
  const [categories, setCategories] = useState([]);
  const getCompanies = async () => {
    try {
        let res = await axios.get("http://localhost:5050/api/jobs/companies", {});
        const uniqueCompanies = res.data.companies;
        setCompanies(uniqueCompanies); // Assuming you have a state called 'companies'
    } catch (err) {
        console.error("Error fetching companies:", err);
    }
  };

  const getCategories = async () => {
    try{
        let res = await axios.get("http://localhost:5050/api/jobs/categories", {});
        const uniqueCategories = res.data.categories;
        setCategories(uniqueCategories);
    } catch (err) {
        console.error("Error fetching categories:", err);
    }
  }

  // Use useEffect to call getJobListings when the component mounts
  useEffect(() => {
    if (user && user._id) {
        getCompanies(); // Fetch unique companies when the component mounts
        getCategories();
    }
  }, [user]); // Run the effect when 'user' changes

  if (!isAuthenticated) {
    navigate("/login");
  }

  if (loading) return <div>Loading...</div>;
  if (!job) return <div>Job not found</div>;
  if (!user) {
    return <div>Loading...</div>;
  }

  const { employer, title, description, company, location, jobCategory, requirements, benefits, salaryRange, employmentType, applicationDeadline, status } = job;

  const handleLogout = () => {
    logout();
    navigate("/");
  };
  
  const onChange = (e) => {
    setJob({ ...job, [e.target.name]: e.target.value });
  }

  const handleToggleInput = () => {
    setIsCustomInput(!isCustomInput); // Toggle between select and input
  };

  const handleToggleInput2 = () => {
    setIsCustomInput2(!isCustomInput2); // Toggle between select and input
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
        const config = {
            headers: {
                'Content-Type': 'application/json'
            }
        };
      const res = await axios.put(`http://localhost:5050/api/jobs/update/${_id}`, job, config);
      console.log(res.data);
      navigate("/jobmanagement");
    } catch (err) {
      if (err.response && err.response.data.errors) {
        setError(err.response.data.errors);
      } else {
        console.error(err);
        setError([{ msg: "An error occurred. Please try again later." }]);
      }
    }
  };
  

  // Handle input change
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };
  const handleBenefitInputChange = (e) => {
    setBenefitInputValue(e.target.value);
  };

  // Handle adding item to the list
  const handleAddItem = () => {
    if (requirementinputitem.trim()) {
      const updatedRequirements = [...requirements, requirementinputitem];
      setJob({ ...job, requirements: updatedRequirements });
      setInputValue(''); // Clear the input field
    }
  };
  const handleBenefitAddItem = () => {
    if (benefitsinputitem.trim()) {
      const updatedBenefits = [...benefits, benefitsinputitem];
      setJob({ ...job, benefits: updatedBenefits });
      setBenefitInputValue(''); // Clear the input field
    }
  };

  const removeItem = (index) => {
    const updatedRequirements = requirements.filter((_, i) => i !== index);
    setJob({ ...job, requirements: updatedRequirements });
  };
  const removeBenefitItem = (index) => {
    const updatedBenefits = benefits.filter((_, i) => i !== index);
    setJob({ ...job, benefits: updatedBenefits });
  };

  const handleDateChange = (date) => {
    setJob({...job, ['applicationDeadline']: date});;
  };
  

  return (
    <div>
      <Navbar isAuthenticated={true} handleLogout={handleLogout} user={user} />
      <div className="content">
          <form onSubmit={onSubmit}>
            <h1 className="lrg-heading">Job Listing Editor</h1>
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
                {/* Conditionally render either the select dropdown or input field */}
                {isCustomInput ? (
                    <input
                    type="text"
                    name="company"
                    id="company"
                    value={company}
                    onChange={onChange}
                    placeholder="Enter Company Name"
                    required
                    />
                ) : (
                    <select
                    name="company"
                    id="company"
                    value={company}
                    onChange={onChange}
                    placeholder="Select Company Name"
                    required
                    >
                    <option value="">All Companies</option>
                    {companies.map((companyOption, index) => (
                        <option key={index} value={companyOption}>
                        {companyOption}
                        </option>
                    ))}
                    </select>
                )}
                {/* Toggle Button to switch between select and input */}
                <button type="button" className="small-btn button-blue" onClick={handleToggleInput}>
                    {isCustomInput ? 'Select from List' : 'Enter Manually'}
                </button>

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
                {/* Conditionally render either the select dropdown or input field */}
                {isCustomInput2 ? (
                    <input
                    type="text"
                    name="jobCategory"
                    id="jobCategory"
                    value={jobCategory}
                    onChange={onChange}
                    placeholder="Enter Category Name"
                    required
                    />
                ) : (
                    <select
                    name="jobCategory"
                    id="jobCategory"
                    value={jobCategory}
                    onChange={onChange}
                    placeholder="Select Category Name"
                    required
                    >
                    <option value="">All Categories</option>
                    {categories.map((categoryOption, index) => (
                        <option key={index} value={categoryOption}>
                        {categoryOption}
                        </option>
                    ))}
                    </select>
                )}
                {/* Toggle Button to switch between select and input */}
                <button type="button" className="small-btn button-blue" onClick={handleToggleInput2}>
                    {isCustomInput2 ? 'Select from List' : 'Enter Manually'}
                </button>
              
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
                  onChange={(e) => setInputValue(e.target.value)}
                />
                <button className="small-btn" type="button" onClick={handleAddItem}>
                  Add to List of Requirements
                </button>
                <div className="list-container">
                  <h3>Requirements:</h3>
                  <ul className="item-list">
                    {job.requirements.map((item, index) => (
                      <li key={index}>{item} <button className="red-btn" type="button" onClick={() => removeItem(index, item)}>Delete</button></li>
                    ))}
                  </ul>   
                </div> 
                <button className="btn" type="submit">
                Save Job Listing
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

                <label htmlFor="status">Enter Status:</label>
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

                <label htmlFor="benefits">Enter Benefit:</label>
                <input
                  type="text"
                  id="benefits"
                  value={benefitsinputitem}
                  onChange={(e) => setBenefitInputValue(e.target.value)}
                />
                <button className="small-btn" type="button" onClick={handleBenefitAddItem}>
                  Add to List of Benefits
                </button>
                <div className="list-container">
                  <h3>Benefits:</h3>
                  <ul className="item-list">
                    {job.benefits.map((item, index) => (
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

export default EditJob;
