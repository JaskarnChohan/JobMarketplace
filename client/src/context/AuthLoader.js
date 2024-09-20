import React from "react";
import { useAuth } from "./AuthContext";
import Spinner from "../components/Spinner/Spinner";

const AuthLoader = ({ children }) => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <Spinner />;
  }

  return children;
};

export default AuthLoader;
