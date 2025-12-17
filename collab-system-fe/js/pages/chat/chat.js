import { getProjects } from "../../../api/project.js";
import { getChatHistory } from "../../../api/chat.js";
import { getCurrentUser } from "../../../api/user.js";
import { checkAuth } from "../../../vendor/utils/auth.js";
import { initChatMessageManager } from "./messageManager.js";
// State
let activeProjectId = null;
let currentUser = null;
let socket = null;

// =============================================
// PAGE LOAD
// =============================================
document.addEventListener('DOMContentLoaded', async () => {
    if (!checkAuth()) return;

    // Load current user
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
    await loadUserProjects();  // IMPORTANT
    autoOpenProjectFromURL();  // NEW FEATURE
    setupGlobalListeners();
});

// =============================================
// LOAD USER PROJECTS (Sidebar)
// =============================================
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
            <div class="project-item" 
                 onclick="window.switchProject(${p.id}, '${p.name.replace(/'/g, "\\'")}')" 
                 id="proj-${p.id}">

                <div class="project-icon">${p.name.substring(0,2).toUpperCase()}</div>
                <div class="text-truncate font-weight-bold">${p.name}</div>
            </div>
        `).join('');

    } catch (err) {
        console.error("Error loading projects", err);
        listEl.innerHTML = '<div class="text-danger p-3">Failed to load projects</div>';
    }
}

// =============================================
// NEW: AUTO-OPEN PROJECT FROM URL
// =============================================
function autoOpenProjectFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const pid = urlParams.get("projectId");

    if (!pid) return;

    // Try to get project name from sidebar
    const projEl = document.getElementById(`proj-${pid}`);
    let projectName = "Project";

    if (projEl) {
        projectName = projEl.querySelector(".text-truncate").textContent;
    }

    console.log("🔵 Auto-opening project from URL:", pid, projectName);
    window.switchProject(Number(pid), projectName);
}

// =============================================
// SWITCH PROJECT (Chat Room)
// =============================================
window.switchProject = async function(projectId, projectName) {
    if (activeProjectId === projectId) return;

    // Sidebar highlight
    document.querySelectorAll('.project-item')
        .forEach(el => el.classList.remove('active'));

    const activeItem = document.getElementById(`proj-${projectId}`);
    if (activeItem) activeItem.classList.add('active');

    // Leave previous room
    if (activeProjectId) {
        socket.emit('leave_project_chat', { projectId: activeProjectId });
    }

    // Join new room
    activeProjectId = projectId;
    document.getElementById('activeProjectName').textContent = projectName;
    document.getElementById('emptyState').style.display = 'none';
    document.getElementById('projectWorkspace').style.display = 'flex';

    socket.emit('join_project_chat', { 
        projectId, 
        username: currentUser.username 
    });

    // Load chat history
    document.getElementById('chatMessages').innerHTML = '';
    await loadChatHistory(projectId);
};

// =============================================
// SOCKETS
// =============================================
function initSocket() {
    socket = io();

    socket.on('connect', () => {
        console.log('Socket Connected');
        document.getElementById('connectionStatus').textContent = 'Online';
        document.getElementById('connectionStatus').className = 'text-success small';
    });
    initChatMessageManager(socket);

    // Receive messages for current project only
    socket.on('receive_chat_message', (msg) => {
        if (msg.project_id === activeProjectId) {
            appendMessage(msg);
            scrollToBottom();
        }
    });
    
    // Call invite
    socket.on("incoming_call_invite", ({ projectId, callerName }) => {
        if (activeProjectId == projectId) {
            document.getElementById('callerNameDisplay').textContent = callerName;
            $('#callModal').modal('show');
        }
    });
}

// =============================================
// CHAT FUNCTIONS
// =============================================
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
    if (!activeProjectId) return;

    const input = document.getElementById('chatInput');
    const content = input.value.trim();
    if (!content) return;

    socket.emit('send_chat_message', {
        projectId: activeProjectId,
        userId: currentUser.id,
        content
    });

    input.value = '';
}

// =============================================
// GLOBAL LISTENERS
// =============================================
function setupGlobalListeners() {
    document.getElementById('sendBtn').addEventListener('click', sendMessage);

    document.getElementById('chatInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    document.getElementById('callBtn').addEventListener('click', () => {
        if (!activeProjectId) return;

        socket.emit("initiate_call_invite", { 
            projectId: activeProjectId, 
            callerName: currentUser.username 
        });

        window.open(`../../call.html?projectId=${activeProjectId}&initiator=true`, '_blank');
    });

    document.getElementById('joinCallBtn').addEventListener('click', () => {
        $('#callModal').modal('hide');
        window.open(`../../call.html?projectId=${activeProjectId}&initiator=false`, '_blank');
    });
}
