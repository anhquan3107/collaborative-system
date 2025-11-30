// frontend/js/pages/project/fileCreate.js
import { projectId } from "./projectWorkspace.js";
import { loadAllFiles } from "./fileList.js";

import { createDocument } from "../../../api/document.js";
import { createWhiteboard } from "../../../api/whiteboard.js";

// FIXED: Correct import paths
import { openDocument } from "./document/documentOpen.js";
import { openWhiteboard } from "./whiteboard/whiteboardOpen.js"; // UNCOMMENT AND FIX PATH

import { notyf } from "../../../vendor/utils/notify.js";

export function setupCreateFileListeners() {
    const createBtn = document.getElementById("createFileBtn");
    const submitBtn = document.getElementById("createFileSubmit");

    if (!createBtn || !submitBtn) return;

    createBtn.addEventListener("click", () => {
        $("#createFileModal").modal("show");
    });

    submitBtn.addEventListener("click", async () => {
        const title = document.getElementById("newFileTitle").value.trim();
        const type = document.getElementById("newFileType").value;

        if (!title) return notyf.error("Title is required!");

        try {
            if (type === "document") {
                const result = await createDocument(projectId, title);
                console.log("📄 Document creation result:", result);
                await openDocument(result.document.id, result.document.title);
            } 
            else if (type === "whiteboard") {
                const result = await createWhiteboard(projectId, title);
                console.log("🎨 Whiteboard creation result:", result);

                // FIX: Handle the backend response structure
                let whiteboardId, whiteboardTitle;

                if (result && result.whiteboard) {
                    // New structure: { whiteboard: { id, title, ... } }
                    whiteboardId = result.whiteboard.id;
                    whiteboardTitle = result.whiteboard.title;
                } else if (result && result.whiteboardId) {
                    // Old structure: { whiteboardId: 123 }
                    whiteboardId = result.whiteboardId;
                    whiteboardTitle = title;
                } else {
                    throw new Error("Unexpected API response structure: " + JSON.stringify(result));
                }

                console.log("🖌️ Opening whiteboard:", { whiteboardId, whiteboardTitle });
                await openWhiteboard(whiteboardId, whiteboardTitle);
            }

            $("#createFileModal").modal("hide");
            document.getElementById("newFileTitle").value = "";
            await loadAllFiles();
            notyf.success(type + " created successfully!");
        } catch (err) {
            console.error("❌ Failed to create file:", err);
            notyf.error("Failed to create " + type + ": " + err.message);
        }
    });
}