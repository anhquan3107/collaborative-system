// frontend/js/pages/project/whiteboard/whiteboardOpen.js
import { getWhiteboard } from "../../../../api/whiteboard.js";
import { strokes, currentBoardId, redrawCanvas, setCanvasContext } from "./whiteboardState.js";
import { joinWhiteboard } from "./whiteboardSocket.js";
import { updateActiveFile } from "../fileList.js";
import { showWhiteboard } from "../utils.js";
import { notyf } from "../../../../vendor/utils/notify.js"; // ADD THIS
import { projectId } from "../projectWorkspace.js";
import { saveCurrentWhiteboard } from "./whiteboardSave.js";

export async function openWhiteboard(boardId, title) {
    try {
        // Get projectId from URL
        await saveCurrentWhiteboard();
        const result = await getWhiteboard(projectId, boardId);
        console.log("📥 Whiteboard data:", result);

        currentBoardId.value = boardId;
        strokes.length = 0; // Clear current strokes

        showWhiteboard();
        // Initialize canvas context
        const canvas = document.getElementById("whiteboardCanvas");
        if (canvas) {
            const ctx = canvas.getContext("2d");
            setCanvasContext(canvas, ctx);
            
            // Ensure proper canvas size
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;
        }

        // Load existing strokes
        if (result.whiteboard && result.whiteboard.data) {
            try {
                const parsedStrokes = JSON.parse(result.whiteboard.data);
                if (Array.isArray(parsedStrokes)) {
                    parsedStrokes.forEach(s => {
                        strokes.push({
                            ...s,
                            mode: s.mode || "draw"   // 🔥 FIX
                        });
                    });
                }
            } catch (parseError) {
                console.error("Error parsing whiteboard strokes:", parseError);
            }
        }

        redrawCanvas();

        document.getElementById("boardTitle").textContent = title;

        // Use the showWhiteboard function to switch views
        

        joinWhiteboard(boardId);
        updateActiveFile("whiteboard", boardId);

        console.log("✅ Whiteboard opened successfully:", boardId, title);

    } catch (err) {
        console.error("Failed to open whiteboard:", err);
        notyf.error("Failed to load whiteboard: " + err.message);
    }
}