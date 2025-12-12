// backend/sockets/chatSocket.js
import { createMessage } from "../models/chatModel.js";

export function initChatSocket(io) {
  io.on("connection", (socket) => {
    
    // --- CHAT ROOM LOGIC ---
    socket.on("join_project_chat", ({ projectId, username }) => {
      const room = `project_${projectId}`;
      socket.join(room);
      console.log(`User ${username} joined chat room: ${room}`);
      
      // Notify others (optional)
      socket.to(room).emit("user_joined", { username });
    });

    socket.on("leave_project_chat", ({ projectId }) => {
      const room = `project_${projectId}`;
      socket.leave(room);
    });

    // --- MESSAGING LOGIC ---
    socket.on("send_chat_message", async ({ projectId, userId, content }) => {
      try {
        // 1. Save to DB
        const savedMsg = await createMessage(projectId, userId, content);
        
        // 2. Broadcast to everyone in the project (including sender)
        io.to(`project_${projectId}`).emit("receive_chat_message", savedMsg);
        io.emit("new_message_notification", {
            projectId,
            username: savedMsg.username,
            content: savedMsg.content,
            timestamp: savedMsg.created_at
        });

        
      } catch (err) {
        console.error("Chat Error:", err);
        socket.emit("chat_error", { message: "Failed to send message" });
      }
    });

});
}