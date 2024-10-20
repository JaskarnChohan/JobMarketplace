import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext"; // Importing authentication context for user state
import "../styles/Messaging.css";
import "../styles/Global.css";
import { useNavigate } from "react-router-dom"; // For navigation after logout
import Navbar from "../components/layout/Navbar"; // Navbar component
import Spinner from "../components/Spinner/Spinner"; // Loading spinner component
import Footer from "../components/layout/Footer"; // Footer component
import axios from "axios"; // Axios for API calls
import { io } from "socket.io-client"; // Importing Socket.io for real-time messaging

const Messaging = () => {
  const { user, logout } = useAuth(); // Getting user and logout function from auth context
  const navigate = useNavigate(); // Navigate function for routing
  const [hasProfile, setHasProfile] = useState(false); // State to track if user has a profile
  const [loading, setLoading] = useState(false); // Loading state for API calls
  const [conversations, setConversations] = useState([]); // State for storing conversations
  const [selectedConversation, setSelectedConversation] = useState(null); // Currently selected conversation
  const [message, setMessage] = useState(""); // Message input state
  const [newConversationEmail, setNewConversationEmail] = useState(""); // Email for new conversation
  const [error, setError] = useState(""); // State for error messages
  const messageEndRef = useRef(null); // Ref for scrolling to the end of messages

  const options = {
    // Formatting options for date and time
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  };

  // Create socket instance
  const socket = useRef();

  // Logout handler
  const handleLogout = () => {
    logout(); // Call logout function
    navigate("/"); // Navigate to home page after logout
  };

  // Combined effect for checking profile existence and fetching conversations
  useEffect(() => {
    const checkUserProfileAndFetchConversations = async () => {
      setLoading(true); // Start loading
      try {
        // Check if user profile exists
        const profileResponse = await axios.get(
          `http://localhost:5050/api/profile/fetch/`,
          { withCredentials: true }
        );
        setHasProfile(profileResponse.data.profileExists);

        if (!profileResponse.data.profileExists) {
          const companyProfileResponse = await axios.get(
            `http://localhost:5050/api/employer/profile/fetch`,
            { withCredentials: true }
          );
          setHasProfile(companyProfileResponse.data.profileExists);
        }

        // Fetch conversations
        await fetchConversations();
      } catch (error) {
        console.error("Error fetching profile or conversations:", error);
      } finally {
        setLoading(false); // Set loading to false after fetching
      }
    };

    if (user._id) {
      checkUserProfileAndFetchConversations();
    }
  }, [user._id]);

  // Listen for incoming messages
  useEffect(() => {
    socket.current = io(
      process.env.REACT_APP_SOCKET_URL || "http://localhost:3000"
    );

    // Establish socket connection on mount
    // Listen for incoming messages
    socket.current.on("receiveMessage", (newMessage) => {
      const { senderId, receiverId } = newMessage;

      // Update the selected conversation if it's open
      if (
        selectedConversation &&
        (receiverId === selectedConversation.recipientId ||
          senderId === selectedConversation.recipientId)
      ) {
        setSelectedConversation((prev) => ({
          ...prev,
          messages: [...(prev.messages || []), newMessage],
        }));
      }

      // Refresh conversations to ensure the latest message is displayed
      fetchConversations();
      if (selectedConversation) {
        handleConversationSelect(selectedConversation);
      }
    });

    return () => {
      socket.current.disconnect(); // Clean up the socket connection on unmount
    };
  }, [selectedConversation]);

  // Scroll to the bottom whenever messages are updated
  useEffect(() => {
    if (messageEndRef.current) {
      // Scroll to the bottom of the message history container
      messageEndRef.current.scrollTop = messageEndRef.current.scrollHeight;
    }
  }, [selectedConversation?.messages]);

  const fetchConversations = async () => {
    try {
      const response = await axios.get(
        `/api/messages/conversations/${user._id}`
      );
      // Sort conversations by latest message timestamp
      const sortedConversations = response.data.sort(
        (a, b) =>
          new Date(b.latestMessage.createdAt) -
          new Date(a.latestMessage.createdAt)
      );
      // Update the conversation list
      setConversations(sortedConversations);
    } catch (error) {
      // Handle errors
      console.error("Error fetching conversations", error);
      setError("Failed to load conversations.");
    }
  };

  // Send a message in the current conversation
  const sendMessage = async () => {
    setError(""); // Clear any previous errors
    if (message.trim() && selectedConversation) {
      try {
        const { recipientId } = selectedConversation;
        const newMessage = {
          senderId: user._id,
          receiverId: recipientId,
          content: message,
        };

        // Send the message using the API
        const response = await axios.post("/api/messages/send", newMessage);
        const savedMessage = response.data;

        // Emit the message through socket
        socket.current.emit("message", savedMessage);

        // Update the local state to include the new message
        setSelectedConversation((prev) => ({
          ...prev,
          messages: [...(prev?.messages || []), savedMessage],
        }));

        setMessage(""); // Clear the input after sending
        fetchConversations(); // Refresh the conversation list
      } catch (error) {
        // Handle errors
        console.error("Error sending message", error);
        setError("Failed to send message.");
      }
    } else {
      // Show error if message is empty
      setError("Message can't be empty.");
    }
  };

  // Handle Enter key press to send message
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      if (selectedConversation) {
        sendMessage();
      } else {
        startNewConversation();
      }
    }
  };

  // Start a new conversation with a user
  const startNewConversation = async () => {
    if (newConversationEmail.trim()) {
      const lowercaseEmail = newConversationEmail.toLowerCase(); // Convert to lowercase
      if (lowercaseEmail === user.email) {
        // Check if the user is trying to message themselves
        setError("You can't start a conversation with yourself.");
        return;
      }

      try {
        // Fetch the user ID using the email address
        const userIdResponse = await axios.get(
          `/api/auth/getIdByEmail/${lowercaseEmail}`
        );
        const userId = userIdResponse.data.userId; // Extract the user ID from the response

        // Check if the user has a profile using the user ID
        const userProfileResponse = await axios.get(
          `/api/profile/user/${userId}`
        );

        // Check if the user profile exists
        if (!userProfileResponse.data.profileExists) {
          // Check for the company profile using the email
          const companyProfileResponse = await axios.get(
            `/api/employer/profile/fetch/${userId}`
          );

          // If no company profile found, show error
          if (
            !companyProfileResponse ||
            !companyProfileResponse.data ||
            !companyProfileResponse.data.profileExists
          ) {
            setError("This user has not created a profile yet.");
            return;
          }
        }

        const existingConversation = conversations.find(
          (conv) => conv.email === lowercaseEmail
        );

        if (existingConversation) {
          // If it exists, just select the existing conversation
          handleConversationSelect(existingConversation);
          setNewConversationEmail(""); // Clear input
          return;
        }

        // Proceed to start a new conversation
        const response = await axios.post("/api/messages/start_conversation", {
          email: lowercaseEmail, // Use the lowercase email
          userId: user._id,
        });

        const newConversation = {
          ...response.data,
          messages: [], // Initialise with an empty array
        };

        // Update conversation list and select the new conversation
        setConversations((prev) => [...prev, newConversation]);
        setSelectedConversation(newConversation); // Directly select the new conversation
        setNewConversationEmail(""); // Clear input
        setError(""); // Clear any previous errors
      } catch (error) {
        console.error("Error starting new conversation", error);
        // Check if the error is due to user not being found
        if (error.response) {
          if (error.response.status === 404) {
            setError("The user does not exist.");
          } else if (error.response.status === 400) {
            setError("Invalid user ID.");
          } else {
            setError("Failed to start conversation. Please check the email.");
          }
        } else {
          setError("Failed to start conversation. Please try again later.");
        }
      }
    } else {
      // Show error if email is empty
      setError("Please enter a valid email address.");
    }
  };

  // Select and fetch a conversation's messages
  const handleConversationSelect = async (conversation) => {
    // Clear the new conversation email field when switching conversations
    setNewConversationEmail("");

    // Set the selected conversation first
    setSelectedConversation(conversation);

    setError(""); // Clear any previous errors
    try {
      // Fetch messages for the selected conversation
      const response = await axios.get(
        `/api/messages/${user._id}/${conversation.recipientId}`
      );

      setSelectedConversation((prev) => ({
        ...prev,
        messages: response.data.length ? response.data : [], // Ensure messages are an array
      }));

      // Mark all unread messages as read
      await axios.patch(
        `/api/messages/read/${user._id}/${conversation.recipientId}`
      ); // Call the API to mark all messages as read
      fetchConversations(); // Refresh the conversation list
    } catch (error) {
      // Handle errors
      console.error("Error fetching conversation messages", error);
      setError("Failed to load messages.");
    }
  };

  return (
    <div>
      <Navbar isAuthenticated={true} handleLogout={handleLogout} />
      <div className="messages">
        <h2 className="lrg-heading">Messages</h2>
        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}
        <div className="messaging-container">
          {/* Sidebar for conversations */}
          <div className="sidebar">
            <button
              className="btn create-message-btn"
              onClick={() => {
                setSelectedConversation(null);
                setNewConversationEmail(""); // Clear the email field when creating a new message
              }}
            >
              Create Message
            </button>
            <h3>Your Conversations</h3>
            {loading ? (
              <Spinner />
            ) : (
              <ul>
                {conversations.map((conv) => (
                  <li
                    key={conv.recipientId}
                    className={`conversation-item ${
                      selectedConversation?.recipientId === conv.recipientId
                        ? "selected"
                        : ""
                    }`}
                    onClick={() => handleConversationSelect(conv)} // Call the function to select the conversation
                  >
                    <img
                      src={
                        conv.profilePicture ||
                        "uploads/profile-pictures/default.png"
                      }
                      alt="Profile"
                      className="message-profile-picture"
                    />
                    <div>
                      <div className="sender-name">
                        {conv.firstName && conv.lastName ? (
                          `${conv.firstName} ${conv.lastName}`
                        ) : (
                          <span
                            className="sender-name hover"
                            onClick={() =>
                              navigate(`/viewcompany/${conv.recipientId}`)
                            }
                          >
                            {conv.companyName || conv.email}
                          </span>
                        )}{" "}
                      </div>
                      <div className="sender-email">{conv.email}</div>
                      <div className="latest-message-time">
                        {conv.latestMessage?.createdAt &&
                          new Date(
                            conv.latestMessage.createdAt
                          ).toLocaleTimeString([], options)}
                      </div>
                    </div>
                    {conv.latestMessage &&
                      !conv.latestMessage.isRead &&
                      conv.latestMessage.sender != user._id && (
                        <span className="unread-dot"></span>
                      )}
                  </li>
                ))}
              </ul>
            )}
          </div>
          {/* Main message area */}
          <div className="message-section">
            {selectedConversation ? (
              <div>
                <h3>
                  Conversation with{" "}
                  {selectedConversation.firstName &&
                  selectedConversation.lastName
                    ? `${selectedConversation.firstName} ${selectedConversation.lastName}`
                    : selectedConversation.companyName ||
                      selectedConversation.email}
                </h3>
                <div className="message-history" ref={messageEndRef}>
                  {selectedConversation?.messages?.length > 0 ? (
                    selectedConversation.messages.map((msg, index) => {
                      const isSentByUser =
                        msg.sender.toString() === user._id.toString();
                      const prevMessageTime =
                        index > 0
                          ? new Date(
                              selectedConversation.messages[index - 1].createdAt
                            )
                          : null;
                      const currentMessageTime = new Date(msg.createdAt);
                      const timeDiff = prevMessageTime
                        ? Math.abs(currentMessageTime - prevMessageTime) /
                          (1000 * 60)
                        : 0;

                      return (
                        <div key={index}>
                          {/* Display timestamp if gap is more than 5 minutes */}
                          {timeDiff > 5 && (
                            <div className="message-time-separator">
                              {currentMessageTime.toLocaleString([], options)}
                            </div>
                          )}
                          <div
                            className={`message-item ${
                              isSentByUser ? "sent" : "received"
                            }`}
                          >
                            {!isSentByUser && (
                              <img
                                src={
                                  selectedConversation.profilePicture ||
                                  "uploads/profile-pictures/default.png"
                                }
                                alt="Recipient Profile"
                                className="message-profile-picture"
                              />
                            )}
                            <div className="message-content">
                              <div className="sender-email">{msg.content}</div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div></div>
                  )}
                  {/* Scroll target */}
                  <div ref={messageEndRef}></div>
                </div>

                {/* Message input */}
                <div className="message-input">
                  <input
                    type="text"
                    placeholder="Type your message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                  <button className="btn" onClick={sendMessage}>
                    Send
                  </button>
                </div>
              </div>
            ) : (
              <div className="no-message-selected">
                <h4>Start a Conversation</h4>
                <input
                  type="email"
                  placeholder="User's email address"
                  value={newConversationEmail}
                  onChange={(e) => setNewConversationEmail(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") startNewConversation();
                  }}
                />
                <button
                  className="btn"
                  onClick={startNewConversation}
                  disabled={!hasProfile}
                >
                  Start Conversation
                </button>
                {!hasProfile && (
                  <div className="no-profile-warning">
                    You need to create a profile to send messages.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Messaging;
