import React from "react";

import "../../../styles/profile/ReviewModal.css";




const ReviewModal = ({
  isOpen,
  onClose,
  handleSubmitReview,
  reviewerName,
  setReviewerName,
  reviewText,
  setReviewText,
  rating,
  setRating,
}) => {
  if (!isOpen) return null; // If the modal is not open, return nothing

  return (
    <div className="review-modal">
      <div className="modal-content">
        <h2>Write a Review</h2>
        <form onSubmit={handleSubmitReview}>
          <label>Your Name:</label>
          <input
            type="text"
            value={reviewerName}
            onChange={(e) => setReviewerName(e.target.value)}
            required
          />
          <label>Your Review:</label>
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            rows="4"
            required
          ></textarea>
          <label>Rating:</label>
          <select
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
          >
            <option value="5">5 - Excellent</option>
            <option value="4">4 - Good</option>
            <option value="3">3 - Average</option>
            <option value="2">2 - Poor</option>
            <option value="1">1 - Terrible</option>
          </select>
          <button type="submit">Submit Review</button>
          <button type="button" onClick={onClose}>
            Close
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
