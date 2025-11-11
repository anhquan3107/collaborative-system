// Connect to your backend socket server
const socket = io("http://localhost:3000"); // or your port

socket.on("connect", () => {
  console.log("✅ Connected to Socket.IO server:", socket.id);

  // Send a test message to the server
  socket.emit("testEvent", { message: "Hello from client!" });
});

// Listen for any message back from server
socket.on("serverResponse", (data) => {
  console.log("📩 Message from server:", data);
});

socket.on("disconnect", () => {
  console.log("❌ Disconnected from Socket.IO server");
}); 