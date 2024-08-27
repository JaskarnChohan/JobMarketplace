import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Navbar from "../../components/header/Navbar";
import "../../global.css";
import "./form.css";

const RequestResetPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const response = await axios.post(
        "http://localhost:5050/api/auth/request-password-reset",
        { email }
      );
      setMessage(response.data);
    } catch (error) {
      if (error.response && error.response.data && error.response.data.errors) {
        setError(error.response.data.errors.map((err) => err.msg).join(", "));
      } else {
        setError("Error requesting password reset. Please try again.");
      }
    }
  };

  return (
    <div>
      <Navbar />
      <div className="page-container">
        <div className="form-container">
          <h1 className="lrg-heading">Reset Your Password</h1>
          <form onSubmit={handleSubmit}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />

            <button className="btn" type="submit">
              Request Reset Code
            </button>

            {message && (
              <div className="success-messages">
                <p>{message}</p>
              </div>
            )}

            {error && (
              <div className="error-messages">
                <p>{error}</p>
              </div>
            )}
          </form>

          <div className="switch-auth">
            <p>
              Remembered your password?{" "}
              <Link to="/login" className="login-link">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestResetPassword;
