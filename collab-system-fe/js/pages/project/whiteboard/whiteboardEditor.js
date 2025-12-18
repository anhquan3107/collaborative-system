import { canvas, ctx } from "./whiteboardState.js";

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
    document.getElementById("toolBrush").onclick = () => {};
    document.getElementById("toolEraser").onclick = () => {};

    document.getElementById("brushSize").oninput = (e) =>
        (brushSize = parseInt(e.target.value));

    document.getElementById("brushColor").oninput = (e) =>
        (brushColor = e.target.value);
}
