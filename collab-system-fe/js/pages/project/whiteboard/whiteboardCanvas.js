// frontend/js/pages/project/whiteboard/whiteboardCanvas.js
import { currentBoardId, strokes, redrawCanvas, setCanvasContext } from "./whiteboardState.js";
import { queueWhiteboardSave } from "./whiteboardSave.js";
import { broadcastStroke } from "./whiteboardSocket.js";

let drawing = false;

export function initWhiteboardCanvas() {
    const canvas = document.getElementById("whiteboardCanvas");
    const ctx = canvas.getContext("2d");
    
    setCanvasContext(canvas, ctx);
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    canvas.addEventListener("mousedown", startDrawing);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", stopDrawing);
    canvas.addEventListener("mouseout", stopDrawing);
}

function resizeCanvas() {
    const canvas = document.getElementById("whiteboardCanvas");
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    redrawCanvas();
}

function startDrawing(e) {
    drawing = true;
    const stroke = { 
        color: "#000000", 
        size: 2, 
        points: [] 
    };
    strokes.push(stroke);
    addPoint(e);
}

function draw(e) {
    if (!drawing) return;
    addPoint(e);
    broadcastStroke(strokes[strokes.length - 1]);
    redrawCanvas();
}

function stopDrawing() {
    drawing = false;
    queueWhiteboardSave();
}

function addPoint(e) {
    const canvas = document.getElementById("whiteboardCanvas");
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (strokes.length > 0) {
        strokes[strokes.length - 1].points.push({ x, y });
    }
}