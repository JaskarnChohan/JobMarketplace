import React from "react";
import { Link } from "react-router-dom";
import { FaFacebookF, FaTwitter, FaInstagram } from "react-icons/fa";
import "../../styles/misc/Footer.css";
import logo from "../../assets/logo.png";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section logo-section">
          <img src={logo} alt="JobHive Logo" className="footer-logo" />
          <p className="footer-text">Connecting Talent with Opportunity</p>
          <div className="social-icons">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon"
            >
              <FaFacebookF />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon"
            >
              <FaTwitter />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon"
            >
              <FaInstagram />
            </a>
          </div>
        </div>

        <div className="footer-section">
          <h3 className="footer-heading">Quick Links for Job Seekers</h3>
          <ul className="footer-links">
            <li>
              <Link to="/joblistings">Job Listings</Link>
            </li>
            <li>
              <Link to="/browse-employers">Browse Employers</Link>
            </li>
            <li>
              <Link to="/dashboard">Applied Jobs</Link>
            </li>
            <li>
              <Link to="/profile">Profile</Link>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h3 className="footer-heading">Quick Links for Employers</h3>
          <ul className="footer-links">
            <li>
              <Link to="/jobmanagement">Job Management</Link>
            </li>
            <li>
              <Link to="/dashboard">Applications</Link>
            </li>
            <li>
              <Link to="/profile">Profile</Link>
            </li>
            <li>
              <Link to="/createjob">Create Job</Link>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h3 className="footer-heading">Contact Information</h3>
          <p className="footer-text">Email: jobhive76@gmail.com</p>
          <p className="footer-text">Phone: +64 225909405</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p className="footer-text">© 2024 JobHive. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
