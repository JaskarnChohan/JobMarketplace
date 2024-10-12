import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhone,
  FaBriefcase,
  FaFileAlt,
  FaDownload,
  FaHeart,
} from "react-icons/fa";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Navbar from "../../../components/layout/Navbar";
import Spinner from "../../../components/Spinner/Spinner";
import Footer from "../../../components/layout/Footer";
import profileImage from "../../../assets/profile.png";
import "../../../styles/profile/Profile.css";
import "../../../styles/profile/ProfileInfo.css";
import "../../../styles/Global.css";

const ViewUserProfile = () => {
  const { id } = useParams();
  const [profileData, setProfileData] = useState(null);
  const [aiEvaluation, setAiEvaluation] = useState(null); // State to store AI evaluation results
  const [loading, setLoading] = useState(false); // Loading state for API calls
  const [postTitle, setPostTitle] = useState(""); // State to store post title
  const [postBody, setPostBody] = useState(""); // State to store post body
  const [errors, setErrors] = useState([]); // State to hold error messages

  const { logout, user } = useAuth(); // Get user from Auth context
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5050/api/profile/user/${id}`,
          { withCredentials: true }
        );
        setProfileData(response.data);
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };

    fetchProfileData();
  }, [id]);

  // If profileData is not fetched yet, display a spinner or if loading is set
  if (!profileData || loading) {
    return <Spinner />;
  }

  // Logout function
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Handle AI evaluation and open a modal to display results
  const handleAiEvaluation = async () => {
    setLoading(true); // Set loading state to true
    try {
      const response = await axios.post(
        `http://localhost:5050/api/ai/evaluate-resume/${id}`,
        {
          resume: profileData.resume,
        },
        { withCredentials: true }
      );

      // If AI evaluation succeeds, set the AI results and open the modal
      if (response.data.evaluationText) {
        setAiEvaluation(response.data.evaluationText);
      } else {
        console.error("Error evaluating resume:", response.data.error);
      }
      setLoading(false); // Set loading state to false
    } catch (error) {
      console.error("Error during AI evaluation:", error);
      setLoading(false); // Set loading state to false
    }
  };

  const handlePostUpdate = async (updatedPosts) => {
    try {
      console.log("Updating posts with: ", updatedPosts);
      const response = await axios.put(
        "http://localhost:5050/api/profile/update",
        { posts: updatedPosts },
        { withCredentials: true }
      );
      console.log("Updated Posts: ", response.data.posts);
      setProfileData((prevProfile) => ({
        ...prevProfile,
        posts: response.data.posts,
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const handlePostCreation = async (event) => {
    // console.log("Creating post");
    event.preventDefault();
    try {
      if (!postBody || !postTitle) {
        setErrors([{ msg: "Post/Title cannot be empty" }]);
        // console.log("Post/Title cannot be empty");
        return;
      }
      const newPost = {
        title: postTitle,
        body: postBody,
        votes: [],
        date: new Date(),
      };

      const updatedPosts = [...profileData.posts, newPost];
      // console.log("Updated Posts: ", updatedPosts);
      await handlePostUpdate(updatedPosts);
      setPostBody("");
      setPostTitle("");
    } catch (err) {
      console.error(err);
    }
  };

  const handlePostDeletion = async (postId) => {
    const confirmDeletion = window.confirm(
      "Are you sure you want to delete this post?"
    );
    if (!confirmDeletion) return;

    try {
      const updatedPosts = profileData.posts.filter(
        (post) => post._id !== postId
      );
      await handlePostUpdate(updatedPosts);
    } catch (err) {
      console.error(err);
    }
  };

  const handleVote = async (postId, vote) => {
    try {
      console.log("Voting on post:", postId, "with vote:", vote);
      const updatedPosts = profileData.posts.map((post) => {
        if (post._id === postId) {
          const existingVote = post.votes.find((v) => v.voter === user._id);
          if (existingVote) {
            if (existingVote.vote === vote) {
              // Remove vote if the same vote is clicked again
              post.votes = post.votes.filter((v) => v.voter !== user._id);
            } else {
              existingVote.vote = vote;
            }
          } else {
            post.votes.push({ voter: user._id, vote });
          }
        }
        return post;
      });

      console.log("Updated posts:", updatedPosts);

      setProfileData((prevProfile) => ({
        ...prevProfile,
        posts: updatedPosts,
      }));

      // Ensure the request includes the necessary credentials
      const response = await axios.put(
        `http://localhost:5050/api/profile/update/${profileData._id}`,
        { posts: updatedPosts },
        { withCredentials: true }
      );

      console.log("Vote update response:", response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const hasVoted = (votes, userId, voteType) => {
    return votes.some((v) => v.voter === userId && v.vote === voteType);
  };

  const { skills = [], experiences = [], educations = [] } = profileData;
  const fullName = `${profileData.firstName} ${profileData.lastName}`;

  return (
    <div>
      {/* Navbar with logout button */}
      <Navbar isAuthenticated={true} handleLogout={handleLogout} />
      <div className="profile-information-container">
        <div className="profile-header">
          <div className="profile-picture-container">
            <div className="profile-picture-wrapper">
              <img
                src={
                  profileData.profilePicture
                    ? `http://localhost:5050/${profileData.profilePicture}`
                    : profileImage
                }
                alt="Profile"
                className="profile-picture"
              />
            </div>
          </div>

          <div className="profile-info">
            <div className="profile-info-details">
              <h1 className="profile-name">{fullName}</h1>

              {profileData.homeLocation && (
                <p className="profile-location">
                  <FaMapMarkerAlt /> {profileData.homeLocation}
                </p>
              )}

              {profileData.email && (
                <p className="profile-email">
                  <FaEnvelope /> {profileData.email}
                </p>
              )}

              {profileData.phoneNumber && (
                <p className="profile-phone">
                  <FaPhone /> {profileData.phoneNumber}
                </p>
              )}

              {profileData.preferredClassification && (
                <p className="profile-classification">
                  <FaBriefcase /> {profileData.preferredClassification}
                </p>
              )}

              {profileData.bio && (
                <p className="profile-bio">{profileData.bio}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="profile-content-container">
        <div className="profile-sections">
          {/* Experience Section */}
          <div className="section">
            <h2 className="section-title">Experience</h2>
            {experiences.length === 0 ? (
              <p className="section-text">
                {fullName} has not listed any experiences.
              </p>
            ) : (
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
                            : `${experience.endMonth} ${experience.endYear}`}
                        </p>
                        <p className="description">{experience.description}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Education Section */}
          <div className="section">
            <h2 className="section-title">Education</h2>
            {educations.length === 0 ? (
              <p className="section-text">
                {fullName} has not listed any educational background.
              </p>
            ) : (
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
                            : `${education.endMonth} ${education.endYear}`}
                        </p>
                        <p className="description">{education.description}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Skills Section */}
          <div className="section">
            <h2 className="section-title">Skills</h2>
            {skills.length === 0 ? (
              <p className="section-text">
                {fullName} has not listed any skills.
              </p>
            ) : (
              <ul className="list">
                {skills.map((skill) => (
                  <li key={skill._id} className="card">
                    <div className="card-content">
                      <div className="card-info">
                        <h3 className="card-title">{skill.name}</h3>
                        <p className="med-title">Level: {skill.level}</p>
                        <p className="description">{skill.description}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Resume Section */}
          <div className="section">
            <h2 className="section-title">Resume Upload</h2>
            {profileData.resume && profileData.resumePrivacy === "public" ? (
              <div className="resume-card last">
                <div className="resume-card-content">
                  <div className="resume-card-icon">
                    <FaFileAlt size={50} />
                  </div>
                  <div className="resume-card-info">
                    <h3 className="resume-card-title">
                      {`${profileData.firstName} ${profileData.lastName}'s Resume`}
                    </h3>
                  </div>
                  <div className="resume-card-actions">
                    <a
                      href={`http://localhost:5050/${profileData.resume}`}
                      download
                      className="btn resume-btn"
                    >
                      <FaDownload />
                      <span>Download</span>
                    </a>
                    {/* Button for AI Evaluation */}
                    <button
                      className="btn resume-btn ai-evaluation-btn"
                      onClick={handleAiEvaluation}
                    >
                      AI Evaluate
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <p className="section-text">
                {fullName}'s resume is private or has not been uploaded.
              </p>
            )}
          </div>

          {/* AI Evaluation Results Section */}
          {aiEvaluation && (
            <div className="section">
              <h3 className="section-title">AI Evaluation Feedback</h3>
              <div className="ai-response">
                <div
                  className="improved-text"
                  dangerouslySetInnerHTML={{ __html: aiEvaluation }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="feed-content">
          {/* User Post Feed */}
          <div className="feed">
            <div className="feed-header">
              <h1 className="feed-title">Feed:</h1>
            </div>
            {/* Conditionally render the post form if the logged-in user is the owner */}
            {user && user._id === id && (
              <form className="post-form" onSubmit={handlePostCreation}>
                <textarea
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  className="post-title-input"
                  placeholder="Post Title..."
                />
                <textarea
                  value={postBody}
                  onChange={(e) => setPostBody(e.target.value)}
                  className="post-input"
                  placeholder="Share your thoughts..."
                />
                <button className="btn post-btn" type="submit">
                  Post
                </button>
              </form>
            )}
            <div className="feed-body">
              {/* If user has not posted anything yet, display a message */}
              {profileData.posts && profileData.posts.length === 0 && (
                <p className="feed-text">
                  {fullName} has not posted anything yet.
                </p>
              )}
              {/* Display user posts */}
              {profileData?.posts
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map((post) => (
                  <div key={post._id} className="post">
                    <h2 className="post-title">{post.title}</h2>
                    <p className="post-body">{post.body}</p>
                    <p className="post-date">
                      {new Date(post.date).toLocaleDateString()}
                    </p>
                    <div className="post-vote">
                      <button
                        className={`btn btn-upvote ${
                          hasVoted(post.votes, user._id, 1) ? "voted-up" : ""
                        }`}
                        onClick={() => handleVote(post._id, 1)}
                      >
                        <FaHeart />
                      </button>
                      <p>
                        {post.votes.reduce((acc, vote) => acc + vote.vote, 0)}
                      </p>
                      {/* <button
                        className={`btn btn-downvote ${hasVoted(post.votes, user._id, -1) ? "voted-down" : ""}`}
                        onClick={() => handleVote(post._id, -1)}
                      >
                        <FaHeartBroken />
                      </button> */}
                    </div>
                    {user && user._id === id && (
                      <button
                        className="btn delete-btn"
                        onClick={() => handlePostDeletion(post._id)}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ViewUserProfile;
