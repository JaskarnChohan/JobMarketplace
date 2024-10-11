import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import Spinner from "../../components/Spinner/Spinner";
import { FaTimes, FaCheckCircle } from "react-icons/fa"; // Import success icon
import "../../styles/Payment.css"; // Ensure to import your CSS

const PaymentSuccess = () => {
  const location = useLocation(); // Get location object from react-router-dom
  const navigate = useNavigate(); // Get navigate function from react-router-dom
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(null); // Error state
  const [success, setSuccess] = useState(false); // Success state

  // Handle return to premium page
  const handleReturn = () => {
    navigate("/premium");
  };

  // Execute payment on component mount
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const token = query.get("token");
    const payerId = query.get("PayerID");

    // If token and payerId are present, execute payment route
    if (token && payerId) {
      handleExecutePayment(token, payerId); // Call handleExecutePayment function
    } else {
      // If token and payerId are missing, set error
      setError("Missing payment information.");
    }
  }, [location.search]);

  // Function to execute payment
  const handleExecutePayment = async (token, payerId) => {
    setLoading(true); // Set loading state to true
    setError(null); // Reset error state
    try {
      const response = await axios.post("/api/payment/execute-payment", {
        token,
        payerId,
      });

      const { billingAgreement } = response.data;
      setSuccess(true); // Set success state to true
    } catch (err) {
      // Log error and set error state
      console.error("Error executing payment:", err);
      setError("Error executing payment. Please try again.");
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <div className={success ? "success-container" : "cancel-container"}>
      {loading ? (
        <Spinner />
      ) : (
        <div className={success ? "success-content" : "cancel-content"}>
          {success ? (
            <>
              <FaCheckCircle className="success-icon" />
              <h1 className="lrg-heading">Payment Successful!</h1>
              <p>Thank you for your subscription!</p>
              <button className="btn" onClick={handleReturn}>
                Return to Premium Page
              </button>
            </>
          ) : (
            <>
              <FaTimes className="cancel-icon" />
              <h1 className="lrg-heading">Payment Error</h1>
              <p>{error || "There was an issue with your payment."}</p>
              <button className="btn" onClick={handleReturn}>
                Return to Premium Page
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default PaymentSuccess;
