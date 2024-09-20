import React from "react";
import { useAuth } from "./AuthContext"; // Import custom authentication context
import Spinner from "../components/Spinner/Spinner"; // Import loading spinner component

const AuthLoader = ({ children }) => {
  const { isLoading } = useAuth(); // Get loading state from auth context

  if (isLoading) {
    return <Spinner />; // Show spinner while loading
  }
  return children; // Render child components when not loading
};

export default AuthLoader; // Export AuthLoader component
