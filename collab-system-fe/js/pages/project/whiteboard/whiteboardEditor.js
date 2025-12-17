import { notyf } from "../../../../vendor/utils/notify.js";
import { canvas, ctx, strokes, setCanvasContext, redrawCanvas } from "./whiteboardState.js";
import { queueWhiteboardSave } from "./whiteboardSave.js";
import { broadcastStroke } from "./whiteboardSocket.js";




let currentTool = "brush";
let drawing = false;
let brushSize = 5;
let brushColor = "#000000";


export function initWhiteboardEditor() {
     const toolbar = document.getElementById("whiteboard-toolbar");
    const canvasEl = document.getElementById("whiteboardCanvas");


    // If whiteboard is not present, silently skip
    if (!toolbar || !canvasEl) {
        return;
    }
     if (!canvas || !ctx) return;
    bindToolbarEvents();
    bindCanvasEvents();
}




function bindToolbarEvents() {
    document.getElementById("toolBrush").onclick = () => (currentTool = "brush");
    document.getElementById("toolEraser").onclick = () => (currentTool = "eraser");
    document.getElementById("toolBucket").onclick = () => (currentTool = "bucket");


    document.getElementById("brushSize").oninput = (e) =>
        (brushSize = parseInt(e.target.value));


    document.getElementById("brushColor").oninput = (e) =>
        (brushColor = e.target.value);


    document.getElementById("clearBoardBtn").onclick = clearCanvas;
}


function bindCanvasEvents() {
    canvas.addEventListener("mousedown", startDraw);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", stopDraw);
    canvas.addEventListener("mouseleave", stopDraw);


    canvas.addEventListener("click", handleBucketFill);
}


function startDraw(e) {
    if (!canvas || !ctx) return;
    if (currentTool === "bucket") return;


    drawing = true;


    const stroke = {
        color: currentTool === "eraser" ? "#FFFFFF" : brushColor,
        size: brushSize,
        points: []
    };


    strokes.push(stroke);
    addPoint(e);
}


function draw(e) {
     if (!drawing) return;
    addPoint(e);


    // Broadcast latest stroke
    broadcastStroke(strokes[strokes.length - 1]);


    redrawCanvas();
}


function stopDraw() {
    drawing = false;
    queueWhiteboardSave();
}
function addPoint(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;


    if (strokes.length > 0) {
        strokes[strokes.length - 1].points.push({ x, y });
    }
}
function handleBucketFill(e) {
    if (currentTool !== "bucket") return;
    ctx.fillStyle = brushColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);


    // Save as a single fill stroke
    strokes.push({
        color: brushColor,
        size: 0,
        points: [] // empty points means "fill"
    });


    queueWhiteboardSave();
}
function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
   
    strokes.length = 0;
    queueWhiteboardSave();
    notyf.success("Canvas cleared");
}

