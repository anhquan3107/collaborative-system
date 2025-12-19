import { currentBoardId, strokes, redrawCanvas, setCanvasContext } from "./whiteboardState.js";
import { queueWhiteboardSave } from "./whiteboardSave.js";
import { broadcastPoint, broadcastStrokeEnd } from "./whiteboardSocket.js";
import { getToolState } from "./whiteboardEditor.js";


let drawing = false;
let currentStroke = null;

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

    const { tool, color, size } = getToolState();

    currentStroke = {
        id: crypto.randomUUID(),
        color,
        size,
        mode: tool === "eraser" ? "erase" : "draw",
        points: []
    };

    strokes.push(currentStroke);
    addPoint(e);
}

function draw(e) {
    if (!drawing || !currentStroke) return;

    const point = addPoint(e);

    broadcastPoint({
        boardId: currentBoardId.value,
        strokeId: currentStroke.id,
        point,
        color: currentStroke.color,
        size: currentStroke.size,
        mode: currentStroke.mode 
    });

    redrawCanvas();
}

function stopDrawing() {
    if (!drawing || !currentStroke) return;

    drawing = false;

    broadcastStrokeEnd({
        boardId: currentBoardId.value,
        strokeId: currentStroke.id
    });

    currentStroke = null;
    queueWhiteboardSave();
}

function addPoint(e) {
    const rect = e.target.getBoundingClientRect();
    const point = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };

    currentStroke.points.push(point);
    return point;
}
