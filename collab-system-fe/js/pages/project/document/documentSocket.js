// frontend/js/pages/project/document/documentSocket.js
import { applyRemotePatch, quill, handleRemoteApply, applySnapshot} from "./documentEditor.js";
import { currentDocId } from "./documentOpen.js";
import { updateDocumentStatus } from "../utils.js";

let socket = null;

export function initDocumentSocket() {
    socket = io();

    socket.on("connect", () => {
        updateDocumentStatus("Connected", "text-success");
    });

    socket.on("disconnect", () => {
        updateDocumentStatus("Disconnected", "text-danger");
    });

    socket.on("document_patch", ({ docId, patch, fromSocketId }) => {
        if (docId !== currentDocId) return;
        if (fromSocketId === socket.id) return; 
        applyRemotePatch(patch);
    });

    socket.on("document_saved", ({ docId, updatedAt }) => {
        if (docId !== currentDocId) return;
        document.getElementById("lastSaved").textContent =
            "Last saved: " + new Date(updatedAt).toLocaleString();
    });

    socket.on("document_snapshot", ({ docId, content }) => {
    if (docId !== currentDocId) return;
    applySnapshot(content);
    });

}

/* ======================
   EXPORTED EMITTERS
====================== */

export function emitJoinDocument(docId, content) {
    if (!socket) return;
    socket.emit("join_document", { docId, content });
}


export function emitLeaveDocument(docId) {
    if (!socket) return;
    socket.emit("leave_document", { docId });
}

export function emitDocumentPatch(docId, patch) {
    if (!socket || !docId) return;

    socket.emit("edit_document", {
        docId,
        patch
    });
}

export function emitSaveDocument(docId, content) {
    if (!socket || !docId) return;

    socket.emit("save_document", {
        docId,
        content
    });
}