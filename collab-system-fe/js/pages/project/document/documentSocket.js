// frontend/js/pages/project/document/socket.js
import { applyRemotePatch } from "./documentEditor.js";
import { currentDocId } from "./documentOpen.js";
import { updateDocumentStatus } from "../utils.js"; 

let docSocket = null;

export function initDocumentSocket() {
    docSocket = io();

    docSocket.on("connect", () => {
        updateDocumentStatus("Connected", "text-success");
        if (currentDocId) {
            docSocket.emit("join_document", { docId: currentDocId });
        }
    });

    docSocket.on("disconnect", () => {
        updateDocumentStatus("Disconnected", "text-danger");
    });

    docSocket.on("connect_error", (error) => {
        console.error("❌ Socket connection error:", error);
        updateDocumentStatus("Connection Failed", "text-danger");
    });

    docSocket.on("document_patch", ({ docId, patch, fromSocketId }) => {
        if (docId !== currentDocId) return;
        if (fromSocketId === docSocket.id) return;
        applyRemotePatch(patch);
    });

    docSocket.on("document_saved", ({ docId, updatedAt }) => {
        if (docId !== currentDocId) return;
        document.getElementById("lastSaved").textContent =
            "Last saved: " + new Date(updatedAt).toLocaleString();
    });
}

export function emitPatch(patch) {
    if (!docSocket || !currentDocId) return;

    docSocket.emit("document_patch", {
        docId: currentDocId,
        patch,
        fromSocketId: docSocket.id
    });
}

export function saveDocument(content) {
    if (!docSocket || !currentDocId) return;

    docSocket.emit("save_document", {
        docId: currentDocId,
        content
    });
}
