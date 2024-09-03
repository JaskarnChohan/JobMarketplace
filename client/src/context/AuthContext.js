import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  //George Haeberlin: allows someone to use: const { user } = useAuth(); to get user data.
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const config = {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          };
          const res = await axios.get(
            "http://localhost:5050/api/auth/user-info",
            config
          );
          setUser(res.data);
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (err) {
        setIsAuthenticated(false);
        console.error("Failed to check authentication status", err);
      }
    };

    checkAuthStatus();
  }, []);

  // George Haeberlin: This will fetch the user data of the user.
  // useEffect(() => {
  //   const fetchUserData = async () => {
  //     try {
  //       const token = localStorage.getItem("token");
  //       if (!token) {
  //         throw new Error("No token found");
  //       }

  //       const config = {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       };

  //       // Ensure the endpoint is correct
  //       const res = await axios.get(
  //         "http://localhost:5050/api/auth/dashboard",
  //         config
  //       );
  //       setUser(res.data);
  //     } catch (err) {
  //       console.error(
  //         "Failed to fetch user data:",
  //         err.response?.data?.errors || err.message
  //       );
  //     }
  //   };

  //   fetchUserData();
  // }, [setUser]);

  const login = async (token) => {
    localStorage.setItem("token", token);
    setIsAuthenticated(true);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const res = await axios.get(
        "http://localhost:5050/api/auth/user-info",
        config
      );
      setUser(res.data);
    } catch (err) {
      console.error("Failed to fetch user info after login", err);
    }
  };

  const logout = async () => {
    try {
      await axios.post(
        "http://localhost:5050/api/auth/logout",
        {},
        { withCredentials: true }
      );
      setIsAuthenticated(false);
      setUser(null);
      localStorage.removeItem("token");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
