import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaUser, FaBell } from "react-icons/fa";
import "../../styles/misc/Nav.css";
import "../../styles/Global.css";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

const Navbar = ({ isAuthenticated, handleLogout }) => {
  const { user } = useAuth(); // Extract user information from the context
  const [dropdownOpen, setDropdownOpen] = useState(false); // State to manage profile dropdown visibility
  const [notificationOpen, setNotificationOpen] = useState(false); // State to manage notification dropdown visibility
  const [notifications, setNotifications] = useState([]); // State to hold notifications
  const [unreadCount, setUnreadCount] = useState(0); // State to hold unread notification count

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications(); // Fetch notifications when the component mounts
    }
  }, [isAuthenticated]);

  const toggleDropdown = (type) => {
    if (type === "notification") {
      setNotificationOpen((prev) => {
        // If notification dropdown is opening, close profile dropdown
        if (!prev) {
          setDropdownOpen(false);
        }
        return !prev; // Toggle notification dropdown
      });
    } else {
      setDropdownOpen((prev) => {
        // If profile dropdown is opening, close notification dropdown
        if (!prev) {
          setNotificationOpen(false);
        }
        return !prev; // Toggle profile dropdown
      });
    }
  };

  // Fetch notifications from the server
  const fetchNotifications = async () => {
    try {
      const response = await axios.get("/api/notification/fetch");
      const fetchedNotifications = response.data;
      setNotifications(fetchedNotifications); // Set notifications
      // Filter unread notifications
      const unread = fetchedNotifications.filter((notif) => !notif.read).length;
      setUnreadCount(unread); // Set unread count
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  // Delete a notification
  const deleteNotification = async (notificationId) => {
    try {
      await axios.delete(`/api/notification/${notificationId}/delete`);
      // Remove the deleted notification from the state
      setNotifications((prevNotifications) =>
        prevNotifications.filter((notif) => notif._id !== notificationId)
      );
      // Decrement unread count if the deleted notification was unread
      setUnreadCount((prevCount) => prevCount - 1);
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  // Render links based on authentication status and user role
  const renderLinks = () => {
    if (!isAuthenticated) {
      return (
        <>
          <Link to="/joblistings">Job Listings</Link>
          <Link to="/browse-employers">Browse Employers</Link>
          <Link className="btn" to="/login">
            Login
          </Link>
          <Link className="btn" to="/signup">
            Sign Up
          </Link>
        </>
      );
    }

    return (
      <>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/messages">Messages</Link>
        {user.role === "employer" && (
          <>
            <Link to="/jobmanagement">Job Management</Link>
            <Link to="/createjob">Create Job</Link>
          </>
        )}
        {user.role === "jobSeeker" && (
          <>
            <Link to="/joblistings">Job Listings</Link>
            <Link to="/browse-employers">Browse Employers</Link>
          </>
        )}

        <div
          className="notification"
          onClick={() => toggleDropdown("notification")}
        >
          <FaBell className="icon" />
          {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
          {notificationOpen && (
            <div
              className={`notification-dropdown ${
                notificationOpen ? "show" : ""
              }`}
            >
              <div className="notification-title">Notifications</div>
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div key={notification._id} className="notification-item">
                    <div className="notification-content">
                      <div className="notification-message">
                        {notification.message}
                      </div>
                      <div className="notification-meta">
                        <span className="notification-type">
                          {notification.type}
                        </span>
                        <span> - </span>
                        <span className="notification-time">
                          {new Date(
                            notification.createdAt
                          ).toLocaleDateString()}{" "}
                          {new Date(notification.createdAt).toLocaleTimeString(
                            [],
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </span>
                      </div>
                    </div>
                    <button
                      className="delete-button"
                      onClick={() =>
                        deleteNotification(notification._id) &&
                        toggleDropdown("notification")
                      }
                      aria-label="Delete Notification"
                    >
                      &times;
                    </button>
                  </div>
                ))
              ) : (
                <div className="notification-item">No notifications</div>
              )}
            </div>
          )}
        </div>

        <div className="dropdown" onClick={() => toggleDropdown("profile")}>
          <FaUser className="icon" />
          {dropdownOpen && (
            <div className={`dropdown-menu ${dropdownOpen ? "show" : ""}`}>
              <Link to="/profile" className="dropdown-item">
                Profile
              </Link>
              <Link onClick={handleLogout} className="dropdown-item logout">
                Logout
              </Link>
            </div>
          )}
        </div>
      </>
    );
  };

  return (
    <nav>
      <Link className="lrg-heading" to="/">
        <img
          className="logo"
          src={require("../../assets/logo.png")}
          alt="logo"
        />
      </Link>
      <div className="navbar-links">{renderLinks()}</div>
    </nav>
  );
};

export default Navbar;
