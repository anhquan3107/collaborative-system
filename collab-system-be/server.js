import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import pool from "./config/database.js";
import { initWhiteboardSocket } from "./sockets/whiteboardSocket.js";
import { initEditorSocket } from "./sockets/editorSocket.js";
import { initChatSocket } from "./sockets/chatSocket.js";

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

  // Listen for the test event from client
  socket.on("testEvent", (data) => {
    console.log("📨 Received from client:", data);

    // Send back a reply
    socket.emit("serverResponse", { message: "Hello back from server!" });
  });

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
  });
});

server.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
