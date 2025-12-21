// frontend/js/pages/project/document/documentWorkspace.js
import { initEditor } from "./document/documentEditor.js";
import { initDocumentSocket } from "./document/documentSocket.js";
import { loadAllFiles } from "./fileList.js"; 
import { setupCreateFileListeners } from "./fileCreate.js";
import { loadMembers, setupMemberListeners } from "./members.js";
import { loadPendingInvitations, setupInvitationListeners } from "./invitations.js";
import { showPlaceholder, backToDashboard } from "./utils.js";
import { initProjectWorkspacePopup } from "../project/messageManager.js";
// Import whiteboard initialization
import { initWhiteboardCanvas } from "./whiteboard/whiteboardCanvas.js";
import { initWhiteboardSocket } from "./whiteboard/whiteboardSocket.js";
import { initWhiteboardEditor } from "./whiteboard/whiteboardEditor.js";   
export const projectId = new URLSearchParams(window.location.search).get("projectId");
export const projectName =
    new URLSearchParams(window.location.search).get("projectName") || "Untitled";

document.addEventListener("DOMContentLoaded", async () => {
    if (!projectId) {
        alert("Project ID missing");
        backToDashboard();
        return;
    }
document.getElementById("backToDashboardBtn")
        .addEventListener("click", backToDashboard);

    console.log("Initializing workspace for project:", projectId, projectName);

    document.getElementById("projectName").textContent = projectName;

    // Initialize both document and whiteboard components
    initEditor();
    initDocumentSocket();
    initWhiteboardCanvas();  
    initWhiteboardSocket();  

    initProjectWorkspacePopup();
    initWhiteboardEditor();
    // Load data
    await loadAllFiles();
    
    // Setup listeners
    setupCreateFileListeners();
    setupMemberListeners();
    setupInvitationListeners();

    // Load additional data
    await loadMembers();
    await loadPendingInvitations();

    showPlaceholder();
    
    console.log("Workspace initialized with both document and whiteboard support");
});