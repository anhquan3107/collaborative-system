export function showPlaceholder() {
    document.getElementById("noDocPlaceholder").style.display = "flex";
    document.getElementById("editorWrapper").style.display = "none";
    // Also hide whiteboard wrapper if it exists
    const whiteboardWrapper = document.getElementById("whiteboardWrapper");
    if (whiteboardWrapper) {
        whiteboardWrapper.style.display = "none";
    }
}

export function showEditor() {
    document.getElementById("noDocPlaceholder").style.display = "none";
    document.getElementById("editorWrapper").style.display = "flex";
    // Also hide whiteboard wrapper
    const whiteboardWrapper = document.getElementById("whiteboardWrapper");
    if (whiteboardWrapper) {
        whiteboardWrapper.style.display = "none";
    }
}

// Add whiteboard display function
export function showWhiteboard() {
    document.getElementById("noDocPlaceholder").style.display = "none";
    document.getElementById("editorWrapper").style.display = "none";
    // Show whiteboard wrapper
    const whiteboardWrapper = document.getElementById("whiteboardWrapper");
    if (whiteboardWrapper) {
        whiteboardWrapper.style.display = "flex";
    }
}

export function updateDocumentStatus(status, className) {
    const statusEl = document.getElementById("editorStatus");
    if (statusEl) {
        statusEl.textContent = status;
        statusEl.className = `small ${className}`;
    }
}

export function updateWhiteboardStatus(status, className) {
    const el = document.getElementById("whiteboardStatus");
    if (el) {
        el.textContent = status;
        el.className = `small ${className}`;
    }
}

export function backToDashboard() {
    window.location.href = "../../index.html"; 
}



