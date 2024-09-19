import React from "react";
import Navbar from "../../components/layout/Navbar";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../../styles/Global.css";

const Dashboard = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Navbar isAuthenticated={true} handleLogout={handleLogout} />
      <div className="content">
        <h2>Welcome to your dashboard!</h2>
        <p>
          This is where you can manage your profile, job listings, and more.
        </p>
        <h3>Your Details:</h3>
        <p>Email: {user.email}</p>
        <p>Role: {user.role}</p>
        <p>
          Account Created At: {new Date(user.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
