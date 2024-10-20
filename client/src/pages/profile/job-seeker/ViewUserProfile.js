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
  FaStar,
} from "react-icons/fa";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Modal from "react-modal";
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
  const [premiumModalIsOpen, setPremiumModalIsOpen] = useState(false); // Modal state for premium access
  const [aiEvaluation, setAiEvaluation] = useState(null); // State to store AI evaluation results
  const [loading, setLoading] = useState(false); // Loading state for API calls
  const [postTitle, setPostTitle] = useState(""); // State to store post title
  const [postBody, setPostBody] = useState(""); // State to store post body
  const [errors, setErrors] = useState([]); // State to hold error messages

  const { user, isAuthenticated, logout, isEmployer } = useAuth(); // Authentication context
  const [reviews, setReviews] = useState([]); // State for reviews
  const [reviewModalIsOpen, setReviewModalIsOpen] = useState(false); // State for modal visibility
  const [reviewContent, setReviewContent] = useState(""); // State for review content
  const [reviewRating, setReviewRating] = useState(0); // State for review rating
  const [userHasReviewed, setUserHasReviewed] = useState(false); // State to track if the user has submitted a review
  const [userReviewId, setUserReviewId] = useState(null); // State to store user review ID
  const [averageRating, setAverageRating] = useState(0); // State for average rating
  const [confirmationModalIsOpen, setConfirmationModalIsOpen] = useState(false); // State for confirmation modal visibility

  const [hasProfile, setHasProfile] = useState(false); // State to check if the user has a profile
  const navigate = useNavigate(); // Navigation hook

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5050/api/profile/user/${id}`,
          { withCredentials: true }
        );
        setProfileData(response.data); // Set profile data
        // Check if the user has a profile
        const profileResponse = await axios.get(
          `http://localhost:5050/api/employer/profile/fetch/`,
          { withCredentials: true }
        );
        setHasProfile(profileResponse.data.profileExists); // Set the profile existence flag
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };

    fetchProfileData(); // Fetch profile data
    fetchUserReviews(); // Refresh reviews
  }, [id]);

  // Function to open the review modal
  const openReviewModal = (content, rating) => {
    // Check if content is a string and rating is a number
    if (typeof content === "string") {
      setReviewContent(content); // Set review content
    } else {
      setReviewContent(""); // Default to empty if not valid
    }

    if (typeof rating === "number") {
      setReviewRating(rating); // Set review rating
    } else {
      setReviewRating(0); // Default to 0 if not valid
    }

    setReviewModalIsOpen(true); // Open the modal
  };

  // Function to close the review modal
  const closeReviewModal = () => {
    setReviewModalIsOpen(false);
    setReviewContent(""); // Clear content
    setReviewRating(0); // Reset rating
  };

  // Function to fetch User reviews
  const fetchUserReviews = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5050/api/profile/reviews/${id}`,
        {
          withCredentials: true,
        }
      );
      setReviews(response.data);

      const userReview = response.data.find(
        (review) => review.user._id === user._id // Check if the logged-in user has a review
      );
      setUserHasReviewed(!!userReview); // Set user review state
      if (userReview) {
        setUserReviewId(userReview._id); // Store user review ID for deletion
      }

      // Calculate average rating
      const totalRating = response.data.reduce(
        (acc, review) => acc + review.rating,
        0
      );
      const averageRating =
        response.data.length > 0
          ? (totalRating / response.data.length).toFixed(1)
          : 0;
      setAverageRating(averageRating); // Store average rating
    } catch (error) {
      console.error("Failed to fetch company reviews:", error);
    }
  };

  // Function to handle review submission
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      if (userHasReviewed) {
        // Edit the existing review
        await axios.put(
          `http://localhost:5050/api/profile/reviews/edit/${userReviewId}`,
          {
            content: reviewContent,
            rating: reviewRating,
          },
          { withCredentials: true }
        );
      } else {
        // Add a new review
        await axios.post(
          `http://localhost:5050/api/profile/reviews/add/${id}`,
          {
            content: reviewContent,
            rating: reviewRating,
          },
          { withCredentials: true }
        );
      }
      closeReviewModal(); // Close the modal
      fetchUserReviews(); // Refresh reviews
    } catch (error) {
      console.error("Failed to submit review:", error);
    }
  };

  // Function to handle review deletion
  const handleDeleteReview = async () => {
    try {
      await axios.delete(
        `http://localhost:5050/api/profile/reviews/delete/${userReviewId}`,
        { withCredentials: true }
      );
      setUserHasReviewed(false); // Reset the user review state
      fetchUserReviews(); // Refresh reviews after deletion
      closeConfirmationModal(); // Close the modal after deletion
    } catch (error) {
      console.error("Failed to delete review:", error);
    }
  };

  // Function to open the confirmation modal
  const openConfirmationModal = () => {
    setConfirmationModalIsOpen(true);
  };

  // Function to close the confirmation modal
  const closeConfirmationModal = () => {
    setConfirmationModalIsOpen(false);
  };

  // If profileData is not fetched yet, display a spinner or if loading is set
  if (!profileData || loading) {
    return <Spinner />;
  }

  // Logout function
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Open the modal for premium access
  const openPremiumModal = () => {
    setPremiumModalIsOpen(true);
  };

  // Close the modal
  const closePremiumModal = () => {
    setPremiumModalIsOpen(false);
  };

  // Handle AI evaluation behind the paywall
  const handleAiEvaluation = async () => {
    setLoading(true); // Set loading state to true

    try {
      // Check subscription status
      const subscriptionResponse = await axios.get(
        "http://localhost:5050/api/payment/subscription-status",
        { withCredentials: true }
      );

      const { subscriptionType, status } = subscriptionResponse.data;

      // If the user has "JobHive Premium", proceed with AI evaluation
      if (subscriptionType === "JobHive Premium" && status === "active") {
        const response = await axios.post(
          `http://localhost:5050/api/ai/evaluate-resume/${id}`,
          { resume: profileData.resume },
          { withCredentials: true }
        );

        // If AI evaluation succeeds, set the AI results
        if (response.data.evaluationText) {
          setAiEvaluation(response.data.evaluationText);
        } else {
          console.error("Error evaluating resume:", response.data.error);
        }
      } else {
        // If not a premium user, open the modal
        openPremiumModal();
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

          {/* New Reviews Section */}
          <div className="section">
            <h2 className="section-title">User Reviews</h2>
            <p className="average-rating">
              Average Rating: {averageRating} <FaStar />
            </p>
            {isAuthenticated && isEmployer() && hasProfile ? (
              userHasReviewed ? (
                <div className="manage-review-buttons">
                  <p className="section-text">Manage your review.</p>
                  <button
                    className="btn review-btn"
                    onClick={() => {
                      const reviewToEdit = reviews.find(
                        (review) => review._id === userReviewId
                      );
                      if (reviewToEdit) {
                        openReviewModal(
                          reviewToEdit.content,
                          reviewToEdit.rating
                        );
                      }
                    }}
                  >
                    Edit Review
                  </button>
                  <button
                    className="btn delete-review-btn"
                    onClick={openConfirmationModal}
                  >
                    Delete Review
                  </button>
                </div>
              ) : (
                <button className="btn review-btn" onClick={openReviewModal}>
                  Add Review
                </button>
              )
            ) : (
              <p className="section-text">
                You must create a profile to write a review.
              </p>
            )}
            <div className="reviews-container">
              {Array.isArray(reviews) && reviews.length > 0 ? (
                reviews.map((review) => (
                  <div className="review-card" key={review._id}>
                    <div className="review-rating">
                      {Array.from({ length: review.rating }, (_, index) => (
                        <FaStar key={index} className="star" />
                      ))}
                    </div>
                    <p className="review-content">{review.content}</p>
                    <p className="review-author">
                      - {review.companyProfile.name}
                    </p>
                    <p className="review-date">
                      {new Date(review.createdAt).toLocaleDateString()}{" "}
                      {/* Format the date */}
                    </p>
                  </div>
                ))
              ) : (
                <p className="section-text">No reviews available.</p>
              )}
            </div>
          </div>
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
      {/* Premium access required modal */}
      <Modal
        isOpen={premiumModalIsOpen}
        onRequestClose={closePremiumModal}
        className="modal-wrapper"
      >
        <div className="modal">
          <h1 className="lrg-heading">Premium Feature</h1>
          <p className="med-text">
            You need a JobHive Premium subscription to access the AI resume
            evaluation feature.
          </p>
          <div className="btn-container">
            <button onClick={closePremiumModal} className="btn-close">
              Close
            </button>
          </div>
        </div>
      </Modal>

      {/* Review Modal */}
      <Modal
        isOpen={reviewModalIsOpen}
        onRequestClose={closeReviewModal}
        className="modal-wrapper"
      >
        <div className="modal">
          <h1 className="lrg-heading">
            {userHasReviewed ? "Edit Your Review" : "Add a Review"}
          </h1>
          <form onSubmit={handleReviewSubmit}>
            <label htmlFor="rating">Rating</label>
            <select
              id="rating"
              value={reviewRating}
              onChange={(e) => setReviewRating(e.target.value)}
              required
            >
              <option value="">Select Rating</option>
              {[1, 2, 3, 4, 5].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
            <label htmlFor="content">Review</label>
            <textarea
              id="content"
              value={reviewContent}
              onChange={(e) => setReviewContent(e.target.value)}
              required
            ></textarea>
            <div className="btn-container">
              <button type="submit" className="btn-save">
                Save
              </button>
              <button
                type="button"
                className="btn-cancel"
                onClick={closeReviewModal}
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
          <h1 className="lrg-heading">Delete Review</h1>
          <p className="med-text">
            Are you sure you want to delete this review?
          </p>
          <div className="btn-container">
            <button onClick={handleDeleteReview} className="btn-delete">
              Delete
            </button>
            <button onClick={closeConfirmationModal} className="btn-cancel">
              Cancel
            </button>
          </div>
        </div>
      </Modal>
      <Footer />
    </div>
  );
};

export default ViewUserProfile;
