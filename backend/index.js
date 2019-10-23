const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io").listen(server);
const port = 3000;

io.on("connection", socket => {
  console.log("a user connected");
  socket.on("sdp", msg => {
    console.log("socketOn message",msg);
    io.emit("sdp", msg);
  });
});

server.listen(port, () => console.log("server running on port:" + port));