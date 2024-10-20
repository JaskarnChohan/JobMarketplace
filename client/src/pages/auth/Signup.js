import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import "../../styles/Global.css";
import "../../styles/auth/Form.css";

const Signup = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    role: "jobSeeker",
  });
  const [errors, setErrors] = useState([]);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const { email, password, confirmPassword, role } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setErrors([{ msg: "Passwords do not match" }]);
      return;
    }
    try {
      const res = await axios.post("http://localhost:5050/api/auth/register", {
        email,
        password,
        role,
      });
      navigate("/login");
    } catch (err) {
      if (err.response && err.response.data.errors) {
        setErrors(err.response.data.errors);
      } else {
        console.error(err);
        setErrors([{ msg: "An error occurred. Please try again later." }]);
      }
    }
  };

  return (
    <div>
      <Navbar />
      <div className="page-container">
        <div className="form-container">
          <h1 className="lrg-heading">Sign Up</h1>
          <form onSubmit={onSubmit}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              name="email"
              id="email"
              value={email}
              onChange={onChange}
              placeholder="Email"
              required
            />

            <label htmlFor="password">Password</label>
            <input
              type="password"
              name="password"
              id="password"
              value={password}
              onChange={onChange}
              placeholder="Password"
              required
            />

            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              id="confirmPassword"
              value={confirmPassword}
              onChange={onChange}
              placeholder="Confirm Password"
              required
            />

            <div className="role-container">
              <div className="role-option">
                <input
                  type="radio"
                  id="jobSeeker"
                  name="role"
                  value="jobSeeker"
                  checked={role === "jobSeeker"}
                  onChange={onChange}
                />
                <label htmlFor="jobSeeker" className="role-btn">
                  Job Seeker
                </label>
              </div>
              <div className="role-option">
                <input
                  type="radio"
                  id="employer"
                  name="role"
                  value="employer"
                  checked={role === "employer"}
                  onChange={onChange}
                />
                <label htmlFor="employer" className="role-btn">
                  Employer
                </label>
              </div>
            </div>

            <button className="btn" type="submit">
              Sign Up
            </button>
            {errors.length > 0 && (
              <div className="error-messages">
                {errors.map((error, index) => (
                  <p key={index}>{error.msg}</p>
                ))}
              </div>
            )}
          </form>

          <div className="switch-auth">
            <p>
              Already have an account?{" "}
              <a href="/login" className="login-link">
                Login
              </a>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Signup;
