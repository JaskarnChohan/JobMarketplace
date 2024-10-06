const { Server } = require("socket.io");

const socketConfig = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    socket.on("sendMessage", (data) => {
      socket.broadcast.emit("receiveMessage", data);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  return io; // Return the io instance here
};

module.exports = socketConfig;
