import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams, Link } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import "../../styles/Global.css";
import "../../styles/auth/Form.css";

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { token } = useParams();

  useEffect(() => {
    const validateToken = async () => {
      try {
        await axios.post(
          "http://localhost:5050/api/auth/validate-reset-token",
          {
            token,
          }
        );
      } catch (error) {
        setError("The link is invalid. Please request a new password.");
      }
    };

    if (token) {
      validateToken();
    } else {
      navigate("/login");
    }
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      await axios.post("http://localhost:5050/api/auth/reset-password", {
        token,
        newPassword,
        confirmPassword,
      });
      setMessage("Password reset successful. You can now log in.");
      setError("");
      setTimeout(() => navigate("/login"), 3000); // Redirect after 3 seconds
    } catch (error) {
      console.error("Error resetting password", error);
      setError("Error resetting password. Please try again.");
      setMessage("");
    }
  };

  return (
    <div>
      <Navbar />
      <div className="page-container">
        <div className="form-container">
          <h1 className="lrg-heading">New Password</h1>
          {error ? (
            <div className="error-messages">
              <p>{error}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <label htmlFor="newPassword">New Password</label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                required
              />

              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
              />

              <button className="btn" type="submit">
                Change Password
              </button>

              {message && (
                <div className="success-messages">
                  <p>{message}</p>
                </div>
              )}
            </form>
          )}

          <div className="switch-auth">
            <p>
              Remember your password?{" "}
              <Link to="/login" className="login-link">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ResetPassword;
