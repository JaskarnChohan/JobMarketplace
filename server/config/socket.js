const { Server } = require("socket.io");

const socketConfig = (server) => {
  // Create a new Socket.IO instance
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      credentials: true,
    },
  });

  // Handle socket connections
  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    // Handle chat messages
    socket.on("sendMessage", (data) => {
      socket.broadcast.emit("receiveMessage", data);
    });

    // Handle disconnections
    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  return io; // Return the io instance here
};

module.exports = socketConfig;
