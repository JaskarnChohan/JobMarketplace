import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Spinner from "../../components/Spinner/Spinner";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import Modal from "react-modal"; // Import react-modal
import "../../styles/Payment.css";

Modal.setAppElement("#root"); // To prevent screen readers from reading content behind the modal

const PaymentPage = () => {
  const { logout, user, isEmployer, isJobSeeker } = useAuth(); // Get user type
  const navigate = useNavigate(); // For navigation
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(null); // Error state
  const [subscription, setSubscription] = useState(null); // Subscription state
  const [confirmationModalIsOpen, setConfirmationModalIsOpen] = useState(false); // Modal state

  // Define the tiers for the subscription
  const tiers = [
    {
      name: "Free",
      price: "Free",
      features: isJobSeeker
        ? [
            {
              title: "Access to basic job listings",
              description: "Browse job listings using the search feature.",
            },
            {
              title: "Limited messaging capabilities",
              description: "Send messages to employers for inquiries.",
            },
            {
              title: "Basic profile visibility",
              description: "Your profile is visible to potential employers.",
            },
          ]
        : [
            {
              title: "Create basic job listings",
              description: "Create basic job listings for job seekers to view.",
            },
            {
              title: "Limited messaging capabilities",
              description:
                "Send messages to job seekers for inquiries regarding applications.",
            },
            {
              title: "Basic profile visibility",
              description: "Your profile is visible to job seekers.",
            },
          ],
    },
    {
      name: "JobHive Premium",
      price: "$4.99",
      features: isJobSeeker
        ? [
            {
              title: "Access to premium job listings",
              description: "Explore exclusive job postings. (Coming Soon)",
            },
            {
              title: "Unlimited messaging with employers",
              description:
                "Communicate freely with potential employers. (Coming Soon)",
            },
            {
              title: "Profile visibility to top employers",
              description: "Get noticed by leading companies. (Coming Soon)",
            },
            {
              title: "Monthly insights on job market trends",
              description:
                "Stay informed with the latest industry trends. (Coming Soon)",
            },
            {
              title: "AI Feedback for Resumes",
              description: "Receive feedback on your resume by AI.",
            },
          ]
        : [
            {
              title: "Increase job listings views",
              description: "Reach a wider audience with your job offers.",
            },
            {
              title: "Advanced analytics on job views",
              description:
                "Track the performance of your job listings. (Coming Soon)",
            },
            {
              title: "Monthly insights on hiring trends",
              description:
                "Make informed hiring decisions with data. (Coming Soon)",
            },
            {
              title: "AI Resume Analyzer",
              description:
                "Analyze job seekers' resumes for better matching and save time.",
            },
          ],
    },
  ];

  // Fetch the user's subscription status
  useEffect(() => {
    const fetchUserSubscription = async () => {
      setLoading(true); // Start loading
      try {
        const response = await axios.get("/api/payment/subscription-status");
        setSubscription(response.data); // Set the subscription state
      } catch (err) {
        // Handle errors
        console.error(err);
        setError("Error fetching subscription details");
      } finally {
        setLoading(false); // Stop loading when data fetch is done
      }
    };

    fetchUserSubscription();
  }, []);

  // Reset loading state when navigating back to the page
  useEffect(() => {
    setLoading(true);
  }, []); // Run only once on page load

  const handlePayment = async () => {
    setLoading(true); // Start loading
    setError(null); // Clear any previous errors

    try {
      const response = await axios.post("/api/payment/create-payment");
      const { approvalUrl } = response.data;

      // Keep loading state until redirection to PayPal
      window.location.href = approvalUrl; // Redirect to PayPal
    } catch (err) {
      console.error(err);
      setError("Error initiating payment");
      setLoading(false); // Stop loading on error
    }
  };

  // Handle the downgrade process
  const handleDowngrade = async () => {
    setLoading(true); // Start loading
    setError(null); // Clear any previous errors

    try {
      // Send the downgrade request
      const response = await axios.post(
        `/api/payment/downgrade-subscription`,
        {},
        { withCredentials: true }
      );

      // Update the subscription state immediately to reflect "Free"
      setSubscription({
        ...subscription,
        subscriptionType: "Free", // Manually set to "Free"
      });
    } catch (err) {
      console.error(err);
      setError("Error downgrading subscription");
    } finally {
      setLoading(false);
      closeConfirmationModal(); // Close the modal after downgrading
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const openConfirmationModal = () => {
    setConfirmationModalIsOpen(true);
  };

  const closeConfirmationModal = () => {
    setConfirmationModalIsOpen(false);
  };

  return (
    <div>
      <Navbar isAuthenticated={true} handleLogout={handleLogout} />
      <div className="payment-page">
        <h1 className="large-heading">
          Purchase a JobHive Premium Subscription
        </h1>
        <h2 className="subheading">Cancel Anytime</h2>
        {error && <p className="error-messages">{error}</p>}
        {loading ? (
          <Spinner />
        ) : (
          <div className="plan-container">
            {tiers.map((tier, index) => (
              <div className="tier-card" key={index}>
                <h2>{tier.name}</h2>
                <p className="price">{tier.price} /month</p>
                {subscription?.subscriptionType === tier.name ? (
                  <button className="btn current-btn" disabled>
                    Current
                  </button>
                ) : (
                  <button
                    className="btn"
                    onClick={
                      tier.name === "JobHive Premium"
                        ? handlePayment
                        : openConfirmationModal
                    }
                  >
                    {tier.name === "JobHive Premium"
                      ? "Subscribe"
                      : "Downgrade"}
                  </button>
                )}
                <h3 className="features-title">Features:</h3>
                <ul className="features-list">
                  {tier.features.map((feature, idx) => (
                    <li key={idx}>
                      <strong>{feature.title}:</strong> {feature.description}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
        <p className="join-message">
          Join JobHive Premium to unlock amazing new features, updated
          regularly!
        </p>
      </div>
      {/* Confirmation Modal */}
      <Modal
        isOpen={confirmationModalIsOpen}
        onRequestClose={closeConfirmationModal}
        className="modal-wrapper"
      >
        <div className="modal">
          <h1 className="lrg-heading">Downgrade Subscription</h1>
          <p className="med-text">
            Are you sure you want to downgrade to the Free plan? You will lose
            access to premium features.
          </p>
          <div className="btn-container">
            <button onClick={handleDowngrade} className="btn-delete">
              Confirm
            </button>
            <button onClick={closeConfirmationModal} className="btn-cancel">
              Cancel
            </button>
          </div>
        </div>
      </Modal>
      <Footer /> {/* Add footer here */}
    </div>
  );
};

export default PaymentPage;
