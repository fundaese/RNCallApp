const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io").listen(server);
const port = 3000;

io.on("connection", socket => {
  console.log("a user connected");
  
  socket.on("sdp", sdp => {
    console.log("socketOn Offer message",sdp);
    io.emit("sdp", sdp);
  });

  socket.on("answerSdp", answerSdp => {
    console.log("socketOn Answer message",answerSdp);
    io.emit("answerSdp", answerSdp);
  });

  socket.on("candidateFromCaller", icecandidate => {
    io.emit("candidateFromCaller", icecandidate);
  });

  socket.on("candidateFromCallee", icecandidate => {
    io.emit("candidateFromCallee", icecandidate);
  });


});

server.listen(port, () => console.log("server running on port:" + port));