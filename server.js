const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const app = express();
/**
 * Handle Cors
 */
app.all("/", (_, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://juntos-frontend.netlify.app");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});
/**
 * show uptime for the app
 */
app.use("/", (_, res) => {
  res.send({
    title: "Server running successfully",
    uptime: process.uptime(),
  });
});
/**
 * Create Socket Server
 */

const server = http.createServer(app);
const io = socketio(server);

/**
 * Run when client connects
 */
io.on("connection", (socket) => {
  /**
   * Listen for joinRoom
   * join user to that room
   */
  socket.on("joinRoom", ({ user, roomId }) => {
    socket.join(roomId);
  });

  /**
   * Listen for leaveRoom
   * remove user from that room
   */
  socket.on("leaveRoom", ({ user, roomId }) => {
    socket.leave(roomId);
  });

  /**
   * Listen for postChatMessage
   * Then emit postChatMessage to other Users
   */
  socket.on("postChatMessage", ({ message, roomId, user }) => {
    io.to(roomId).emit("receiveChatMessage", { message, user: user.name });
  });

  /**
   * Listen for startVideo
   * Then emit startVideo to other Users
   */
  socket.on("startVideo", ({ videoUrl, roomId }) => {
    socket.broadcast.to(roomId).emit("startVideo", { videoUrl });
  });

  /**
   * Listen for pauseVideo
   * Then emit pauseVideo to other Users
   */
  socket.on("pauseVideo", ({ roomId }) => {
    socket.broadcast.to(roomId).emit("pauseVideo", {});
  });

  /**
   * Listen for updateTimeStamp
   * Then emit updateTimeStamp to other Users
   */
  socket.on(
    "updateTimeStamp",
    ({ roomId, timestamp, playerState, videoUrl }) => {
      socket.broadcast
        .to(roomId)
        .emit("updateTimeStamp", { timestamp, playerState, videoUrl });
    }
  );

  /**
   * Listen user to disconnect
   */
  socket.on("disconnect", () => {});
});

const PORT = process.env.PORT || 8080;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
