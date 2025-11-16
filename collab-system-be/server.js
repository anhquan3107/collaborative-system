import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import pool from "./config/database.js";
import { initDocumentSocket } from "./sockets/documentSocket.js";

const PORT = process.env.PORT || 5000;

// --- MySQL connection test ---
try {
  const [rows] = await pool.query("SELECT 1 + 1 AS result");
  console.log("✅ MySQL connected successfully:", rows[0].result);
} catch (err) {
  console.error("❌ Database connection failed:", err);
}

// --- Setup HTTP + Socket.IO ---

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.id);
  
  // Initialize document collaboration sockets
  initDocumentSocket(io, socket);

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
  });
});

server.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
