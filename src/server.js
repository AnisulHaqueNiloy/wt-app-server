// // src/server.js
// const app = require("../src/app");
// const connectDB = require("../src/config/db");
// require("dotenv").config();

// const PORT = process.env.PORT || 5000;

// connectDB();

// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

// console.log(process.env.JWT_SECRET)

// src/server.js
const http = require("http"); // Add this
const { Server } = require("socket.io"); // Add this
const app = require("../src/app");
const connectDB = require("../src/config/db");
require("dotenv").config();

const PORT = process.env.PORT || 5000;

// 1. Create HTTP Server
const server = http.createServer(app);

// 2. Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174","https://remarkable-bubblegum-50daf9.netlify.app",],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// 3. Make IO Global
global.io = io;

io.on("connection", (socket) => {
  console.log("Client connected to Socket.io:", socket.id);
});

// 4. Connect DB & Listen using 'server' (NOT app)
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
