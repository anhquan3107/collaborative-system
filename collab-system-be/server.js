import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import pool from "./config/database.js";
import { initDocumentSocket } from "./sockets/documentSocket.js";
import { initChatSocket } from "./sockets/chatSocket.js";
import { initVideoSocket } from "./sockets/videoSocket.js";
import { initWhiteboardSocket } from "./sockets/whiteboardSocket.js";

const PORT = process.env.PORT;

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

initChatSocket(io);
initDocumentSocket(io);
initVideoSocket(io);
initWhiteboardSocket(io); 

server.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
