import React from "react";
import { useNavigate } from "react-router-dom";
import { FaTimes } from "react-icons/fa";
import "../../styles/Payment.css";

const PaymentCancel = () => {
  const navigate = useNavigate(); // Get navigate function from react-router-dom

  // Handle return to premium page
  const handleReturn = () => {
    navigate("/premium");
  };

  return (
    <div className="cancel-container">
      <div className="cancel-content">
        <FaTimes className="cancel-icon" />
        <h1 className="lrg-heading">Payment Canceled</h1>
        <p>
          Your payment has been canceled. Please try again if you wish to
          subscribe.
        </p>
        <button className="btn" onClick={handleReturn}>
          Return to Premium Page
        </button>
      </div>
    </div>
  );
};

export default PaymentCancel;
