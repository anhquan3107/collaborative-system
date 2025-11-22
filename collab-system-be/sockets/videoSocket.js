// backend/sockets/videoSocket.js

export function initVideoSocket(io) {
  io.on("connection", (socket) => {
    
    // 1. Join the specific Video Room
    socket.on("join_video_room", ({ projectId }) => {
      const room = `video_project_${projectId}`;
      socket.join(room);
      console.log(`🎥 Socket ${socket.id} joined video room ${room}`);
      
      // Notify others in the room that I am ready
      socket.to(room).emit("peer_joined", { socketId: socket.id });
    });

    // 2. WebRTC Signaling (Offer/Answer/ICE)
    // We use socket.to() to avoid sending signals back to ourselves
    
    socket.on("video_signal", ({ projectId, type, payload }) => {
      const room = `video_project_${projectId}`;
      socket.to(room).emit("video_signal", { type, payload, from: socket.id });
    });

    // 3. Call Notification (Sent from Chat to Chat)
    socket.on("initiate_call_invite", ({ projectId, callerName }) => {
      // Alert everyone in the CHAT room that a call is starting
      // Note: We send this to the 'project_' room (Chat room), not video room
      socket.to(`project_${projectId}`).emit("incoming_call_invite", { 
        projectId, 
        callerName 
      });
    });

    socket.on("disconnect", () => {
       // Handle cleanup if needed
    });
  });
}