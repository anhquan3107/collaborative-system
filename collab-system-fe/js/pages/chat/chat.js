import { getProjects } from "../../../api/project.js";
import { getChatHistory } from "../../../api/chat.js";
import { getCurrentUser } from "../../../api/user.js";

// State
let activeProjectId = null;
let currentUser = null;
let socket = null;


document.addEventListener('DOMContentLoaded', async () => {
    if (!checkAuth()) return;

    try {
        const userData = await getCurrentUser();
        currentUser = userData.user;
    } catch (err) {
        console.error("Token invalid:", err);
        localStorage.removeItem("token");
        window.location.href = '../../login.html';
        return;
    }

    initSocket();
    loadUserProjects();
    setupGlobalListeners();
});

// --- AUTH HELPER ---
function checkAuth() {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = '../../login.html';
        return false;
    }
    return true;
}

// --- SIDEBAR: LOAD PROJECTS ---
async function loadUserProjects() {
    const listEl = document.getElementById('projectList');
    try {
        const data = await getProjects();
        const projects = data.projects || [];

        if (projects.length === 0) {
            listEl.innerHTML = '<div class="text-center text-muted mt-3">No projects found</div>';
            return;
        }

        listEl.innerHTML = projects.map(p => `
            <div class="project-item" onclick="window.switchProject(${p.id}, '${p.name.replace(/'/g, "\\'")}')" id="proj-${p.id}">
                <div class="project-icon">${p.name.substring(0,2).toUpperCase()}</div>
                <div class="text-truncate font-weight-bold">${p.name}</div>
            </div>
        `).join('');

    } catch (err) {
        console.error("Error loading projects", err);
        listEl.innerHTML = '<div class="text-danger p-3">Failed to load projects</div>';
    }
}

// --- PROJECT SWITCHING ---
window.switchProject = async function(projectId, projectName) {
    if (activeProjectId === projectId) return;

    // Update Sidebar UI
    document.querySelectorAll('.project-item').forEach(el => el.classList.remove('active'));
    const activeItem = document.getElementById(`proj-${projectId}`);
    if(activeItem) activeItem.classList.add('active');

    // Handle Socket Rooms
    if (activeProjectId) {
        socket.emit('leave_project_chat', { projectId: activeProjectId });
    }

    activeProjectId = projectId;
    document.getElementById('activeProjectName').textContent = projectName;
    document.getElementById('emptyState').style.display = 'none';
    document.getElementById('projectWorkspace').style.display = 'flex';

    // Join new room
    socket.emit('join_project_chat', { projectId, username: currentUser.username });
    
    // Load Chat History
    document.getElementById('chatMessages').innerHTML = '';
    await loadChatHistory(projectId);
};

// --- SOCKET LOGIC ---
function initSocket() {
    // Connect to backend
    socket = io(); 
    
    socket.on('connect', () => {
        console.log('Socket Connected');
        document.getElementById('connectionStatus').textContent = 'Online';
        document.getElementById('connectionStatus').className = 'text-success small';
    });

    // 1. Chat Message Received
    socket.on('receive_chat_message', (msg) => {
        if(msg.project_id == activeProjectId || !msg.project_id) {
             appendMessage(msg);
             scrollToBottom();
        }
    });

    // 2. Incoming Call Invitation
    socket.on("incoming_call_invite", ({ projectId, callerName }) => {
        // Only show modal if we are looking at the project, or globally if you prefer
        // Here we assume global notification, but check if user is busy
        if (activeProjectId == projectId) {
            document.getElementById('callerNameDisplay').textContent = callerName;
            $('#callModal').modal('show');
        }
    });
}

// --- CHAT FUNCTIONS ---
async function loadChatHistory(projectId) {
    try {
        const data = await getChatHistory(projectId);
        (data.messages || []).forEach(appendMessage);
        scrollToBottom();
    } catch (err) {
        console.error("Failed to load chat", err);
    }
}

function appendMessage(msg) {
    const box = document.getElementById('chatMessages');
    const isMe = msg.user_id === currentUser.id;
    
    const div = document.createElement('div');
    div.className = `message ${isMe ? 'sent' : 'received'}`;
    div.innerHTML = `
        <div class="message-meta">${isMe ? 'You' : msg.username}</div>
        ${msg.content}
    `;
    box.appendChild(div);
}

function scrollToBottom() {
    const box = document.getElementById('chatMessages');
    box.scrollTop = box.scrollHeight;
}

function sendMessage() {
    if(!activeProjectId) return;
    const input = document.getElementById('chatInput');
    const content = input.value.trim();
    if(!content) return;

    socket.emit('send_chat_message', {
        projectId: activeProjectId,
        userId: currentUser.id,
        content
    });
    input.value = '';
}

// --- GLOBAL LISTENERS ---
function setupGlobalListeners() {
    // Chat Input
    document.getElementById('sendBtn').addEventListener('click', sendMessage);
    document.getElementById('chatInput').addEventListener('keypress', (e) => {
        if(e.key === 'Enter') sendMessage();
    });

    // --- CALL BUTTON CLICKED (Initiator) ---
    document.getElementById('callBtn').addEventListener('click', () => {
        if(!activeProjectId) return;

        // 1. Tell server to invite others
        socket.emit("initiate_call_invite", { 
            projectId: activeProjectId, 
            callerName: currentUser.username 
        });

        // 2. Open Call Page in New Tab as Initiator
        // Note: Ensure call.html exists in frontend root or adjust path
        window.open(`../../call.html?projectId=${activeProjectId}&initiator=true`, '_blank');
    });

    // --- JOIN BUTTON CLICKED (Receiver) ---
    document.getElementById('joinCallBtn').addEventListener('click', () => {
        $('#callModal').modal('hide');
        
        // Open Call Page in New Tab as Receiver
        window.open(`../../call.html?projectId=${activeProjectId}&initiator=false`, '_blank');
    });
}