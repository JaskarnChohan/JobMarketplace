import React from "react";
import "../../styles/misc/Spinner.css"; // Import CSS styles for the spinner

const Spinner = () => {
  return (
    <div className="spinner-overlay">
      <div className="spinner"></div>
    </div>
  );
};

export default Spinner; // Export the Spinner component
