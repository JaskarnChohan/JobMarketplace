import React, { useState } from "react";
import { useForm } from "react-hook-form";
import Modal from "react-modal";
import { FaPencilAlt, FaTimes } from "react-icons/fa";
import "./ProfileForm.css";

Modal.setAppElement('#root');

const ProfileForm = () => {
    const { register, handleSubmit, reset, formState: { errors }, watch } = useForm();
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [modalType, setModalType] = useState(null);

    const [fullName, setFullName] = useState("");
    const [location, setLocation] = useState("");
    const [email, setEmail] = useState("");
    const [jobPreferences, setJobPreferences] = useState([]);
    const [skills, setSkills] = useState([]);
    const [education, setEducation] = useState([]);
    const [experience, setExperience] = useState([]);
    const [certifications, setCertifications] = useState([]);
    const [profilePicture, setProfilePicture] = useState(null);
    const [cvFile, setCvFile] = useState(null);

    const openModal = (type) => {
        setModalType(type);
        reset();
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
    };

    const handleModalSubmit = (data) => {
        switch (modalType) {
            case "profileInfo":
                setFullName(data.fullName);
                setLocation(data.location);
                setEmail(data.email);
                break;
            case "skills":
                setSkills([...skills, data.skill]);
                break;
            case "education":
                const educationData = {
                    institutionName: data.institutionName,
                    major: data.major,
                    startDate: data.startDate,
                    endDate: data.current ? "" : data.endDate
                };
                setEducation([...education, educationData]);
                break;
            case "experience":
                setExperience([...experience, {
                    jobTitle: data.jobTitle,
                    company: data.company,
                    startDate: data.startDate,
                    endDate: data.current ? "" : data.endDate,
                    description: data.description
                }]);
                break;
            case "certifications":
                setCertifications([...certifications, data.certifications]);
                break;
            case "jobPreferences":
                setJobPreferences([...jobPreferences, data.jobPreference]);
                break;
            default:
                break;
        }
        closeModal();
    };

    const handleDelete = (type, index) => {
        switch (type) {
            case "skills":
                setSkills(skills.filter((_, i) => i !== index));
                break;
            case "education":
                setEducation(education.filter((_, i) => i !== index));
                break;
            case "experience":
                setExperience(experience.filter((_, i) => i !== index));
                break;
            case "certifications":
                setCertifications(certifications.filter((_, i) => i !== index));
                break;
            case "jobPreferences":
                setJobPreferences(jobPreferences.filter((_, i) => i !== index));
                break;
            default:
                break;
        }
    };

    const handleProfilePictureChange = (e) => {
        if (e.target.files.length > 0) {
            setProfilePicture(URL.createObjectURL(e.target.files[0]));
        }
    };

    const handleCvFileChange = (e) => {
        if (e.target.files.length > 0) {
            setCvFile(e.target.files[0]);
        }
    };

    return (
        <div className="profile-form">
            <h2>Profile Information</h2>

            <div className="profile-header">
                <div
                    className="profile-picture"
                    onClick={() => document.getElementById('profile-picture-input').click()}
                    style={{ backgroundImage: `url(${profilePicture})` }}
                >
                    <input
                        type="file"
                        id="profile-picture-input"
                        onChange={handleProfilePictureChange}
                        style={{ display: 'none' }}
                    />
                </div>

                <div className="profile-info">
                    <div className="profile-info-item">
                        <h1>{fullName || "Add Name"}</h1>
                    </div>
                    <div className="profile-info-item">
                        <p>{location || "Add Location"}</p>
                    </div>
                    <div className="profile-info-item">
                        <p>{email || "Add Email"}</p>
                        <FaPencilAlt onClick={() => openModal("profileInfo")} />
                    </div>
                </div>
            </div>

            <form>
                <div className="profile-section">
                    <h3>Job Preferences</h3>
                    <ul>
                        {jobPreferences.map((preference, index) => (
                            <li key={index}>
                                {preference} <FaTimes onClick={() => handleDelete("jobPreferences", index)} />
                            </li>
                        ))}
                    </ul>
                    <button type="button" onClick={() => openModal("jobPreferences")}>Add Job Preferences</button>
                </div>

                <div className="profile-section">
                    <h3>Skills</h3>
                    <ul>
                        {skills.map((skill, index) => (
                            <li key={index}>
                                {skill} <FaTimes onClick={() => handleDelete("skills", index)} />
                            </li>
                        ))}
                    </ul>
                    <button type="button" onClick={() => openModal("skills")}>Add Skills</button>
                </div>

                <div className="profile-section">
                    <h3>Education</h3>
                    <div className="education-list">
                        {education.map((edu, index) => (
                            <div key={index} className="education-item">
                                <h4>{edu.institutionName}</h4>
                                {edu.major && <p className="major">{edu.major}</p>}
                                <p className="duration">{edu.startDate} - {edu.endDate || "Present"}</p>
                                <FaTimes onClick={() => handleDelete("education", index)} />
                            </div>
                        ))}
                    </div>
                    <button type="button" onClick={() => openModal("education")}>Add Education</button>
                </div>

                <div className="profile-section">
                    <h3>Experience</h3>
                    <ul>
                        {experience.map((exp, index) => (
                            <li key={index}>
                                <div>Job Title: {exp.jobTitle}</div>
                                <div>Company: {exp.company}</div>
                                <div>Duration: {exp.startDate} - {exp.endDate || "Present"}</div>
                                <div>Description: {exp.description}</div>
                                <FaTimes onClick={() => handleDelete("experience", index)} />
                            </li>
                        ))}
                    </ul>
                    <button type="button" onClick={() => openModal("experience")}>Add Experience</button>
                </div>

                <div className="profile-section">
                    <h3>Certifications</h3>
                    <ul>
                        {certifications.map((cert, index) => (
                            <li key={index}>
                                {cert} <FaTimes onClick={() => handleDelete("certifications", index)} />
                            </li>
                        ))}
                    </ul>
                    <button type="button" onClick={() => openModal("certifications")}>Add Certifications</button>
                </div>

                <div className="profile-section">
                    <h3>Upload CV</h3>
                    <input type="file" onChange={handleCvFileChange} />
                </div>
            </form>

            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                contentLabel="Modal"
                className="modal"
                overlayClassName="modal-overlay"
            >
                <h2>
                    {modalType === "profileInfo" && "Edit Profile Information"}
                    {modalType === "skills" && "Add Skills"}
                    {modalType === "education" && "Add Education"}
                    {modalType === "experience" && "Add Experience"}
              {modalType === "certifications" && "Add Certifications"}
                    {modalType === "jobPreferences" && "Add Job Preferences"}
                </h2>
                <form onSubmit={handleSubmit(handleModalSubmit)}>
                    {modalType === "profileInfo" && (
                        <div>
                            <input type="text" {...register("fullName", { required: "Please enter details" })} placeholder="Full Name" defaultValue={fullName} />
                            {errors.fullName && <p className="error-message">{errors.fullName.message}</p>}
                            <input type="text" {...register("location", { required: "Please enter details" })} placeholder="Location" defaultValue={location} />
                            {errors.location && <p className="error-message">{errors.location.message}</p>}
                            <input type="email" {...register("email", { required: "Please enter details" })} placeholder="Email" defaultValue={email} />
                            {errors.email && <p className="error-message">{errors.email.message}</p>}
                        </div>
                    )}
                    {modalType === "skills" && (
                        <div>
                            <input type="text" {...register("skill", { required: "Please enter a skill" })} placeholder="Skill" />
                            {errors.skill && <p className="error-message">{errors.skill.message}</p>}
                        </div>
                    )}
                    {modalType === "education" && (
                        <div>
                            <input type="text" {...register("institutionName", { required: "Please enter institution name" })} placeholder="Institution Name" />
                            {errors.institutionName && <p className="error-message">{errors.institutionName.message}</p>}
                            <input type="text" {...register("major")} placeholder="Major" />
                            <input type="date" {...register("startDate", { required: "Please enter start date" })} />
                            <input type="date" {...register("endDate")} disabled={watch("current")} />
                            <label>
                                <input type="checkbox" {...register("current")} />
                                Current
                            </label>
                        </div>
                    )}
                    {modalType === "experience" && (
                        <div>
                            <input type="text" {...register("jobTitle", { required: "Please enter job title" })} placeholder="Job Title" />
                            {errors.jobTitle && <p className="error-message">{errors.jobTitle.message}</p>}
                            <input type="text" {...register("company", { required: "Please enter company name" })} placeholder="Company" />
                            {errors.company && <p className="error-message">{errors.company.message}</p>}
                            <input type="date" {...register("startDate", { required: "Please enter start date" })} />
                            <input type="date" {...register("endDate")} disabled={watch("current")} />
                            <label>
                                <input type="checkbox" {...register("current")} />
                                Current
                            </label>
                            <textarea {...register("description")} placeholder="Description" />
                        </div>
                    )}
                    {modalType === "certifications" && (
                        <div>
                            <input type="text" {...register("certifications", { required: "Please enter certification" })} placeholder="Certification" />
                            {errors.certifications && <p className="error-message">{errors.certifications.message}</p>}
                        </div>
                    )}
                    {modalType === "jobPreferences" && (
                        <div>
                            <input type="text" {...register("jobPreference", { required: "Please enter job preference" })} placeholder="Job Preference" />
                            {errors.jobPreference && <p className="error-message">{errors.jobPreference.message}</p>}
                        </div>
                    )}
                    <button type="submit">Save</button>
                    <button type="button" onClick={closeModal}>Close</button>
                </form>
            </Modal>
        </div>
);
};

export default ProfileForm;
