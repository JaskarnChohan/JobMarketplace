import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhone,
  FaBriefcase,
  FaDollarSign,
  FaBuilding,
  FaClock,
  FaTag,
  FaCalendarAlt,
  FaGlobe,
  FaStar,
} from "react-icons/fa";
import Modal from "react-modal";
import Navbar from "../../../components/layout/Navbar";
import Footer from "../../../components/layout/Footer";
import Spinner from "../../../components/Spinner/Spinner";
import { useAuth } from "../../../context/AuthContext";
import "../../../styles/profile/Profile.css";
import "../../../styles/profile/ProfileInfo.css";
import "../../../styles/Global.css";
import { FaHeart } from "react-icons/fa";

const ViewCompany = () => {
  // Retrieve the company ID from the URL parameters
  const { id } = useParams();
  const [companyData, setCompanyData] = useState(null); // State to hold company data
  const [jobListings, setJobListings] = useState([]); // State to hold job listings
  const [reviews, setReviews] = useState([]); // State for reviews
  const [reviewModalIsOpen, setReviewModalIsOpen] = useState(false); // State for modal visibility
  const [reviewContent, setReviewContent] = useState(""); // State for review content
  const [reviewRating, setReviewRating] = useState(0); // State for review rating
  const [userHasReviewed, setUserHasReviewed] = useState(false); // State to track if the user has submitted a review
  const [userReviewId, setUserReviewId] = useState(null); // State to store user review ID
  const [averageRating, setAverageRating] = useState(0); // State for average rating
  const [confirmationModalIsOpen, setConfirmationModalIsOpen] = useState(false); // State for confirmation modal visibility
  const [posts, setPosts] = useState([]); // State to hold posts
  const [loading, setLoading] = useState(true); // Loading state for fetching data
  const [postTitle, setPostTitle] = useState(""); // State to store post title
  const [postBody, setPostBody] = useState(""); // State to store post body
  const [hasProfile, setHasProfile] = useState(false); // State to check if the user has a profile
  const { user, isAuthenticated, logout, isJobSeeker } = useAuth(); // Authentication context
  const navigate = useNavigate(); // Hook for navigation

  // Handle user logout and navigate to home
  const handleLogout = () => {
    setLoading(true);
    logout();
    navigate("/");
  };

  useEffect(() => {
    // Function to fetch company data
    const fetchCompanyData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5050/api/employer/profile/fetch/${id}`,
          {
            withCredentials: true, // Include cookies for authentication
          }
        );
        setCompanyData(response.data); // Set the company data from the response
        fetchJobListings(); // Fetch job listings for the company
        fetchCompanyReviews(); // Fetch reviews for the company
        // Check if the user has a profile
        // const profileResponse = await axios.get(
        //   `http://localhost:5050/api/profile/fetch/`,
        //   { withCredentials: true }
        // );
        // setHasProfile(profileResponse.data.profileExists); // Set the profile existence flag
        setPosts(response.data.posts || []);
      } catch (error) {
        console.error("Failed to fetch company data:", error);
      }
    };

    // Function to fetch job listings for the company
    const fetchJobListings = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5050/api/jobs/getbyemployer/${id}`,
          {
            withCredentials: true,
          }
        );
        const openJobListings = response.data.jobs.filter(
          (job) => job.status === "Open" // Filter to get only open job listings
        );
        setJobListings(openJobListings); // Set the filtered job listings
      } catch (error) {
        console.error("Failed to fetch job listings:", error);
      }
    };

    fetchCompanyData(); // Initiate fetch when component mounts
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

  // Function to fetch company reviews
  const fetchCompanyReviews = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5050/api/employer/reviews/${id}`,
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
          `http://localhost:5050/api/employer/reviews/edit/${userReviewId}`,
          {
            content: reviewContent,
            rating: reviewRating,
          },
          { withCredentials: true }
        );
      } else {
        // Add a new review
        await axios.post(
          `http://localhost:5050/api/employer/reviews/add/${id}`,
          {
            content: reviewContent,
            rating: reviewRating,
          },
          { withCredentials: true }
        );
      }
      closeReviewModal(); // Close the modal
      fetchCompanyReviews(); // Refresh reviews
    } catch (error) {
      console.error("Failed to submit review:", error);
    }
  };

  // Function to handle review deletion
  const handleDeleteReview = async () => {
    try {
      await axios.delete(
        `http://localhost:5050/api/employer/reviews/delete/${userReviewId}`,
        { withCredentials: true }
      );
      setUserHasReviewed(false); // Reset the user review state
      fetchCompanyReviews(); // Refresh reviews after deletion
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

  const handleVote = async (postId, vote) => {
    try {
      const updatedPosts = posts.map((post) => {
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

      setPosts(updatedPosts);

      // Ensure the request includes the necessary credentials
      await axios.put(
        `http://localhost:5050/api/employer/update/${id}`,
        { posts: updatedPosts },
        { withCredentials: true }
      );
    } catch (err) {
      console.error(err);
    }
  };

  const hasVoted = (votes, userId, voteType) => {
    return votes.some((v) => v.voter === userId && v.vote === voteType);
  };

  const handlePostCreation = async (event) => {
    console.log("handlePostCreation called");
    event.preventDefault();
    try {
      if (!postBody || !postTitle) {
        console.error("Post/Title cannot be empty");
        return;
      }
      const newPost = {
        title: postTitle,
        body: postBody,
        votes: [],
        date: new Date().toISOString(),
      };

      const updatedPosts = [...posts, newPost];
      setPosts(updatedPosts);
      console.log("called update api with: ", updatedPosts);
      await axios.put(
        `http://localhost:5050/api/employer/update/${id}`,
        { posts: updatedPosts },
        { withCredentials: true }
      );

      setPostBody("");
      setPostTitle("");
    } catch (err) {
      console.error(err);
    }
  };

  const handlePostDeletion = async (postId) => {
    const confirmDeletion = window.confirm("Are you sure you want to delete this post?");
    if (!confirmDeletion) return;

    try {
      const updatedPosts = posts.filter((post) => post._id !== postId);
      setPosts(updatedPosts);

      await axios.put(
        `http://localhost:5050/api/employer/update/${id}`,
        { posts: updatedPosts },
        { withCredentials: true }
      );
    } catch (err) {
      console.error(err);
    }
  };

  // If company data is not yet available, show a loading spinner
  if (!companyData) return <Spinner />;

  const fullName = companyData ? companyData.name : "";

  return (
    <div className="profile-container">
      <Navbar isAuthenticated={isAuthenticated} handleLogout={handleLogout} />
      <div className="profile-information-container">
        <div className="profile-header">
          <div className="profile-picture-container">
            <img
              src={`http://localhost:5050/${companyData.logo}`}
              alt="Company Logo"
              className="profile-picture"
            />
          </div>
          <div className="profile-info">
            <h1 className="profile-name">{companyData.name}</h1>
            <p className="profile-location">
              <FaMapMarkerAlt /> {companyData.location}
            </p>
            <p className="profile-email">
              <FaEnvelope /> {companyData.email}
            </p>
            <p className="profile-website">
              <FaGlobe /> {companyData.websiteURL}
            </p>
            <p className="profile-phone">
              <FaPhone /> {companyData.phoneNumber}
            </p>
            <p className="profile-industry">
              <FaBriefcase /> {companyData.industry}
            </p>
          </div>
        </div>
      </div>
      <div className="profile-content-container">
        <div className="profile-sections">
          <div className="section">
            <h2 className="section-title">About {companyData.name}</h2>
            <pre className="section-text wrap">{companyData.description}</pre>
          </div>
          <div className="section">
            <h2 className="section-title">Active Job Listings</h2>
            <div className="job-listing-container">
              {Array.isArray(jobListings) && jobListings.length > 0 ? (
                jobListings.map((job) => (
                  <div className="job-card" key={job._id}>
                    <h3 className="job-title">{job.title}</h3>
                    <p className="job-info">
                      <FaBuilding /> {job.jobCategory}
                    </p>
                    <p className="job-info">
                      <FaMapMarkerAlt /> {job.location}
                    </p>
                    <p className="job-info">
                      <FaClock /> {job.employmentType}
                    </p>
                    <p className="job-info">
                      <FaTag /> {job.status}
                    </p>
                    <p className="job-info">
                      <FaDollarSign /> {job.salaryRange}
                    </p>
                    <p className="job-info">
                      <FaCalendarAlt />
                      {" Deadline: "}{" "}
                      {new Date(job.applicationDeadline).toLocaleDateString()}
                    </p>
                  </div>
                ))
              ) : (
                <p className="section-text">No active job listings available.</p>
              )}
            </div>
          </div>
          {/* New Reviews Section */}
          <div className="section">
            <h2 className="section-title">Company Reviews</h2>
            <p className="average-rating">
              Average Rating: {averageRating} <FaStar />
            </p>
            {isAuthenticated && isJobSeeker() && hasProfile ? (
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
                      - {review.userProfile.firstName}{" "}
                      {review.userProfile.lastName}
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
                <button className="btn post-btn" type="submit">Post</button>
              </form>
            )}
            <div className="feed-body">
              {posts.length === 0 ? (
                <p className="feed-text">
                  {fullName} has not posted anything yet.
                </p>
              ) : (
                posts
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .map((post) => (
                    <div key={post._id} className="post">
                      <h2 className="post-title">{post.title}</h2>
                      <p className="post-body">{post.body}</p>
                      <p className="post-date">
                        {new Date(post.date).toLocaleDateString()}
                      </p>
                      {user && (
                        <div className="post-vote">
                        <button
                          className={`btn btn-upvote ${hasVoted(post.votes, user._id, 1) ? "voted-up" : ""}`}
                          onClick={() => handleVote(post._id, 1)}
                        >
                          <FaHeart />
                        </button>
                        <p>
                          {post.votes.reduce((acc, vote) => acc + vote.vote, 0)}
                        </p>
                      </div>
                      
                        )}
                      {!user && (
                        <div className="post-vote">
                        <button
                          className={`btn btn-upvote`}
                          onClick={null}
                        >
                          <FaHeart />
                        </button>
                        <p>
                          {post.votes.reduce((acc, vote) => acc + vote.vote, 0)}
                        </p>
                      </div>
                      )}
                      {user && user._id === id && (
                        <button
                          className="btn delete-btn"
                          onClick={() => handlePostDeletion(post._id)}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>

      </div>

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

export default ViewCompany;