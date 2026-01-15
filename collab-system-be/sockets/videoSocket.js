// backend/sockets/videoSocket.js
export function initVideoSocket(io) {
  // Track ready state per room
  const roomReadyState = new Map(); // room -> Set of ready socket IDs

  io.on("connection", (socket) => {

    // =============================
    // JOIN VIDEO ROOM
    // =============================
    socket.on("join_video_room", ({ projectId }) => {
      const room = `video_project_${projectId}`;
      socket.join(room);

      console.log(`${socket.id} joined ${room}`);

      // Get other sockets in the room
      const socketsInRoom = io.sockets.adapter.rooms.get(room);
      const otherPeers = socketsInRoom ? [...socketsInRoom].filter(id => id !== socket.id) : [];

      // Notify the joining socket about existing peers
      if (otherPeers.length > 0) {
        socket.emit("peer_joined", { socketId: otherPeers[0] });
        
        // Check if existing peer is ready
        const readySet = roomReadyState.get(room);
        if (readySet) {
          otherPeers.forEach(peerId => {
            if (readySet.has(peerId)) {
              socket.emit("peer_ready", { socketId: peerId });
            }
          });
        }
      }

      // Notify other peers about this new socket
      socket.to(room).emit("peer_joined", { socketId: socket.id });
    });


    // =============================
    // CAMERA READY
    // =============================
    socket.on("video_ready", ({ projectId }) => {
      const room = `video_project_${projectId}`;
      
      // Track ready state
      if (!roomReadyState.has(room)) {
        roomReadyState.set(room, new Set());
      }
      roomReadyState.get(room).add(socket.id);
      
      socket.to(room).emit("peer_ready", { socketId: socket.id });
    });


    // =============================
    // WEBRTC SIGNAL RELAY
    // =============================
    socket.on("video_signal", ({ projectId, type, payload }) => {
      const room = `video_project_${projectId}`;
      socket.to(room).emit("video_signal", {
        type,
        payload,
        from: socket.id
      });
    });


    // =============================
    // CALL INVITE IN CHAT WINDOW
    // =============================
    socket.on("initiate_call_invite", ({ projectId, callerName }) => {
      socket.to(`project_${projectId}`).emit("incoming_call_invite", {
        projectId,
        callerName
      });
    });


    // =============================
    // END CALL
    // =============================
    socket.on("call_ended", ({ projectId }) => {
      const room = `video_project_${projectId}`;

      console.log(`📞 Call ended by ${socket.id}`);

      socket.to(room).emit("peer_call_ended", {
        from: socket.id
      });
    });


    // =============================
    // HANDLE DISCONNECT / RELOAD
    // =============================
    socket.on("disconnect", () => {
      console.log(`${socket.id} disconnected`);

      // Clean up ready state for all rooms
      roomReadyState.forEach((readySet, room) => {
        readySet.delete(socket.id);
        if (readySet.size === 0) {
          roomReadyState.delete(room);
        }
      });

      socket.rooms.forEach(room => {
        if (room.startsWith("video_project_")) {
          console.log(`Resetting call for room ${room} because ${socket.id} left`);

          socket.to(room).emit("peer_reset_call", {
            from: socket.id
          });
        }
      });
    });
  });
}
