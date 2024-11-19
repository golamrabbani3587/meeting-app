const express = require("express");
const mongoose = require("./config/db");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const authRoute = require("./routes/authRoute");
const roomRoute = require("./routes/roomRoutes");

const app = express();
const PORT = 5550;

app.use(express.json());
app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST"],
  credentials: true,
}));

const server = http.createServer(app);
const io = new Server(server, { 
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  }
});

// Example data structure to store users in rooms
const rooms = {};

// Function to add a user to a room
const addUserToRoom = (userId, roomId) => {
  if (!rooms[roomId]) {
    rooms[roomId] = []; // Create an empty array for the room if it doesn't exist
  }
  
  rooms[roomId].push(userId); // Add user to the room
};

// Function to remove a user from a room
const removeUserFromRoom = (userId, roomId) => {
  if (rooms[roomId]) {
    rooms[roomId] = rooms[roomId].filter((id) => id !== userId);
  }
};

const getUsersInRoom = (roomId) => {
  return rooms[roomId] || []; // Return the list of users in the room, or an empty array if the room doesn't exist
};

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on("getExistingUsers", (roomId) => {
    const roomUsers = getUsersInRoom(roomId); // Retrieve list of users in the room
    socket.emit("existingUsers", roomUsers);
  });
  
  socket.on("joinRoom", (roomId) => {
    addUserToRoom(socket.id, roomId);
    socket.to(roomId).emit("newUser", socket.id);
  });
  
  socket.on("offer", ({ to, offer }) => {
    io.to(to).emit("offer", { from: socket.id, offer });
  });

  socket.on("answer", ({ to, answer }) => {
    io.to(to).emit("answer", { from: socket.id, answer });
  });

  socket.on("ice-candidate", ({ to, candidate }) => {
    io.to(to).emit("ice-candidate", { from: socket.id, candidate });
  });


  socket.on('sendMessage', (data) => {
    const { roomId, message, senderId } = data;
    console.log(data, 'data');
    

    if (roomId && message) {
      console.log(`Message from ${senderId} in room ${roomId}: ${message}`);
      
      // Broadcast the message to everyone in the room
      io.to(roomId).emit('receiveMessage', {
        senderId,
        message,
        timestamp: new Date().toISOString(), // Optional: include a timestamp
      });
    }
  });

  socket.on('disconnect', () => {
    const { roomId } = socket;

    if (roomId) {
      console.log(`Client ${socket.id} disconnected from room: ${roomId}`);

      socket.to(roomId).emit('userDisconnected', socket.id);

      const room = io.sockets.adapter.rooms.get(roomId);
      const userCount = room ? room.size : 0;
      io.to(roomId).emit('getTotalUser', userCount);
    }
  });
});
setInterval(() => {
  io.to("clock-room").emit("time", new Date());
}, 1000);

app.use("/api/auth", authRoute);
app.use("/api/room", roomRoute);

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
