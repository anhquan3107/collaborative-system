// frontend/js/pages/projectWorkspace.js
import {
  listDocuments,
  createDocument,
  getDocument,
  saveDocument,
} from "../../../../api/document.js";
import {
  inviteToProject,
  getProjectInvitations,
  declineInvitation,
  cancelInvitation,
} from "../../../../api/invitation.js";
import {
  getProjectMembers,
  removeProjectMember,
  updateMemberRole,
} from "../../../../api/project.js";

// ✅ ADD: Notyf import
import { notyf } from "../../../../vendor/utils/notify.js";

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
    document.getElementById("docTitle").textContent = "Project ID missing from URL";
    return;
  }

  console.log("🚀 Initializing workspace for project:", projectId);
  document.getElementById("projectName").textContent = projectName;
  initializeQuill();
  initializeSocket();
  loadDocuments();
  loadMembers();
  showPlaceholder();
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
      },
    },
    placeholder: "Start typing your collaborative document here...",
    theme: "snow",
  });

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

  socket.on("document_patch", (data) => {
    if (data.docId == currentDocId && quill) {
      if (data.fromSocketId === socket.id) return;

      try {
        isReceivingRemoteUpdate = true; 
        if (typeof data.patch === "object") {
          console.log("⚡ Applying remote Delta update");
          quill.updateContents(data.patch);
        } else {
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
          isReceivingRemoteUpdate = false; 
        }, 100);
      }
    }
  });

  socket.on("document_saved", (data) => {
    if (data.docId == currentDocId) {
      document.getElementById("lastSaved").textContent = `Last saved: ${new Date(data.updatedAt).toLocaleString()}`;
      flashEditorBorder("info");
    }
  });

  socket.on("connect_error", (error) => {
    console.error("❌ Socket connection error:", error);
    updateConnectionStatus("Connection Failed", "text-danger");
  });
}

function handleQuillTextChange(delta, oldDelta, source) {
  if (source === "user" && !isReceivingRemoteUpdate) {
    if (socket && currentDocId) {
      socket.emit("edit_document", {
        docId: currentDocId,
        patch: delta, 
      });
    }
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveCurrentDocument, 2000);
  }
}

async function openDocument(docId, docTitle) {
  showEditor();
  try {
    console.log("📖 Opening document:", { docId, docTitle });

    if (currentDocId && socket) {
      socket.emit("leave_document", { docId: currentDocId });
      const prevIndicator = document.getElementById(`indicator-${currentDocId}`);
      if (prevIndicator) prevIndicator.style.display = "none";
    }

    const data = await getDocument(projectId, docId);
    currentDocId = Number(docId);

    document.getElementById("docTitle").textContent = docTitle;

    if (quill) {
      quill.off("text-change", handleQuillTextChange);

      let content = data.document.content;
      try {
        if (content && (content.startsWith("{") || content.startsWith("["))) {
          const delta = JSON.parse(content);
          quill.setContents(delta);
          console.log("✅ Loaded as JSON Delta");
        } else {
          quill.clipboard.dangerouslyPasteHTML(content || "");
          console.log("ℹ️ Loaded as HTML/Text");
        }
      } catch (e) {
        quill.clipboard.dangerouslyPasteHTML(content || "");
      }

      quill.on("text-change", handleQuillTextChange);
    }

    document.getElementById("lastSaved").textContent = `Last saved: ${new Date(data.document.updated_at).toLocaleString()}`;
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
  const content = JSON.stringify(quill.getContents());

  try {
    console.log("💾 Saving document...");
    await saveDocument(projectId, currentDocId, content);

    if (socket) {
      socket.emit("save_document", { docId: currentDocId, content });
    }

    document.getElementById("lastSaved").textContent = `Last saved: ${new Date().toLocaleString()}`;
    console.log("✅ Document saved successfully");
  } catch (err) {
    console.error("❌ Failed to save document:", err);
    document.getElementById("editorStatus").textContent = "Save failed!";
  }
}

function flashEditorBorder(type) {
  const editor = document.querySelector("#editor-container");
  if (!editor) return;
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
    document.getElementById("fileList").innerHTML = '<div class="text-danger">Failed to load documents</div>';
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
            <small class="text-muted">Updated: ${new Date(doc.updated_at).toLocaleDateString()}</small>
            <div class="real-time-indicator" id="indicator-${doc.id}" style="display: none;">
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
  
  // Back Button
  document.getElementById("backToDashboardBtn").addEventListener("click", () => {
     window.location.href = "index.html";
  });

  // Create document
  document.getElementById("createDocBtn").addEventListener("click", () => {
    $("#createDocModal").modal("show");
  });

  document.getElementById("createDocSubmit").addEventListener("click", async () => {
      const title = document.getElementById("newDocTitle").value.trim();
      if (!title) {
        alert("Title required");
        return;
      }

      try {
        const result = await createDocument(projectId, title);
        $("#createDocModal").modal("hide");
        document.getElementById("newDocTitle").value = "";

        await openDocument(result.document.id, result.document.title);
        loadDocuments();
      } catch (err) {
        alert("Failed to create document: " + (err.message || "Unknown error"));
      }
    });

  // View Members Button
  document.getElementById("viewMembersBtn")?.addEventListener("click", () => {
    const listContainer = document.getElementById("projectMembersList");
    $("#projectMembersModal").modal("show");

    if (!projectMembers || projectMembers.length === 0) {
      listContainer.innerHTML = '<div class="p-3 text-muted">No members found</div>';
      return;
    }

    listContainer.innerHTML = projectMembers
      .map(
        (m) => `
        <div class="list-group-item d-flex justify-content-between align-items-center">
          <div>
            <i class="fas fa-user-circle text-gray-400 mr-2"></i>
            <span class="font-weight-bold">${m.username || "Unknown"}</span>
            <div class="small text-muted ml-4">${m.email || "No email"}</div>
          </div>
          <div class="d-flex align-items-center">
            <span class="badge badge-${m.role === "owner" ? "primary" : "secondary"} mr-2">
              ${m.role || "member"}
            </span>
            ${
              m.role === "owner"
                ? ""
                : `<button class="btn btn-sm btn-outline-danger remove-member-btn"
                           data-user-id="${m.user_id}">
                     <i class="fas fa-user-times"></i>
                   </button>`
            }
          </div>
        </div>
      `
      )
      .join("");

    // ✅ ADD: Remove member handler
    listContainer.querySelectorAll(".remove-member-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const userId = btn.getAttribute("data-user-id");
        const memberItem = btn.closest(".list-group-item");

        if (!confirm("Remove this member from the project?")) return;

        try {
          await removeProjectMember(projectId, userId);

          projectMembers = projectMembers.filter(
            (m) => String(m.user_id) !== String(userId)
          );

          if (memberItem) memberItem.remove();

          const countSpan = document.getElementById("memberCountBadge");
          if (countSpan) {
            countSpan.textContent = `${projectMembers.length} Member${
              projectMembers.length !== 1 ? "s" : ""
            }`;
          }

          notyf.success("Member removed.");
        } catch (err) {
          console.error("Remove failed:", err);
          notyf.error(err.message || "Failed to remove member.");
        }
      });
    });

  });

  
  // Save Document
  document.getElementById("saveDocBtn").addEventListener("click", saveCurrentDocument);
  
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "s") {
      e.preventDefault();
      saveCurrentDocument();
    }
  });

  // Invite System
  document.getElementById("inviteBtn").addEventListener("click", () => {
    $("#inviteModal").modal("show");
  });

  document.getElementById("inviteSubmit").addEventListener("click", async () => {
      const email = document.getElementById("inviteEmail").value.trim();
      const role = document.getElementById("inviteRole").value;

      if (!email) {
        alert("Email is required");
        return;
      }

      try {
        await inviteToProject(projectId, email, role);
        notyf.success("Invitation sent successfully!");
        $("#inviteModal").modal("hide");
        document.getElementById("inviteEmail").value = "";
        await loadPendingInvitations();
        await loadMembers();
      } catch (err) {
        notyf.error("Failed to send invitation: " + err.message);
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
    const countSpan = document.getElementById("memberCountBadge");
    if (countSpan) {
      countSpan.textContent = `${projectMembers.length} Member${projectMembers.length !== 1 ? "s" : ""}`;
    }
  } catch (err) {
    console.error("Failed to load members:", err);
  }
}

function showPlaceholder() {
  document.getElementById("noDocPlaceholder").style.display = "flex";
  document.getElementById("editorWrapper").style.display = "none";
}

function showEditor() {
  document.getElementById("noDocPlaceholder").style.display = "none";
  document.getElementById("editorWrapper").style.display = "flex";
}

// Thêm hàm load pending invitations
async function loadPendingInvitations() {
  try {
    const data = await getProjectInvitations(projectId);
    pendingInvitations = data.invitations || [];
    updatePendingInvitationsUI();
  } catch (err) {
    console.error("❌ Failed to load pending invitations:", err);
  }
}

//Add function to display pending invitations in the UI
function updatePendingInvitationsUI() {
  const pendingBadge = document.getElementById("pendingInvitationsBadge");
  const pendingDropdown = document.getElementById("pendingInvitationsDropdown");

  if (!pendingBadge || !pendingDropdown) return;

  // Update badge count
  if (pendingInvitations.length > 0) {
    pendingBadge.textContent = pendingInvitations.length;
    pendingBadge.style.display = "inline-block";
  } else {
    pendingBadge.style.display = "none";
  }

  // Update dropdown content
  if (pendingInvitations.length === 0) {
    pendingDropdown.innerHTML = `
      <div class="p-2 text-center text-muted">
        <small>No pending invitations</small>
      </div>
    `;
    return;
  }

  pendingDropdown.innerHTML = pendingInvitations
    .map(
      (invitation) => `
  <div class="pending-invitation-item p-2 border-bottom">
      <div class="d-flex justify-content-between align-items-start">
        <div class="flex-grow-1">
          <h6 class="mb-1 text-primary">Invited: ${
            invitation.invitee_email
          }</h6>
          <p class="mb-1 small text-muted">
            <i class="fas fa-shield-alt mr-1"></i>
            Role: <span class="text-info">${invitation.role}</span>
          </p>
          <p class="mb-1 small text-muted">
            <i class="fas fa-clock mr-1"></i>
            Sent: ${new Date(invitation.created_at).toLocaleDateString()}
          </p>
          <p class="mb-2 small text-muted">
            <i class="fas fa-hourglass-end mr-1"></i>
            Expires: ${new Date(invitation.expires_at).toLocaleDateString()}
          </p>
        </div>
        <div>
          <button class="btn btn-outline-danger btn-sm cancel-invitation" 
                  data-invitation-id="${invitation.id}">
            <i class="fas fa-times mr-1"></i>Cancel
          </button>
        </div>
      </div>
    </div>
  `
    )
    .join("");

  // Attach event listeners

  pendingDropdown.querySelectorAll(".cancel-invitation").forEach((btn) => {
    btn.addEventListener("click", handleCancelInvitation);
  });
}

// Thêm event handlers
async function handleAcceptInvitation(event) {
  const token = event.currentTarget.getAttribute("data-token");

  try {
    const result = await acceptInvitation(token);
    notyf.success("Invitation accepted! You are now a member of the project.");

    // Reload pending invitations
    await loadPendingInvitations();

    // Dispatch event để dashboard refresh
    window.dispatchEvent(new CustomEvent("project:invitation-accepted"));

    // Optional: Redirect to the accepted project
    if (result.projectId) {
      setTimeout(() => {
        notyf.success(
          `Redirecting to ${result.projectName || "the project"}...`
        );
        // Có thể redirect hoặc mở tab mới
        window.open(
          `project.html?projectId=${
            result.projectId
          }&projectName=${encodeURIComponent(result.projectName || "Project")}`,
          "_blank"
        );
      }, 1500);
    }
  } catch (err) {
    console.error("Failed to accept invitation:", err);
    notyf.error(err.message || "Failed to accept invitation");
  }
}

async function handleDeclineInvitation(event) {
  const token = event.currentTarget.getAttribute("data-token");

  if (!confirm("Are you sure you want to decline this invitation?")) {
    return;
  }

  try {
    await declineInvitation(token);
    notyf.success("Invitation declined.");

    // Reload pending invitations
    await loadPendingInvitations();
  } catch (err) {
    console.error("Failed to decline invitation:", err);
    notyf.error(err.message || "Failed to decline invitation");
  }
}

async function handleCancelInvitation(event) {
  const invitationId = event.currentTarget.getAttribute("data-invitation-id");

  if (!confirm("Are you sure you want to cancel this invitation?")) {
    return;
  }

  try {
    await cancelInvitation(projectId, invitationId);
    notyf.success("Invitation cancelled successfully");

    // Reload pending invitations
    await loadPendingInvitations();
  } catch (err) {
    console.error("Failed to cancel invitation:", err);
    notyf.error(err.message || "Failed to cancel invitation");
  }
}
/**
 * Handle role change for project members
 */
async function handleRoleChange(event) {
  const select = event.target;
  const userId = select.getAttribute("data-user-id");
  const newRole = select.value;

  //Display loading state
  const originalValue = select.value;
  select.disabled = true;

  try {
    // Call API update role
    await updateMemberRole(projectId, userId, newRole);

    notyf.success(`Member role updated to ${newRole}`);

    // Update local state
    const member = projectMembers.find(
      (m) => String(m.user_id) === String(userId)
    );
    if (member) {
      member.role = newRole;
    }
  } catch (err) {
    console.error("Failed to update role:", err);

    // Revert UI on error
    select.value = originalValue;
    notyf.error(err.message || "Failed to update role");
  } finally {
    // Re-enable select
    select.disabled = false;
  }
}
