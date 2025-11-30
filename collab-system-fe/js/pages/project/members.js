// frontend/js/pages/project/document/members.js
import {
  getProjectMembers,
  removeProjectMember,
  updateMemberRole,
} from "../../../api/project.js";

import { notyf } from "../../../vendor/utils/notify.js";
import { projectId } from "./projectWorkspace.js";
export let projectMembers = [];

export async function loadMembers() {
    const data = await getProjectMembers(projectId);
    projectMembers = data.members || [];
    updateMemberCount();
}

export function setupMemberListeners() {
    const btn = document.getElementById("viewMembersBtn");
    if (!btn) return;

    btn.addEventListener("click", openMemberModal);
}

function updateMemberCount() {
    const countSpan = document.getElementById("memberCountBadge");
    if (countSpan) {
        countSpan.textContent = `${projectMembers.length} Member${projectMembers.length !== 1 ? 's' : ''}`;
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
}

async function handleRoleChange(e) {
    const userId = e.target.dataset.id;
    const role = e.target.value;
    await updateMemberRole(projectId, userId, role);
    notyf.success("Role updated.");
}
