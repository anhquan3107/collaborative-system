// frontend/js/pages/project/fileList.js

// -------------------------------------------
// COMBINED FILE LIST (Documents + Whiteboards)
// -------------------------------------------

// Correct API imports
import { listDocuments } from "../../../api/document.js";
import { listWhiteboards } from "../../../api/whiteboard.js"; // ADD THIS

// Correct open functions
import { openDocument } from "./document/documentOpen.js";
import { openWhiteboard } from "./whiteboard/whiteboardOpen.js"; // ADD THIS

// Project ID from workspace
import { projectId } from "./projectWorkspace.js";

// Notification
import { notyf } from "../../../vendor/utils/notify.js";

// ------------------------------
// Load all files
// ------------------------------
export async function loadAllFiles() {
    try {
        console.log("Loading files for project:", projectId);
        
        // Load both documents and whiteboards
        const [docsResult, boardsResult] = await Promise.all([
            listDocuments(projectId),
            listWhiteboards(projectId) 
        ]);
        
        
        // FIX: Use correct API response structures
        const documents = docsResult.documents || docsResult.document || [];
        const whiteboards = boardsResult.whiteboards || boardsResult.whiteboard || [];
        
        
        // Call renderFileList with both parameters
        renderFileList(documents, whiteboards);

    } catch (err) {
        console.error("Failed to load files:", err);
        document.getElementById("fileList").innerHTML =
            `<div class="text-danger p-3">Failed to load files: ${err.message}</div>`;
    }
}

// ------------------------------
// Render both documents and whiteboards
// ------------------------------
export function renderFileList(documents, whiteboards) {
    const fileList = document.getElementById("fileList");
    
    if (!fileList) {
        console.error("fileList element not found!");
        return;
    }

    // Check if both are empty
    if ((!documents || documents.length === 0) && 
        (!whiteboards || whiteboards.length === 0)) {
        fileList.innerHTML = `
            <div class="text-muted p-3 text-center">
                <i class="fas fa-folder-open fa-2x mb-2"></i><br>
                No files yet<br>
                <small>Create your first document or whiteboard to get started</small>
            </div>`;
        return;
    }

    let html = '';

    // Render documents section
    if (documents && documents.length > 0) {
        html += `
            <div class="file-section-title p-2 bg-light border-bottom">
                <i class="fas fa-file-alt mr-2"></i>Documents (${documents.length})
            </div>
            ${documents.map(d => `
                <div class="file-item doc-item p-3 border-bottom"
                     data-type="document"
                     data-id="${d.id}"
                     data-title="${d.title}">
                    <div class="font-weight-bold text-primary">${d.title}</div>
                    <small class="text-muted">
                        <i class="far fa-clock mr-1"></i>
                        Updated: ${new Date(d.updated_at).toLocaleDateString()}
                    </small>
                </div>
            `).join("")}
        `;
    }

    // Render whiteboards section
    if (whiteboards && whiteboards.length > 0) {
        html += `
            <div class="file-section-title p-2 bg-light border-bottom ${documents.length > 0 ? 'mt-3' : ''}">
                <i class="fas fa-palette mr-2"></i>Whiteboards (${whiteboards.length})
            </div>
            ${whiteboards.map(w => `
                <div class="file-item board-item p-3 border-bottom"
                     data-type="whiteboard"
                     data-id="${w.id}"
                     data-title="${w.title}">
                    <div class="font-weight-bold text-success">${w.title}</div>
                    <small class="text-muted">
                        <i class="far fa-clock mr-1"></i>
                        Updated: ${new Date(w.updated_at).toLocaleDateString()}
                    </small>
                </div>
            `).join("")}
        `;
    }

    fileList.innerHTML = html;
    attachFileListeners();
    console.log("File list rendered with", documents.length, "documents and", whiteboards.length, "whiteboards");
}

// ------------------------------
// Click listeners for both document and whiteboard
// ------------------------------
function attachFileListeners() {
    const fileItems = document.querySelectorAll(".file-item");
    console.log("Attaching listeners to", fileItems.length, "file items");
    
    fileItems.forEach(item => {
        item.addEventListener("click", () => {
            const type = item.dataset.type;
            const id = Number(item.dataset.id);
            const title = item.dataset.title;

            console.log("Opening:", { type, id, title });

            if (type === "document") {
                openDocument(id, title);
            } else if (type === "whiteboard") {
                openWhiteboard(id, title);
            }
        });
    });
}

// ------------------------------
// Highlight active file
// ------------------------------
export function updateActiveFile(type, id) {
    console.log(" Updating active file:", type, id);
    
    document.querySelectorAll(".file-item").forEach(item => {
        const isMatch = (
            item.dataset.type === type &&
            Number(item.dataset.id) === id
        );

        item.classList.toggle("active", isMatch);
        
        // Update indicators for documents
        if (type === "document") {
            const itemId = Number(item.dataset.id);
            const indicator = document.getElementById(`indicator-${itemId}`);
            if (indicator) {
                indicator.style.display = isMatch ? "block" : "none";
            }
        }
        if (type === "whiteboard") {
            const itemId = Number(item.dataset.id);
            const indicator = document.getElementById(`indicator-whiteboard-${itemId}`);
            if (indicator) {
                indicator.style.display = isMatch ? "block" : "none";
            }
        }
    });
}