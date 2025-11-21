// frontend/js/pages/projectWorkspace.js - ADD DEBUGGING
import {
  listDocuments,
  createDocument,
  getDocument,
  saveDocument,
} from "../../../../api/document.js";
import { inviteToProject } from "../../../../api/invitation.js";
import { getProjectMembers } from "../../../../api/project.js";

const urlParams = new URLSearchParams(window.location.search);
const projectId = urlParams.get("projectId");
const projectName = urlParams.get("projectName") || "Untitled";
let projectMembers = [];
let quill = null;
let currentDocId = null;
let socket = null;
let isConnected = false;
let isReceivingRemoteUpdate = false;
let saveTimer = null;
// Initialize the workspace
document.addEventListener("DOMContentLoaded", function () {
  if (!checkAuth()) {
    return;
  }

  if (!projectId) {
    document.getElementById("docTitle").textContent =
      "Project ID missing from URL";
    return;
  }

  console.log("🚀 Initializing workspace for project:", projectId);
  document.getElementById("projectName").textContent = projectName;
  initializeQuill();
  initializeSocket();
  loadDocuments();
  loadMembers();
  setupEventListeners();
});
const Size = Quill.import("attributors/style/size");
Size.whitelist = ["10px", "13px", "16px", "18px", "32px", "48px"];
Quill.register(Size, true);

function initializeQuill() {
  console.log("✏️ Initializing Quill Editor...");

  quill = new Quill("#editor-container", {
    modules: {
      toolbar: {
        container: "#toolbar-container",
        handlers: {
          // Add any custom handlers if needed
        },
      },
    },
    placeholder: "Start typing your collaborative document here...",
    theme: "snow",
  });

  // Setup Quill real-time event listener
  quill.on("text-change", handleQuillTextChange);

  console.log("✅ Quill Editor initialized");
}

function initializeSocket() {
  console.log("🔌 Initializing Socket.IO connection...");
  socket = io();

  socket.on("connect", () => {
    isConnected = true;
    updateConnectionStatus("Connected", "text-success");
    console.log("✅ Socket.IO Connected - ID:", socket.id);
    if (currentDocId) {
      socket.emit("join_document", { docId: currentDocId });
    }
  });

  socket.on("disconnect", () => {
    isConnected = false;
    updateConnectionStatus("Disconnected", "text-danger");
    console.log("❌ Socket.IO Disconnected");
  });

  // REAL-TIME COLLABORATION - WITH DEBUGGING
  socket.on("document_patch", (data) => {
    if (data.docId == currentDocId && quill) {
      // 1. Self-Correction: Ignore updates that came from MY socket
      // The backend sends 'fromSocketId' so we can filter this out.
      if (data.fromSocketId === socket.id) {
        // console.log('↩️ Ignoring my own echo');
        return;
      }

      // 2. Apply the Delta
      try {
        isReceivingRemoteUpdate = true; // Set flag to prevent loop
        // If the patch is an object, assume it's a Quill Delta
        if (typeof data.patch === "object") {
          console.log("⚡ Applying remote Delta update");
          quill.updateContents(data.patch);
        }
        // Fallback: If it's a string, it might be legacy HTML or a full replace
        else {
          console.warn("⚠️ Received string patch, performing full replace");
          const currentHtml = quill.root.innerHTML;
          if (currentHtml !== data.patch) {
            quill.clipboard.dangerouslyPasteHTML(data.patch);
          }
        }

        flashEditorBorder("success");
      } catch (err) {
        console.error("Error applying patch:", err);
      } finally {
        setTimeout(() => {
          isReceivingRemoteUpdate = false; // Reset flag
        }, 100);
      }
    }
  });

  socket.on("document_saved", (data) => {
    console.log("💾 RECEIVED document_saved:", data);
    if (data.docId == currentDocId) {
      document.getElementById(
        "lastSaved"
      ).textContent = `Last saved: ${new Date(
        data.updatedAt
      ).toLocaleString()}`;
      flashEditorBorder("info");
    }
  });

  // Add error handling
  socket.on("connect_error", (error) => {
    console.error("❌ Socket connection error:", error);
    updateConnectionStatus("Connection Failed", "text-danger");
  });
}

// Handler for local Quill text changes (Sending the Delta)
function handleQuillTextChange(delta, oldDelta, source) {
  // Only emit changes made by the 'user' (not API/remote updates)
  if (source === "user" && !isReceivingRemoteUpdate) {
    if (socket && currentDocId) {
      socket.emit("edit_document", {
        // Send the specific 'delta' object, not the whole document
        docId: currentDocId,
        patch: delta, // Sending JSON Delta object directly
      });
    }
    // Debounce the full SAVE to database
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveCurrentDocument, 2000);
  }
}

async function openDocument(docId, docTitle) {
  try {
    console.log("📖 Opening document:", { docId, docTitle });

    if (currentDocId && socket) {
      socket.emit("leave_document", { docId: currentDocId });
      const prevIndicator = document.getElementById(
        `indicator-${currentDocId}`
      );
      if (prevIndicator) prevIndicator.style.display = "none";
    }

    const data = await getDocument(projectId, docId);
    currentDocId = Number(docId);

    document.getElementById("docTitle").textContent = docTitle;

    if (quill) {
      // Temporarily disable listening to prevent triggering 'text-change' during load
      quill.off("text-change", handleQuillTextChange);

      let content = data.document.content;

      // SMART LOAD: Check if content is JSON (Delta) or HTML
      try {
        // Try parsing as JSON
        if (content && (content.startsWith("{") || content.startsWith("["))) {
          const delta = JSON.parse(content);
          quill.setContents(delta);
          console.log("✅ Loaded as JSON Delta");
        } else {
          // Fallback to HTML for old docs or empty strings
          quill.clipboard.dangerouslyPasteHTML(content || "");
          console.log("ℹ️ Loaded as HTML/Text");
        }
      } catch (e) {
        quill.clipboard.dangerouslyPasteHTML(content || "");
      }

      // Re-enable listening
      quill.on("text-change", handleQuillTextChange);
    }

    document.getElementById("lastSaved").textContent = `Last saved: ${new Date(
      data.document.updated_at
    ).toLocaleString()}`;

    updateDocumentListUI(currentDocId);

    if (socket) {
      socket.emit("join_document", { docId: currentDocId });
      updateConnectionStatus("Connected - Collaborative", "text-success");
      const indicator = document.getElementById(`indicator-${currentDocId}`);
      if (indicator) indicator.style.display = "block";
    }
  } catch (err) {
    console.error("❌ Failed to open document:", err);
    document.getElementById("docTitle").textContent = "Failed to load document";
  }
}

async function saveCurrentDocument() {
  if (!currentDocId) return;

  // Get full content as JSON string
  // Quill.getContents() returns the full Delta object
  const content = JSON.stringify(quill.getContents());

  try {
    console.log("💾 Saving document (JSON)...");
    await saveDocument(projectId, currentDocId, content);

    if (socket) {
      // Notify others that a save happened (updates timestamps)
      // We send 'content' here, but others usually ignore the content
      // in 'save_document' events if they rely on 'edit_document' for stream
      socket.emit("save_document", { docId: currentDocId, content });
    }

    document.getElementById(
      "lastSaved"
    ).textContent = `Last saved: ${new Date().toLocaleString()}`;

    console.log("✅ Document saved successfully");
  } catch (err) {
    console.error("❌ Failed to save document:", err);
    document.getElementById("editorStatus").textContent = "Save failed!";
  }
}
function flashEditorBorder(type) {
  const editor = document.querySelector("#editor-container");
  if (!editor) return;

  // Narrow the element to HTMLElement for safe .style access

  const originalBorder = editor.style.border;
  if (type === "success") editor.style.border = "2px solid #28a745";
  else if (type === "info") editor.style.border = "2px solid #17a2b8";

  setTimeout(() => {
    editor.style.border = originalBorder || "1px solid #ddd";
  }, 500);
}

function updateConnectionStatus(status, className) {
  const statusEl = document.getElementById("editorStatus");
  statusEl.textContent = status;
  statusEl.className = `small ${className}`;
}
async function loadDocuments() {
  try {
    const data = await listDocuments(projectId);
    renderDocumentList(data.documents);
  } catch (err) {
    console.error("❌ Failed to load documents:", err);
    document.getElementById("fileList").innerHTML =
      '<div class="text-danger">Failed to load documents</div>';
  }
}

function renderDocumentList(documents) {
  const fileList = document.getElementById("fileList");

  if (documents.length === 0) {
    fileList.innerHTML = '<div class="text-muted">No documents yet</div>';
    return;
  }

  fileList.innerHTML = documents
    .map(
      (doc) => `
        <div class="doc-item ${doc.id === currentDocId ? "active" : ""}" 
             data-doc-id="${doc.id}" data-doc-title="${doc.title}">
            <div class="font-weight-bold">${doc.title}</div>
            <small class="text-muted">Updated: ${new Date(
              doc.updated_at
            ).toLocaleDateString()}</small>
            <div class="real-time-indicator" id="indicator-${
              doc.id
            }" style="display: none;">
                <small class="text-success">● Live</small>
            </div>
        </div>
    `
    )
    .join("");

  fileList.querySelectorAll(".doc-item").forEach((item) => {
    item.addEventListener("click", () => {
      const docId = item.getAttribute("data-doc-id");
      const docTitle = item.getAttribute("data-doc-title");
      openDocument(docId, docTitle);
    });
  });
}

function updateDocumentListUI(activeDocId) {
  document.querySelectorAll(".doc-item").forEach((item) => {
    const itemId = Number(item.getAttribute("data-doc-id"));
    const isActive = itemId === activeDocId;
    item.classList.toggle("active", isActive);

    const indicator = document.getElementById(`indicator-${itemId}`);
    if (indicator) {
      indicator.style.display = isActive ? "block" : "none";
    }
  });
}

function setupEventListeners() {
  // Create document
  document.getElementById("createDocBtn").addEventListener("click", () => {
    console.log("📝 Opening create document modal");
    $("#createDocModal").modal("show");
  });

  document
    .getElementById("createDocSubmit")
    .addEventListener("click", async () => {
      const title = document.getElementById("newDocTitle").value.trim();
      if (!title) {
        alert("Title required");
        return;
      }

      try {
        const result = await createDocument(projectId, title);
        console.log("✅ Document created:", result);

        $("#createDocModal").modal("hide");
        document.getElementById("newDocTitle").value = "";

        await openDocument(result.document.id, result.document.title);
        loadDocuments();
      } catch (err) {
        console.error("❌ Failed to create document:", err);
        alert("Failed to create document: " + (err.message || "Unknown error"));
      }
    });

  document.getElementById("viewMembersBtn")?.addEventListener("click", () => {
    const listContainer = document.getElementById("projectMembersList");
    $("#projectMembersModal").modal("show");

    if (!projectMembers || projectMembers.length === 0) {
      listContainer.innerHTML =
        '<div class="p-3 text-muted">No members found</div>';
      return;
    }

    // Render the list (already loaded in memory!)
    listContainer.innerHTML = projectMembers
      .map(
        (m) => `
            <div class="list-group-item d-flex justify-content-between align-items-center">
                <div>
                    <i class="fas fa-user-circle text-gray-400 mr-2"></i>
                    <span class="font-weight-bold">${
                      m.username || "Unknown"
                    }</span>
                    <div class="small text-muted ml-4">${
                      m.email || "No email"
                    }</div>
                </div>
                <span class="badge badge-${
                  m.role === "owner" ? "primary" : "secondary"
                }">
                    ${m.role || "member"}
                </span>
            </div>
        `
      )
      .join("");
  });

  // Save document
  document
    .getElementById("saveDocBtn")
    .addEventListener("click", saveCurrentDocument);
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "s") {
      e.preventDefault();
      saveCurrentDocument();
    }
  });
  // --- 4. Invite System ---
  document.getElementById("inviteBtn").addEventListener("click", () => {
    $("#inviteModal").modal("show");
  });

  document
    .getElementById("inviteSubmit")
    .addEventListener("click", async () => {
      const email = document.getElementById("inviteEmail").value.trim();
      const role = document.getElementById("inviteRole").value;

      if (!email) {
        alert("Email is required");
        return;
      }

      try {
        await inviteToProject(projectId, email, role);
        alert("Invitation sent successfully!");
        $("#inviteModal").modal("hide");
        document.getElementById("inviteEmail").value = "";

        // Refresh members list after inviting
        loadMembers();
      } catch (err) {
        alert("Failed to send invitation: " + err.message);
      }
    });
}

function checkAuth() {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Please log in first");
    window.location.href = "/login.html";
    return false;
  }
  return true;
}

async function loadMembers() {
  try {
    const data = await getProjectMembers(projectId);
    projectMembers = data.members || [];

    // Update the button text
    const countSpan = document.getElementById("memberCountBadge");
    if (countSpan) {
      countSpan.textContent = `${projectMembers.length} Member${
        projectMembers.length !== 1 ? "s" : ""
      }`;
    }
  } catch (err) {
    console.error("Failed to load members:", err);
  }

  window.debugCollaboration = function () {
    console.log("=== 🔍 COLLABORATION DEBUG INFO ===");
    console.log("Project ID:", projectId);
    console.log(
      "Current Doc ID:",
      currentDocId,
      "(Type:",
      typeof currentDocId,
      ")"
    );
    console.log("Socket Connected:", isConnected);
    console.log("Socket ID:", socket?.id);
    console.log("Receiving Remote Update:", isReceivingRemoteUpdate);
    console.log("Project Members:", projectMembers?.length || 0);
    console.log("Quill Content Length:", quill?.getText()?.length || 0);
    console.log("==================================");
  };

  // Test real-time manually
  window.testRealTime = function () {
    if (!socket || !currentDocId) {
      console.error("❌ Socket not connected or no document open");
      return;
    }

    const testMessage = `Test message at ${new Date().toLocaleTimeString()}`;
    console.log("🧪 Sending test message:", testMessage);

    socket.emit("edit_document", {
      docId: currentDocId,
      patch: testMessage,
    });
  };
}
