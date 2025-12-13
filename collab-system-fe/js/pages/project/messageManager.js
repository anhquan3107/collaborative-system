import { messageNotyf } from "../../../vendor/utils/notify.js";

let socket = null;

/**
 * Dashboard-style popup inside project workspace
 * No userId needed (backend already filters sender)
 */
export function initProjectWorkspacePopup() {
    socket = io();

    socket.on("connect", () => {
        console.log("📡 Workspace popup connected");
    });

    // SAME event as dashboard
    socket.on("new_message_notification", (msg) => {
        showMessageNotification(msg);
    });
}

function showMessageNotification(msg) {
    const notification = messageNotyf.open({
        type: "message",
        message: `
            <div style="font-weight:700; font-size:15px;">
                ${msg.username}
            </div>
            <div style="font-size:14px;">
                ${msg.content}
            </div>
        `
    });

    notification.on("click", () => {
        window.location.href =
            `../../chat.html?projectId=${msg.projectId}`;
    });
}
