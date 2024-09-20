import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext(); // Create the authentication context

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Authentication status
  const [user, setUser] = useState(null); // User information
  const [isLoading, setIsLoading] = useState(true); // Loading state

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem("token"); // Retrieve token from local storage
        if (token) {
          const config = {
            headers: {
              Authorization: `Bearer ${token}`, // Set authorization header
            },
          };
          const res = await axios.get(
            "http://localhost:5050/api/auth/user-info", // Fetch user info
            config
          );
          setUser(res.data); // Set user data
          setIsAuthenticated(true); // Update authentication status
        } else {
          setIsAuthenticated(false); // No token found
        }
      } catch (err) {
        setIsAuthenticated(false); // Error occurred, set as not authenticated
        console.error("Failed to check authentication status", err);
      } finally {
        setIsLoading(false); // Finished loading
      }
    };

    checkAuthStatus(); // Run the auth check on component mount
  }, []);

  const login = async (token) => {
    localStorage.setItem("token", token); // Save token
    setIsAuthenticated(true); // Set authenticated state
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`, // Set authorization header
        },
      };
      const res = await axios.get(
        "http://localhost:5050/api/auth/user-info", // Fetch user info after login
        config
      );
      setUser(res.data); // Set user data
    } catch (err) {
      console.error("Failed to fetch user info after login", err);
    }
  };

  const logout = async () => {
    try {
      await axios.post(
        "http://localhost:5050/api/auth/logout", // Log out user
        {},
        { withCredentials: true }
      );
      setIsAuthenticated(false); // Reset authenticated state
      setUser(null); // Clear user data
      localStorage.removeItem("token"); // Remove token from storage
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  // Role checking methods for user types
  const isEmployer = () => user?.role === "employer"; // Check if user is an employer
  const isJobSeeker = () => user?.role === "jobSeeker"; // Check if user is a job seeker

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        login,
        logout,
        user,
        isLoading,
        isEmployer,
        isJobSeeker,
      }}
    >
      {children} {/* Render child components */}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = () => useContext(AuthContext);
