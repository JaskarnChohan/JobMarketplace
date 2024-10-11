import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Spinner from "../../components/Spinner/Spinner";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer"; // Import Footer
import "../../styles/Payment.css";

const PaymentPage = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [subscription, setSubscription] = useState(null);

  const tiers = [
    {
      name: "Free Tier",
      price: "Free",
      features: [
        "Access to basic job listings",
        "Limited messaging capabilities",
        "Basic profile visibility",
      ],
    },
    {
      name: "AI Plan",
      price: "$5",
      features: [
        "Access to premium job listings",
        "Unlimited messaging with employers",
        "Profile visibility to top employers",
        "Monthly insights on job market trends",
      ],
    },
  ];

  useEffect(() => {
    const fetchUserSubscription = async () => {
      setLoading(true);
      try {
        const response = await axios.get("/api/payment/subscription-status");
        setSubscription(response.data);
      } catch (err) {
        console.error(err);
        setError("Error fetching subscription details");
      } finally {
        setLoading(false);
      }
    };

    fetchUserSubscription();
  }, []);

  const handlePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post("/api/payment/create-payment");
      const { approvalUrl } = response.data;

      window.location.href = approvalUrl;
    } catch (err) {
      console.error(err);
      setError("Error initiating payment");
    } finally {
      setLoading(false);
    }
  };

  const handleDowngrade = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `/api/payment/downgrade-subscription`,
        {},
        { withCredentials: true } // Ensure credentials are passed
      );

      // Update the subscription state with the returned data
      setSubscription(response.data.subscription);
    } catch (err) {
      console.error(err);
      setError("Error downgrading subscription");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div>
      <Navbar isAuthenticated={true} handleLogout={handleLogout} />
      <div className="payment-page">
        <div className="payment-container">
          <h1>Choose Your Subscription Plan</h1>
          {error && <p className="error-message">{error}</p>}
          {loading ? (
            <Spinner />
          ) : (
            <>
              <div className="plan-details">
                <div className="tier-row">
                  {tiers.map((tier, index) => (
                    <div className="tier-card" key={index}>
                      <h2>{tier.name}</h2>
                      <p className="price">{tier.price}</p>
                      <h3>Features:</h3>
                      <ul>
                        {tier.features.map((feature, idx) => (
                          <li key={idx}>{feature}</li>
                        ))}
                      </ul>
                      {tier.name === "AI Plan" &&
                        subscription?.subscriptionType !== "AI Plan" && (
                          <button className="btn" onClick={handlePayment}>
                            Pay with PayPal
                          </button>
                        )}
                      {tier.name === "Free Tier" &&
                        subscription?.subscriptionType === "AI Plan" && (
                          <>
                            <p className="note">
                              You are currently subscribed to the AI Plan.
                            </p>
                            <button className="btn" onClick={handleDowngrade}>
                              Downgrade to Free Tier
                            </button>
                          </>
                        )}
                      {tier.name === "Free Tier" &&
                        !subscription?.subscriptionType && (
                          <p className="note">
                            No payment required. Enjoy the benefits!
                          </p>
                        )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="info-section">
                <h3>Need to Downgrade or Cancel?</h3>
                <p>
                  You can easily switch between plans at any time. To cancel
                  your current subscription, visit your account settings.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PaymentPage;
