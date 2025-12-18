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

    socket.on("whiteboard_point", ({ boardId, strokeId, point, color, size }) => {
        if (boardId !== currentBoardId.value) return;

        let stroke = strokes.find(s => s.id === strokeId);

        if (!stroke) {
            stroke = {
                id: strokeId,
                color,
                size,
                points: []
            };
            strokes.push(stroke);
        }

        stroke.points.push(point);
        redrawCanvas();
    });
    
    socket.on("whiteboard_snapshot", (snapshot) => {
        strokes.length = 0;
        strokes.push(...snapshot);
        redrawCanvas();
    });

    socket.on("whiteboard_saved", ({ boardId, updatedAt }) => {
        if (boardId !== currentBoardId.value) return;

        document.getElementById("whiteboardLastSaved").textContent =
            "Last saved: " + new Date(updatedAt).toLocaleString();
    });
}

export function broadcastPoint({ boardId, strokeId, point, color, size }) {
    if (!socket || !boardId) return;

    socket.emit("whiteboard_point", {
        boardId,
        strokeId,
        point,
        color,
        size
    });
}

export function broadcastStrokeEnd({ boardId, strokeId }) {
    if (!socket || !boardId) return;

    socket.emit("whiteboard_stroke_end", {
        boardId,
        strokeId
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