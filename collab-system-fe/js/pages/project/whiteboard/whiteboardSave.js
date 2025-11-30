// frontend/js/pages/project/whiteboard/whiteboardSave.js
import { saveWhiteboard } from "../../../../api/whiteboard.js";
import { currentBoardId, strokes } from "./whiteboardState.js";
import { notyf } from "../../../../vendor/utils/notify.js";
import { projectId } from "../projectWorkspace.js";

let saveTimeout = null;

export function queueWhiteboardSave() {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(saveCurrentWhiteboard, 2000);
}

export async function saveCurrentWhiteboard() {
    if (!currentBoardId.value) return;
    clearTimeout(saveTimeout);
    try {
        await saveWhiteboard(projectId, currentBoardId.value, JSON.stringify(strokes));
        
        document.getElementById("whiteboardLastSaved").textContent =
            "Last saved: " + new Date().toLocaleString();
            
        console.log("💾 Whiteboard saved");
            
    } catch (err) {
        console.error("Failed to save whiteboard:", err);
        notyf.error("Save failed: " + err.message);
    }
}