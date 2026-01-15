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

    // Reset canvas completely
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    strokes.forEach(stroke => {
        if (!stroke.points || stroke.points.length < 2) return;

        ctx.save();

        // ERASER SUPPORT
        if (stroke.mode === "erase") {
            ctx.globalCompositeOperation = "destination-out";
        } else {
            ctx.globalCompositeOperation = "source-over";
            ctx.strokeStyle = stroke.color || "#000";
        }

        ctx.lineWidth = stroke.size || 4;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        ctx.beginPath();
        ctx.moveTo(stroke.points[0].x, stroke.points[0].y);

        //  Keep your smooth quadratic curves
        for (let i = 1; i < stroke.points.length - 1; i++) {
            const prev = stroke.points[i];
            const curr = stroke.points[i + 1];

            const midX = (prev.x + curr.x) / 2;
            const midY = (prev.y + curr.y) / 2;

            ctx.quadraticCurveTo(
                prev.x,
                prev.y,
                midX,
                midY
            );
        }

        // Finish last segment
        const last = stroke.points[stroke.points.length - 1];
        ctx.lineTo(last.x, last.y);

        ctx.stroke();
        ctx.restore();
    });
}
