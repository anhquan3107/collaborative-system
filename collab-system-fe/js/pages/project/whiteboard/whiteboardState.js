// frontend/js/pages/project/whiteboard/whiteboardState.js
export const currentBoardId = { value: null };
export const strokes = [];
export let canvas = null;
export let ctx = null;

export function setCanvasContext(canvasEl, ctxObj) {
    canvas = canvasEl;
    ctx = ctxObj;
}

export function redrawCanvas() {
    if (!ctx || !canvas) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    strokes.forEach(stroke => {
        if (!stroke.points.length) return;
        
        ctx.beginPath();
        ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
        
        stroke.points.forEach(point => {
            ctx.lineTo(point.x, point.y);
        });
        
        ctx.strokeStyle = stroke.color || "#000000";
        ctx.lineWidth = stroke.size || 2;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.stroke();
    });
}