export function initWhiteboardSocket(io, socket) {
  socket.on("draw", (data) => {
    socket.broadcast.emit("draw", data);
  });
}
