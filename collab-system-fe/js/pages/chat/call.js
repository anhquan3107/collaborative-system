// =============================
// PARAMS
// =============================
const urlParams = new URLSearchParams(window.location.search);
const projectId = urlParams.get("projectId");
// Remove isInitiator - we'll determine dynamically

// =============================
// GLOBALS
// =============================
let socket = null;
let localStream = null;
let peerConnection = null;

let isMuted = false;
let isVideoOff = false;

let iAmReady = false;      // camera loaded
let peerIsReady = false;   // peer camera loaded
let peerJoined = false;    // peer entered the room
let peerSocketId = null;   // track peer's socket ID

// =============================
// ICE SERVERS
// =============================
const rtcConfig = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    {
      urls: "turn:openrelay.metered.ca:80",
      username: "openrelayproject",
      credential: "openrelayproject"
    }
  ]
};

// =============================
// ON LOAD
// =============================
document.addEventListener("DOMContentLoaded", async () => {

  if (!projectId) {
    updateStatus("error", "Invalid Call ID");
    return;
  }

  document.getElementById("hangupBtn").addEventListener("click", endCall);
  document.getElementById("muteBtn").addEventListener("click", toggleMute);
  document.getElementById("cameraBtn").addEventListener("click", toggleVideo);

  // Load Camera First
await startLocalVideo();  // request camera
// Wait until video is really playing
await new Promise(resolve => {
  const video = document.getElementById("localVideo");
  video.onplaying = resolve;
});
iAmReady = true;

  // Then connect socket
  initSocket();
});

// =============================
// CAMERA
// =============================
async function startLocalVideo() {
  updateStatus("warning", "Accessing Camera...");

  localStream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: { echoCancellation: true, noiseSuppression: true }
  });

  const v = document.getElementById("localVideo");
  v.srcObject = localStream;
  v.muted = true;
}

// =============================
// SOCKET SIGNALING
// =============================
function initSocket() {
  socket = io();

  socket.on("connect", () => {
    console.log(" Connected:", socket.id);

    socket.emit("join_video_room", { projectId });
    socket.emit("video_ready", { projectId });
  });

  // Peer entered the call room
  socket.on("peer_joined", ({ socketId }) => {
    console.log(" Peer joined:", socketId);
    peerJoined = true;
    peerSocketId = socketId;
    attemptStartCall();
  });

  // Peer camera fully ready
  socket.on("peer_ready", ({ socketId }) => {
    console.log("Peer ready:", socketId);
    peerIsReady = true;
    if (socketId) peerSocketId = socketId;
    attemptStartCall();
  });

  socket.on("peer_call_ended", () => {
    console.log("Peer ended the call");

    updateStatus("error", "Call Ended");

    // Cleanup
    localStream?.getTracks().forEach(t => t.stop());
    peerConnection?.close();

    // Do not disconnect socket yet (optional)
    
    // Optional auto-close
    setTimeout(() => window.close(), 1000);
    });

  // WebRTC signaling
  socket.on("video_signal", async (data) => {
    if (data.from === socket.id) return;

    switch (data.type) {
      case "offer":
        await handleOffer(data.payload);
        break;
      case "answer":
        await handleAnswer(data.payload);
        break;
      case "ice":
        await handleIce(data.payload);
        break;
    }
  });

  socket.on("peer_reset_call", async () => {
    console.log("Peer reloaded or disconnected — resetting call");

    updateStatus("warning", "Peer reconnecting...");

    // Reset local state
    peerJoined = false;
    peerIsReady = false;
    peerSocketId = null;

    // Cleanup old connections
    peerConnection?.close();
    peerConnection = null;
    
    // Clear remote video
    document.getElementById("remoteVideo").srcObject = null;

    // Re-announce you are ready
    socket.emit("join_video_room", { projectId });
    socket.emit("video_ready", { projectId });
  });

  socket.on("force_ready_resend", () => {
    console.log("Server requested re-send of ready state");

    if (localStream && localStream.getTracks().length > 0) {
        socket.emit("video_ready", { projectId });
    }

    socket.emit("join_video_room", { projectId });
  });
}

// =============================
// START CALL LOGIC
// =============================
function attemptStartCall() {
  if (!iAmReady) return;
  if (!peerJoined) return;
  if (!peerIsReady) return;
  if (!peerSocketId) return;

  // Dynamically decide: higher socket ID creates the offer
  const shouldCreateOffer = socket.id > peerSocketId;

  console.log(`BOTH READY → ${shouldCreateOffer ? "Creating offer" : "Waiting for offer"}`);
  
  if (shouldCreateOffer) {
    createOffer();
  }
}

// =============================
// WEBRTC CORE
// =============================
function createPeerConnection() {
  if (peerConnection) return;

  peerConnection = new RTCPeerConnection(rtcConfig);

  // local tracks
  localStream.getTracks().forEach(t => peerConnection.addTrack(t, localStream));

  peerConnection.ontrack = (e) => {
    document.getElementById("remoteVideo").srcObject = e.streams[0];
    updateStatus("connected", "Connected");
  };

  peerConnection.onicecandidate = (e) => {
    if (e.candidate) {
      socket.emit("video_signal", {
        projectId,
        type: "ice",
        payload: e.candidate
      });
    }
  };
}

async function createOffer() {
  createPeerConnection();
  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);

  socket.emit("video_signal", { projectId, type: "offer", payload: offer });
}

async function handleOffer(offer) {
  createPeerConnection();
  await peerConnection.setRemoteDescription(offer);

  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);

  socket.emit("video_signal", { projectId, type: "answer", payload: answer });
}

async function handleAnswer(answer) {
  await peerConnection.setRemoteDescription(answer);
}

async function handleIce(candidate) {
  if (!peerConnection) createPeerConnection();
  await peerConnection.addIceCandidate(candidate);
}

// =============================
// UI CONTROLS
// =============================
function toggleMute() {
  const track = localStream.getAudioTracks()[0];
  track.enabled = !(isMuted = !isMuted);
    const btn = document.getElementById("muteBtn");
    const icon = document.getElementById("muteIcon");
    if (isMuted) {
        btn.classList.add("btn-off");
        icon.className = "fas fa-microphone-slash";
    } else {
        btn.classList.remove("btn-off");
        icon.className = "fas fa-microphone";
    }
}

function toggleVideo() {
    const track = localStream.getVideoTracks()[0];
    isVideoOff = !isVideoOff;
    track.enabled = !isVideoOff;

    const btn = document.getElementById("cameraBtn");
    const icon = document.getElementById("cameraIcon");

    if (isVideoOff) {
        btn.classList.add("btn-off");
        icon.className = "fas fa-video-slash";
    } else {
        btn.classList.remove("btn-off");
        icon.className = "fas fa-video";
    }
}

function endCall() {
  // Notify peer BEFORE closing socket
  socket.emit("call_ended", { projectId });

  // Local cleanup
  localStream?.getTracks().forEach(t => t.stop());
  peerConnection?.close();
  socket?.disconnect();

  updateStatus("error", "Call Ended");

  // Optional: close window after 1 sec
  setTimeout(() => window.close(), 1000);
}

function updateStatus(type, text) {
  document.getElementById("statusText").textContent = text;
  document.getElementById("statusDot").className = "status-dot " + type;
}
