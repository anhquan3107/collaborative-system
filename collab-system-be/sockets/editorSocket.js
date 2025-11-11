export function initEditorSocket(io, socket) {
  socket.on("edit", (data) => {
    socket.broadcast.emit("edit", data);
  });
}
