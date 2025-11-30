// frontend/js/pages/project/document/documentOpen.js
import { getDocument } from "../../../../api/document.js";
import { quill, handleRemoteApply } from "./documentEditor.js";
import { updateActiveFile } from "../fileList.js";
import { showEditor } from "../utils.js";
import { projectId } from "../projectWorkspace.js";

export let currentDocId = null;

export async function openDocument(docId, title) {
    showEditor();

    try {
        if (currentDocId && window.docSocket) {
            window.docSocket.emit("leave_document", { docId: currentDocId });

            const prevIndicator = document.getElementById(`indicator-${currentDocId}`);
            if (prevIndicator) prevIndicator.style.display = "none";
        }

        const res = await getDocument(projectId, docId);
        currentDocId = docId;

        document.getElementById("docTitle").textContent = title;

        loadIntoQuill(res.document.content);

        document.getElementById("lastSaved").textContent =
            "Last saved: " + new Date(res.document.updated_at).toLocaleString();

        updateActiveFile("document", docId);

        if (window.docSocket) {
            window.docSocket.emit("join_document", { docId });
            const indicator = document.getElementById(`indicator-${docId}`);
            if (indicator) indicator.style.display = "block";
        }

    } catch (err) {
        console.error("Failed to open:", err);
        document.getElementById("docTitle").textContent = "Failed to load";
    }
}

function loadIntoQuill(content) {
    quill.off("text-change");

    try {
        if (content?.startsWith("{") || content?.startsWith("[")) {
            quill.setContents(JSON.parse(content));
        } else {
            quill.clipboard.dangerouslyPasteHTML(content || "");
        }
    } catch {
        quill.clipboard.dangerouslyPasteHTML(content || "");
    }

    quill.on("text-change", handleRemoteApply);
}
