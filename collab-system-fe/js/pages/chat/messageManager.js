import { messageNotyf } from "../../../vendor/utils/notify.js";

export function initChatMessageManager(socket) {
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
        window.location.href = `chat.html?projectId=${msg.projectId}`;
    });
}
