import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaStar, FaHeart } from "react-icons/fa";
import ProfileInformation from "./job-seeker/ProfileInformation";
import Experience from "./job-seeker/Experience";
import Education from "./job-seeker/Education";
import Skills from "./job-seeker/Skills";
import ResumeUpload from "./job-seeker/ResumeUpload";
import EmployerProfileInformation from "./employer/EmployerProfileInformation";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import { useAuth } from "../../context/AuthContext";
import Spinner from "../../components/Spinner/Spinner";

const ProfilePage = () => {
  const [formData, setFormData] = useState({});
  const [experiences, setExperiences] = useState([]);
  const [educations, setEducations] = useState([]);
  const [skills, setSkills] = useState([]);
  const [profileExists, setProfileExists] = useState(false); // Track if a profile exists
  const [loading, setLoading] = useState(true); // Loading state for fetching data
  const { logout, isEmployer, user } = useAuth(); // Context for authentication
  const id = user._id; // Get user ID from context
  const navigate = useNavigate(); // For navigating between routes
  const [postTitle, setPostTitle] = useState(""); // State to store post title
  const [postBody, setPostBody] = useState(""); // State to store post body
  const [errors, setErrors] = useState([]); // State to hold error messages
  const [profileData, setProfileData] = useState(null); // State to store profile data

  const [reviews, setReviews] = useState([]); // State for reviews
  const [averageRating, setAverageRating] = useState(0); // State for average rating

  const handleLogout = () => {
    logout(); // Call logout function from context
    navigate("/"); // Redirect to home page after logout
  };

  // Function to fetch profile data depending on the user's type (employer/job seeker)
  const fetchProfileData = async () => {
    setLoading(true); // Start loading while fetching data
    try {
      if (isEmployer()) {
        // Fetch data for employer profile
        const response = await axios.get(
          `http://localhost:5050/api/employer/profile/fetch/${id}`,
          { withCredentials: true } // Ensure credentials (cookies) are included in request
        );

        if (response.data) {
          setFormData(response.data); // Set fetched data to formData state
          setProfileData(response.data); // Set profile data
          setProfileExists(!!response.data._id); // Check if profile exists
        }
      } else {
        // Fetch data for job seeker profile
        const response = await axios.get(
          `http://localhost:5050/api/profile/fetch`,
          { withCredentials: true }
        );

        if (response.data) {
          setFormData(response.data); // Set profile data
          setProfileData(response.data); // Set profile data
          if (response.data._id) {
            setProfileExists(true); // If profile exists, set the state
            fetchExperiences(response.data._id); // Fetch related experiences
            fetchEducations(response.data._id); // Fetch related education data
            fetchSkills(response.data._id); // Fetch related skills
            fetchResume(response.data._id); // Fetch resume
            fetchReviews(); // Fetch reviews
          } else {
            setProfileExists(false); // No profile exists
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch profile data:", error);
    } finally {
      setLoading(false); // Stop loading when data fetch is done
    }
  };

  // Fetch reviews for the employer
  const fetchReviews = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5050/api/profile/reviews/${user._id}`,
        { withCredentials: true }
      );
      setReviews(response.data); // Set the reviews in state
      // Calculate the average rating
      const totalRating = response.data.reduce(
        (acc, review) => acc + review.rating,
        0
      );
      const averageRating =
        response.data.length > 0
          ? (totalRating / response.data.length).toFixed(1)
          : 0;
      setAverageRating(averageRating); // Set the average rating in state
    } catch (error) {
      // Handle error
      console.error("Failed to fetch reviews:", error);
    }
  };

  // Fetch job seeker experiences
  const fetchExperiences = async (profileId) => {
    try {
      const response = await axios.get(
        `http://localhost:5050/api/profile/${profileId}/experience/fetch`,
        { withCredentials: true }
      );
      setExperiences(response.data); // Set fetched experiences data
    } catch (error) {
      console.error("Failed to fetch experiences:", error);
    }
  };

  // Fetch job seeker education
  const fetchEducations = async (profileId) => {
    try {
      const response = await axios.get(
        `http://localhost:5050/api/profile/${profileId}/education/fetch`,
        { withCredentials: true }
      );
      setEducations(response.data); // Set fetched education data
    } catch (error) {
      console.error("Failed to fetch educations:", error);
    }
  };

  // Fetch job seeker skills
  const fetchSkills = async (profileId) => {
    try {
      const response = await axios.get(
        `http://localhost:5050/api/profile/${profileId}/skill/fetch`,
        { withCredentials: true }
      );
      setSkills(response.data); // Set fetched skills data
    } catch (error) {
      // Handle error
      console.error("Failed to fetch skills:", error);
    }
  };

  // Fetch job seeker resume
  const fetchResume = async (profileId) => {
    try {
      const response = await axios.get(
        `http://localhost:5050/api/profile/resume/fetch`,
        { withCredentials: true }
      );
      setFormData((prevData) => ({
        ...prevData,
        resume: response.data.resume, // Add resume data to the formData state
      }));
    } catch (error) {
      // Handle error
      console.error("Failed to fetch resume:", error);
    }
  };

  useEffect(() => {
    fetchProfileData(); // Fetch profile data when component mounts
  }, []);

  // Handle profile update and re-fetch data after any changes
  const handleProfileUpdate = async () => {
    fetchProfileData();
  };

  // Function to update posts in the profile
  const handlePostUpdate = async (updatedPosts) => {
    try {
      const response = await axios.put(
        "http://localhost:5050/api/profile/update",
        { posts: updatedPosts },
        { withCredentials: true }
      );
      // Update the profile data with the new posts
      setProfileData((prevProfile) => ({
        ...prevProfile,
        posts: response.data.posts,
      }));
    } catch (err) {
      // Handle error
      console.error(err);
    }
  };

  // Function to handle post creation
  const handlePostCreation = async (event) => {
    event.preventDefault();
    try {
      if (!postBody || !postTitle) {
        setErrors([{ msg: "Post/Title cannot be empty" }]);
        return;
      }
      const newPost = {
        title: postTitle,
        body: postBody,
        votes: [],
      };

      const updatedPosts = [...profileData.posts, newPost]; // Add new post to existing posts
      await handlePostUpdate(updatedPosts); // Update the posts
      setPostBody(""); // Clear post body after submission
      setPostTitle(""); // Clear post title after submission
    } catch (err) {
      // Handle error
      console.error(err);
    }
  };

  // Function to handle post deletion
  const handlePostDeletion = async (postId) => {
    // Confirm deletion before proceeding
    const confirmDeletion = window.confirm(
      "Are you sure you want to delete this post?"
    );
    if (!confirmDeletion) return;

    try {
      const updatedPosts = profileData.posts.filter(
        (post) => post._id !== postId
      );
      await handlePostUpdate(updatedPosts); // Update the posts
    } catch (err) {
      console.error(err); // Handle error
    }
  };

  // Function to handle likes on a post
  const handleVote = async (postId, vote) => {
    try {
      const updatedPosts = profileData.posts.map((post) => {
        // Find the post to update
        if (post._id === postId) {
          const existingVote = post.votes.find((v) => v.voter === user._id);
          // If the user has already voted on the post
          if (existingVote) {
            if (existingVote.vote === vote) {
              // Remove vote if the same vote is clicked again
              post.votes = post.votes.filter((v) => v.voter !== user._id);
            } else {
              existingVote.vote = vote;
            }
          } else {
            // Add a new like if the user has not liked on the post
            post.votes.push({ voter: user._id, vote });
          }
        }
        return post; // Return the updated post
      });

      // Update the profile data with the new posts
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
    } catch (err) {
      // Handle error
      console.error(err);
    }
  };

  // Function to check if the user has already liked on a post
  const hasVoted = (votes, userId, voteType) => {
    return votes.some((v) => v.voter === userId && v.vote === voteType);
  };

  // Full name of the user
  const fullName = `${profileData?.firstName || ""} ${
    profileData?.lastName || ""
  }`;

  return (
    <div>
      {/* Navbar with logout button */}
      <Navbar isAuthenticated={true} handleLogout={handleLogout} />

      {loading ? (
        <Spinner /> // Show spinner when loading
      ) : (
        <div className="profile-container">
          {/* Render employer or job seeker profile depending on user type */}
          {isEmployer() ? (
            <>
              <EmployerProfileInformation
                formData={formData}
                setFormData={setFormData}
                profileExists={profileExists}
                onProfileUpdate={handleProfileUpdate}
              />
            </>
          ) : (
            <>
              <ProfileInformation
                formData={formData}
                setFormData={setFormData}
                profileExists={profileExists}
                onProfileUpdate={handleProfileUpdate}
              />
              {profileExists && (
                <div className="profile-content-container">
                  <div className="profile-sections">
                    {profileExists && (
                      <>
                        {/* Render experiences, education, skills, and resume upload if profile exists */}
                        <div className="section">
                          <Experience
                            experiences={experiences}
                            setExperiences={setExperiences}
                            formData={formData}
                            onProfileUpdate={handleProfileUpdate}
                          />
                        </div>
                        <div className="section">
                          <Education
                            educations={educations}
                            setEducations={setEducations}
                            formData={formData}
                            onProfileUpdate={handleProfileUpdate}
                          />
                        </div>
                        <div className="section">
                          <Skills
                            skills={skills}
                            setSkills={setSkills}
                            formData={formData}
                            onProfileUpdate={handleProfileUpdate}
                          />
                        </div>
                        <div className="section">
                          <ResumeUpload
                            profileId={formData._id}
                            firstName={formData.firstName}
                            lastName={formData.lastName}
                            formData={formData}
                            onProfileUpdate={handleProfileUpdate}
                          />
                        </div>
                        {/* Add the reviews section */}
                        <div className="section">
                          <h2 className="section-title">Reviews</h2>
                          <p className="average-rating">
                            Average Rating: {averageRating} / 5
                          </p>
                          <div className="reviews-container">
                            {Array.isArray(reviews) && reviews.length > 0 ? (
                              reviews.map((review) => (
                                <div className="review-card" key={review._id}>
                                  <div className="review-rating">
                                    {Array.from(
                                      { length: review.rating },
                                      (_, index) => (
                                        <FaStar key={index} className="star" />
                                      )
                                    )}
                                  </div>
                                  <p className="review-content">
                                    {review.content}
                                  </p>
                                  <p className="review-author">
                                    - {review.companyProfile.name}
                                  </p>
                                  <p className="review-date">
                                    {new Date(
                                      review.createdAt
                                    ).toLocaleDateString()}{" "}
                                    {/* Format the date */}
                                  </p>
                                </div>
                              ))
                            ) : (
                              <p className="section-text">
                                No reviews available.
                              </p>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Post Feed Section */}
                  <div className="feed-content">
                    <div className="feed">
                      <div className="feed-header">
                        <h1 className="feed-title">Feed:</h1>
                      </div>
                      {/* Conditionally render the post form if the logged-in user is the owner */}
                      {user && user._id === id && (
                        <form
                          className="post-form"
                          onSubmit={handlePostCreation}
                        >
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
                        {profileData?.posts &&
                          profileData.posts.length === 0 && (
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
                                    hasVoted(post.votes, user._id, 1)
                                      ? "voted-up"
                                      : ""
                                  }`}
                                  onClick={() => handleVote(post._id, 1)}
                                >
                                  <FaHeart />
                                </button>
                                <p>
                                  {post.votes.reduce(
                                    (acc, vote) => acc + vote.vote,
                                    0
                                  )}
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
              )}
            </>
          )}
        </div>
      )}
      {/* Footer at the bottom of the page */}
      <Footer />
    </div>
  );
};

export default ProfilePage;
