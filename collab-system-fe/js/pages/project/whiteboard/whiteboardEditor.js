import { canvas, ctx } from "./whiteboardState.js";
import { clearBoardRealtime } from "./whiteboardSocket.js";

let currentTool = "brush";
let brushColor = "#000000";
let brushSize = 5;

export function initWhiteboardEditor() {
    const toolbar = document.getElementById("whiteboard-toolbar");
    const canvasEl = document.getElementById("whiteboardCanvas");

    if (!toolbar || !canvasEl) return;
    if (!canvas || !ctx) return;

    bindToolbarEvents();
}

function bindToolbarEvents() {
    document.getElementById("toolBrush").onclick = () => {
        currentTool = "brush";
    };

    document.getElementById("toolEraser").onclick = () => {
        currentTool = "eraser";
    };

    document.getElementById("brushSize").oninput = (e) =>
        brushSize = parseInt(e.target.value);

    document.getElementById("brushColor").oninput = (e) =>
        brushColor = e.target.value;
    const clearBoardBtn = document.getElementById("clearBoardBtn");
    if (clearBoardBtn) {
        clearBoardBtn.onclick = () => {
            clearBoardRealtime();
        };
    }
}

export function getToolState() {
    return {
        tool: currentTool,
        color: brushColor,
        size: brushSize
    };
}
