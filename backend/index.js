import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import http from "http";
import { Server } from "socket.io";

import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/adminRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import adminSalaryRoutes from "./routes/adminSalaryRoutes.js";
import employeeSettingsRoutes from "./routes/employeeSettingsRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import departmentRoutes from "./routes/departmentRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import adminAttendanceRoutes from "./routes/adminAttendanceRoutes.js";
import employeeSalaryRoutes from "./routes/employeeSalaryRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import adminDashboardRoutes from "./routes/adminDashboardRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
dotenv.config();

const app = express();
const server = http.createServer(app);

const allowedOrigins = ["http://localhost:5173", "http://localhost:3000"];

export const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

// store online users => userId -> socketId
const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // join personal room by userId
  socket.on("join", (userId) => {
    if (!userId) return;

    const roomId = String(userId);
    socket.join(roomId);
    onlineUsers.set(roomId, socket.id);

    console.log(`User ${userId} joined personal room ${roomId}`);

    io.emit("onlineUsers", Array.from(onlineUsers.keys()));
  });

  // join a conversation room
  socket.on("joinConversation", (conversationId) => {
    if (!conversationId) return;

    socket.join(String(conversationId));
    console.log(`Socket ${socket.id} joined conversation ${conversationId}`);
  });

  // leave a conversation room
  socket.on("leaveConversation", (conversationId) => {
    if (!conversationId) return;

    socket.leave(String(conversationId));
    console.log(`Socket ${socket.id} left conversation ${conversationId}`);
  });

  // realtime send message
  // payload example:
  // {
  //   conversationId,
  //   senderId,
  //   receiverId,
  //   text,
  //   message
  // }
  socket.on("sendMessage", (payload) => {
    try {
      const {
        conversationId,
        senderId,
        receiverId,
        text,
        message,
      } = payload || {};

      if (!senderId || !receiverId) return;

      const messageData = {
        conversationId: conversationId || null,
        senderId,
        receiverId,
        text: text || "",
        message: message || null,
        createdAt: new Date(),
      };

      // send to conversation room if available
      if (conversationId) {
        io.to(String(conversationId)).emit("receiveMessage", messageData);
      }

      // send directly to sender + receiver rooms
      io.to(String(senderId)).emit("receiveMessage", messageData);
      io.to(String(receiverId)).emit("receiveMessage", messageData);

      // update chat list / sidebar in realtime
      io.to(String(senderId)).emit("conversationUpdated", messageData);
      io.to(String(receiverId)).emit("conversationUpdated", messageData);
    } catch (error) {
      console.error("Socket sendMessage error:", error);
    }
  });

  // typing indicator
  socket.on("typing", ({ conversationId, senderId, receiverId }) => {
    if (conversationId) {
      socket.to(String(conversationId)).emit("typing", {
        conversationId,
        senderId,
      });
    }

    if (receiverId) {
      io.to(String(receiverId)).emit("typing", {
        conversationId,
        senderId,
      });
    }
  });

  // stop typing
  socket.on("stopTyping", ({ conversationId, senderId, receiverId }) => {
    if (conversationId) {
      socket.to(String(conversationId)).emit("stopTyping", {
        conversationId,
        senderId,
      });
    }

    if (receiverId) {
      io.to(String(receiverId)).emit("stopTyping", {
        conversationId,
        senderId,
      });
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

    for (const [userId, savedSocketId] of onlineUsers.entries()) {
      if (savedSocketId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }

    io.emit("onlineUsers", Array.from(onlineUsers.keys()));
  });
});

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// static uploads
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/employees", employeeSalaryRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/admin/attendance", adminAttendanceRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/admin/salary", adminSalaryRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/admin/dashboard", adminDashboardRoutes);
app.use("/api/notifications", notificationRoutes);

app.use("/api/employee/settings", employeeSettingsRoutes);
// root
app.get("/", (req, res) => {
  res.send("EMS API running");
});

// health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "EMS server is running",
  });
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/EMS";

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });