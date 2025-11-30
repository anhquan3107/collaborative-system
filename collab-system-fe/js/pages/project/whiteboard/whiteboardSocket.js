// frontend/js/pages/project/whiteboard/whiteboardSocket.js
import { currentBoardId, strokes, redrawCanvas } from "./whiteboardState.js";
import { updateWhiteboardStatus} from "../utils.js";

let socket = null;

export function initWhiteboardSocket() {
    socket = io();

    socket.on("connect", () => {
        updateWhiteboardStatus("Connected", "text-success");
        if (currentBoardId.value) {
            socket.emit("join_whiteboard", { whiteboardId: currentBoardId.value });
        }
    });

    socket.on("disconnect", () => {
        updateWhiteboardStatus("Disconnected", "text-danger");
    });

    socket.on("connect_error", (err) => {
        console.error("❌ Whiteboard socket error:", err);
        updateWhiteboardStatus("Connection Failed", "text-danger");
    });

    socket.on("whiteboard_stroke", ({ boardId, stroke }) => {
        if (boardId !== currentBoardId.value) return;
        strokes.push(stroke);
        redrawCanvas();
    });

    socket.on("whiteboard_saved", ({ boardId, updatedAt }) => {
        if (boardId !== currentBoardId.value) return;

        document.getElementById("whiteboardLastSaved").textContent =
            "Last saved: " + new Date(updatedAt).toLocaleString();
    });
}

export function broadcastStroke(stroke) {
    if (!currentBoardId.value || !socket) return;
    
    socket.emit("whiteboard_stroke", {
        boardId: currentBoardId.value,
        stroke,
    });
}

export function emitSave(content) {
    if (!currentBoardId.value || !socket) return;
    
    socket.emit("save_whiteboard", {
        boardId: currentBoardId.value,
        strokes: content
    });
}

export function joinWhiteboard(boardId) {
    if (socket) {
        socket.emit("join_whiteboard", { whiteboardId: boardId });
    }
}