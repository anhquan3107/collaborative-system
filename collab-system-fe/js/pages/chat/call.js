
// 1. Parse URL Parameters
const urlParams = new URLSearchParams(window.location.search);
const projectId = urlParams.get('projectId');
const isInitiator = urlParams.get('initiator') === 'true';

// Global Variables
let socket = null;
let localStream = null;
let peerConnection = null;
let isMuted = false;
let isVideoOff = false;

// Google's Public STUN Server (Required for connecting through NAT/Routers)
const rtcConfig = { 
    iceServers: [
        // 1. Google's STUN (Keeps it fast if possible)
        { urls: 'stun:stun.l.google.com:19302' },
        
        // 2. OpenRelay TURN (The backup Bridge)
        {
            urls: "turn:openrelay.metered.ca:80",
            username: "openrelayproject",
            credential: "openrelayproject"
        },
        {
            urls: "turn:openrelay.metered.ca:443",
            username: "openrelayproject",
            credential: "openrelayproject"
        },
        {
            urls: "turn:openrelay.metered.ca:443?transport=tcp",
            username: "openrelayproject",
            credential: "openrelayproject"
        }
    ]
};

// Start on Load
document.addEventListener('DOMContentLoaded', async () => {
    if (!projectId) {
        updateStatus('error', 'Invalid Call ID');
        return;
    }
    
    // Setup Button Listeners
    document.getElementById('hangupBtn').addEventListener('click', endCall);
    document.getElementById('muteBtn').addEventListener('click', toggleMute);
    document.getElementById('cameraBtn').addEventListener('click', toggleVideo);

    try {
        await startLocalVideo();
        initSocket();
    } catch (err) {
        console.error("Startup Error:", err);
        updateStatus('error', 'Camera Access Denied');
    }
});

// --- 1. MEDIA HANDLERS ---
async function startLocalVideo() {
    updateStatus('warning', 'Accessing Camera...');
    try {
        // FIX 1: Add Advanced Audio Constraints
        localStream = await navigator.mediaDevices.getUserMedia({ 
            video: true, 
            audio: {
                echoCancellation: true, // <--- CRITICAL for removing echo
                noiseSuppression: true, // Helps with background noise
                autoGainControl: true   // Keeps volume steady
            } 
        });
        
        const localVid = document.getElementById('localVideo');
        localVid.srcObject = localStream;
        
        // FIX 2: Double check it is muted in code
        localVid.muted = true; 
        localVid.volume = 0;

    } catch (err) {
        alert("Could not access camera. Ensure you are using HTTPS!");
        throw err;
    }
}

function toggleMute() {
    if (!localStream) return;
    
    // Toggle audio track
    const audioTrack = localStream.getAudioTracks()[0];
    if (audioTrack) {
        isMuted = !isMuted;
        audioTrack.enabled = !isMuted;
        
        const btn = document.getElementById('muteBtn');
        btn.innerHTML = isMuted ? '<i class="fas fa-microphone-slash"></i>' : '<i class="fas fa-microphone"></i>';
        btn.style.backgroundColor = isMuted ? '#858796' : '#4e73df';
    }
}
function toggleVideo() {
    if (!localStream) return;
    
    // Get the video track (index 0 usually)
    const videoTrack = localStream.getVideoTracks()[0];
    
    if (videoTrack) {
        isVideoOff = !isVideoOff;
        
        // Enable/Disable the track
        videoTrack.enabled = !isVideoOff;
        
        // Update Button UI
        const btn = document.getElementById('cameraBtn');
        if (isVideoOff) {
            btn.innerHTML = '<i class="fas fa-video-slash"></i>';
            btn.style.backgroundColor = '#858796'; // Grey (Off)
        } else {
            btn.innerHTML = '<i class="fas fa-video"></i>';
            btn.style.backgroundColor = '#4e73df'; // Blue (On)
        }
    }
}

// --- 2. SOCKET SIGNALING ---
function initSocket() {
    updateStatus('warning', 'Connecting to server...');
    socket = io(); // Connect to backend
    
    socket.on('connect', () => {
        // Join the specific VIDEO room
        socket.emit('join_video_room', { projectId });
        
        // LOGIC SPLIT:
        if (isInitiator) {
            // Initiator waits for someone to join
            updateStatus('warning', 'Waiting for answer...');
        } else {
            // Receiver joins and shouts "I'm here!" to trigger the offer
            updateStatus('warning', 'Joining call...');
            socket.emit('video_signal', { projectId, type: 'join', payload: {} });
        }
    });

    // Handle Signals from Peer
    socket.on('video_signal', async (data) => {
        if (data.from === socket.id) return; // Ignore own signals

        console.log('Received Signal:', data.type);

        switch (data.type) {
            case 'join':
                // Initiator sees Receiver -> Create Offer
                if (isInitiator) {
                    updateStatus('connected', 'Connecting...');
                    await createOffer();
                }
                break;
            
            case 'offer':
                // Receiver sees Offer -> Create Answer
                if (!isInitiator) {
                    updateStatus('connected', 'Connecting...');
                    await handleOffer(data.payload);
                }
                break;
            
            case 'answer':
                // Initiator sees Answer -> Save it
                if (isInitiator) await handleAnswer(data.payload);
                break;
            
            case 'ice':
                // Add Network Candidate
                await handleIce(data.payload);
                break;
        }
    });
}

// --- 3. WEBRTC LOGIC ---

function createPeerConnection() {
    if (peerConnection) return; // Already created

    peerConnection = new RTCPeerConnection(rtcConfig);
    
    // Add Local Tracks (Video/Audio) to Connection
    localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
    });

    // Event: When Remote Stream Arrives
    peerConnection.ontrack = (event) => {
        console.log("Remote Stream Received");
        document.getElementById('remoteVideo').srcObject = event.streams[0];
        updateStatus('connected', 'Connected');
    };

    // Event: When Network Candidate Found (Send to Peer)
    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            socket.emit('video_signal', { 
                projectId, 
                type: 'ice', 
                payload: event.candidate 
            });
        }
    };
    
    // Event: Peer Disconnected
    peerConnection.onconnectionstatechange = () => {
        if (peerConnection.connectionState === 'disconnected') {
            updateStatus('error', 'Peer Disconnected');
            setTimeout(window.close, 2000); // Close window after 2s
        }
    };
}

async function createOffer() {
    createPeerConnection();
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    
    // Send Offer
    socket.emit('video_signal', { projectId, type: 'offer', payload: offer });
}

async function handleOffer(offer) {
    createPeerConnection();
    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    
    // Send Answer
    socket.emit('video_signal', { projectId, type: 'answer', payload: answer });
}

async function handleAnswer(answer) {
    if (!peerConnection) return;
    await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
}

async function handleIce(candidate) {
    if (peerConnection) {
        try {
            await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
            console.error("Error adding ICE:", e);
        }
    }
}

// --- 4. UI HELPERS ---
function endCall() {
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
    }
    if (peerConnection) {
        peerConnection.close();
    }
    if (socket) {
        socket.disconnect();
    }
    window.close();
}

function updateStatus(type, text) {
    const dot = document.getElementById('statusDot');
    const txt = document.getElementById('statusText');
    
    txt.textContent = text;
    dot.className = 'status-dot ' + type;
}