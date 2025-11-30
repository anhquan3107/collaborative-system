// frontend/js/pages/project/document/documentEditor.js
import { saveDocument } from "../../../../api/document.js";
import { currentDocId } from "./documentOpen.js";
import { projectId } from "../projectWorkspace.js";
import { notyf } from "../../../../vendor/utils/notify.js";

export let quill = null;
let saveTimer = null;
let isReceivingRemote = false;

export function initEditor() {
    const Size = Quill.import("attributors/style/size");
    Size.whitelist = ["10px", "13px", "16px", "18px", "32px", "48px"];
    Quill.register(Size, true);

    quill = new Quill("#editor-container", {
        modules: { toolbar: { container: "#toolbar-container" } },
        theme: "snow",
        placeholder: "Start writing...",
    });

    quill.on("text-change", handleRemoteApply);

    setupEditorSaveListeners();
}

function setupEditorSaveListeners() {
    document.getElementById("saveDocBtn")?.addEventListener("click", saveCurrentDocument);

    document.addEventListener("keydown", (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === "s") {
            e.preventDefault();
            saveCurrentDocument();
        }
    });
}

export function handleRemoteApply(delta, oldDelta, source) {
    if (source !== "user" || isReceivingRemote) return;

    window.docSocket?.emit("edit_document", {
        docId: currentDocId,
        patch: delta,
    });

    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveCurrentDocument, 1500);
}

export async function saveCurrentDocument() {
    if (!currentDocId) return;

    const content = JSON.stringify(quill.getContents());

    try {
        await saveDocument(projectId, currentDocId, content);

        window.docSocket?.emit("save_document", {
            docId: currentDocId,
            content,
        });

        document.getElementById("lastSaved").textContent =
            "Last saved: " + new Date().toLocaleString();

    } catch (err) {
        console.error(err);
        notyf.error("Save failed!");
    }
}

export function applyRemotePatch(patch) {
    try {
        isReceivingRemote = true;
        quill.updateContents(patch);
    } finally {
        setTimeout(() => (isReceivingRemote = false), 100);
    }
}
