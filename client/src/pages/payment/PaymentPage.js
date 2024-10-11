import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Spinner from "../../components/Spinner/Spinner";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import "../../styles/Payment.css";

const PaymentPage = () => {
  const { logout, user, isEmployer, isJobSeeker } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [subscription, setSubscription] = useState(null);

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
        <h1 className="large-heading">
          Purchase a JobHive Premium Subscription
        </h1>
        <h2 className="subheading">Cancel or pause anytime</h2>
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
                        : handleDowngrade
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
      <Footer /> {/* Add footer here */}
    </div>
  );
};

export default PaymentPage;
