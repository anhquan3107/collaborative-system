// frontend/js/pages/project/document/members.js
import {
  getProjectMembers,
  removeProjectMember,
  updateMemberRole,
  leaveProject,
} from "../../../api/project.js";

import { notyf } from "../../../vendor/utils/notify.js";
import { projectId } from "./projectWorkspace.js";
export let projectMembers = [];

export async function loadMembers() {
    const data = await getProjectMembers(projectId);
    projectMembers = data.members || [];
    updateMemberCount();
    updateLeaveButton();
}

export function setupMemberListeners() {
    const btn = document.getElementById("viewMembersBtn");
    if (!btn) return;

    btn.addEventListener("click", openMemberModal);

    const leaveBtn = document.getElementById("leaveProjectBtn");
    if (leaveBtn) {
        leaveBtn.addEventListener("click", handleLeaveProject);
    }
}

function updateMemberCount() {
    const countSpan = document.getElementById("memberCountBadge");
    if (countSpan) {
        countSpan.textContent = `${projectMembers.length} Member${projectMembers.length !== 1 ? 's' : ''}`;
    }
}

//Show/hide leave button based on user role
function updateLeaveButton() {
    const leaveBtn = document.getElementById("leaveProjectBtn");
    if (!leaveBtn) return;
    
    // Get current user ID from localStorage
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const currentUserId = currentUser.id;
    
    // Find current user in members list
    const currentUserMember = projectMembers.find(m => m.user_id === currentUserId);
    
    // ALWAYS show the button
    leaveBtn.style.display = 'block';
    
    // Update button text and style based on role
    if (currentUserMember && currentUserMember.role === 'owner') {
        leaveBtn.innerHTML = '<i class="fas fa-crown mr-2"></i> You are the Owner';
        leaveBtn.classList.add('btn-warning');
        leaveBtn.classList.remove('btn-outline-danger');
        leaveBtn.disabled = true;
        leaveBtn.title = "Owners cannot leave projects. Transfer ownership or delete the project instead.";
    } else {
        leaveBtn.innerHTML = '<i class="fas fa-sign-out-alt mr-2"></i> Leave Project';
        leaveBtn.classList.add('btn-outline-danger');
        leaveBtn.classList.remove('btn-warning');
        leaveBtn.disabled = false;
        leaveBtn.title = "Leave this project";
    }
}

function openMemberModal() {
    const list = document.getElementById("projectMembersList");
    $("#projectMembersModal").modal("show");

    list.innerHTML = projectMembers
        .map(m => `
        <div class="list-group-item d-flex justify-content-between">
            <div>
                <strong>${m.username}</strong>
                <div class="small">${m.email}</div>
            </div>
            <div>
                ${
                  m.role === "owner"
                      ? `<span class="badge badge-primary">Owner</span>`
                      : `
                        <select class="role-select" data-id="${m.user_id}">
                            <option value="editor" ${m.role==="editor"?"selected":""}>Editor</option>
                            <option value="viewer" ${m.role==="viewer"?"selected":""}>Viewer</option>
                        </select>
                        <button class="btn btn-sm btn-danger remove-btn" data-id="${m.user_id}">
                            Remove
                        </button>
                      `
                }
            </div>
        </div>`
        )
        .join("");

    list.querySelectorAll(".remove-btn").forEach(btn =>
        btn.addEventListener("click", handleRemove)
    );
    list.querySelectorAll(".role-select").forEach(sel =>
        sel.addEventListener("change", handleRoleChange)
    );
}

async function handleRemove(e) {
    const userId = e.target.dataset.id;
    await removeProjectMember(projectId, userId);
    notyf.success("Member removed.");
    await loadMembers();
    openMemberModal();
}

async function handleRoleChange(e) {
    const userId = e.target.dataset.id;
    const role = e.target.value;
    try {
    await updateMemberRole(projectId, userId, role);
    notyf.success("Role updated.");
    //re-fetch new members from server and update UI
    //make the owner see the new role of the memmber after they change it
    await loadMembers();
     openMemberModal();
    }
catch (err) {
        console.error("Failed to update role:", err);
        notyf.error(err.message || "Failed to update role");
        // optionally reset select value to previous role
        await loadMembers();
        openMemberModal();
    }
}
async function handleLeaveProject() {
    // Get current user info to check role
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const currentUserId = currentUser.id;
    const currentUserMember = projectMembers.find(m => m.user_id === currentUserId);
    
    // If user is owner, show different message
    if (currentUserMember && currentUserMember.role === 'owner') {
        notyf.error("Project owners cannot leave. Transfer ownership or delete the project instead.");
        return;
    }
    
    // For regular members, proceed with leaving
    if (!confirm("Are you sure you want to leave this project? You will need to be invited again to rejoin.")) {
        return;
    }
    
    try {
        await leaveProject(projectId);
        notyf.success("You have left the project.");
        
        // Redirect to dashboard after leaving
        setTimeout(() => {
            window.location.href = '/index.html';
        }, 1500);
        
    } catch (error) {
        console.error("Failed to leave project:", error);
        notyf.error(error.message || "Failed to leave project");
    }
}
