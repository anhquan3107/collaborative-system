export function initChatSocket(io, socket) {
  socket.on("chatMessage", (msg) => {
    io.emit("chatMessage", msg);
  });
}
