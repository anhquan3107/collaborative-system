import { messageNotyf } from "../../../vendor/utils/notify.js";
let socket = null;
let unreadCount = 0;
let recentMessages = [];
let badge = null;

// ============================================
// INIT (wait until DOM is ready for badge)
// ============================================
document.addEventListener("DOMContentLoaded", () => {
    unreadCount = parseInt(localStorage.getItem("unreadCount")) || 0;
    badge = document.getElementById("messagesBadge");

    if (badge) {
        badge.textContent = unreadCount;
        badge.style.display = "inline-block"; // always visible
    }
    const statMessages = document.getElementById("statMessages");
    if (statMessages) statMessages.textContent = unreadCount;

    const saved = localStorage.getItem("recentMessages");
    if (saved) {
        recentMessages = JSON.parse(saved);
        renderDropdown();
    }
});

export function initMessageManager() {
    socket = io();

    socket.on("connect", () => {
        console.log("📡 MessageManager connected");
    });

    socket.on("new_message_notification", (msg) => {
        console.log("📩 Dashboard received:", msg);

        // 1️⃣ Show popup
        showMessageNotification(msg);

        // 2️⃣ Show inside dropdown list
        addMessageToCenter(msg);

        // 3️⃣ Increase unread badge
        increaseUnreadBadge();
    });
}

// ============================================
// UPDATE DROPDOWN LIST
// ============================================
function renderDropdown() {
    const listEl = document.getElementById("messagesDropdownList");
    if (!listEl) return;

    listEl.innerHTML = recentMessages.map((m, index) => `
        <a class="dropdown-item d-flex align-items-center message-item"
           data-index="${index}"
           href="chat.html?projectId=${m.projectId}">
            
            <div class="dropdown-list-image mr-3">
                <img class="rounded-circle" src="img/undraw_profile_1.svg">
                <div class="status-indicator bg-success"></div>
            </div>

            <div class="font-weight-bold">
                <div class="text-truncate">${m.content}</div>
                <div class="small text-gray-500">
                    ${m.username} · ${new Date(m.timestamp).toLocaleTimeString()}
                </div>
            </div>
        </a>
    `).join("");

    attachMessageClickHandlers();
}

function attachMessageClickHandlers() {
    document.querySelectorAll(".message-item").forEach(item => {
        
        item.addEventListener("click", (e) => {
            const index = Number(item.dataset.index);

            // 1. Remove the message from dropdown
            recentMessages.splice(index, 1);
            localStorage.setItem("recentMessages", JSON.stringify(recentMessages));

            // 2. Decrease unread count by exactly 1
            unreadCount = Math.max(0, unreadCount - 1);
            localStorage.setItem("unreadCount", unreadCount);

            // 3. Update UI
            updateBadgeAndStats();
            renderDropdown();
        });
    });
}

function updateBadgeAndStats() {
    if (badge) badge.textContent = unreadCount;

    const statEl = document.getElementById("statMessages");
    if (statEl) statEl.textContent = unreadCount;
}

function addMessageToCenter(msg) {
    recentMessages.unshift(msg);
    recentMessages = recentMessages.slice(0, 5);

    localStorage.setItem("recentMessages", JSON.stringify(recentMessages));
    renderDropdown();
}

// ============================================
// BADGE COUNTER
// ============================================
function increaseUnreadBadge() {
    unreadCount++;
    localStorage.setItem("unreadCount", unreadCount);
    if (!badge) return;
    
    badge.textContent = unreadCount;
    badge.style.display = "inline-block"; // always visible
    const statEl = document.getElementById("statMessages");
    if (statEl) statEl.textContent = unreadCount;
}

export function resetUnreadMessages() {
    unreadCount = 0;
    localStorage.setItem("unreadCount", 0);
    if (!badge) return;

    badge.textContent = "0";
    badge.style.display = "inline-block"; // stays visible even at zero

    const statMessages = document.getElementById("statMessages");
    if (statMessages) statMessages.textContent = "0";
}


function showMessageNotification(msg) {
  const notification = messageNotyf.open({
    type: "message",
    message: `
      <div style="font-weight:700; font-size:15px;">${msg.username}</div>
      <div style="font-size:14px;">${msg.content}</div>
    `
  });

  // 💡 Make notification clickable
  notification.on('click', () => {
    // Go to chat.html and open EXACT project
    window.location.href = `../../chat.html?projectId=${msg.projectId}`;
  });
}

export function clearRecentMessages() {
    localStorage.removeItem("unreadCount");
    localStorage.removeItem("recentMessages");
}