// frontend/js/pages/project/document/invitations.js
import {
  getProjectInvitations,
  cancelInvitation,
  inviteToProject
} from "../../../api/invitation.js";
import { notyf } from "../../../vendor/utils/notify.js";
import { projectId } from "./projectWorkspace.js";
import { loadMembers } from "./members.js";

let pending = [];

export async function loadPendingInvitations() {
    try {
        const data = await getProjectInvitations(projectId);
        pending = data.invitations || [];
        renderPending();
    } catch (err) {
        console.error("❌ Failed to load pending invitations:", err);
    }
}

export function setupInvitationListeners() {
    document.getElementById("inviteBtn")?.addEventListener("click", () => {
        $("#inviteModal").modal("show");
    });

    document.getElementById("inviteSubmit")?.addEventListener("click", async () => {
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

    // Auto-refresh pending invitations every 30 seconds
    setInterval(loadPendingInvitations, 30000);
}

function renderPending() {
    const dropdown = document.getElementById("pendingInvitationsDropdown");
    if (!dropdown) return;

    if (pending.length === 0) {
        dropdown.innerHTML = `
            <div class="p-2 text-center text-muted">
                <small>No pending invitations</small>
            </div>
        `;
        return;
    }

    dropdown.innerHTML = pending
        .map(inv => `
            <div class="pending-invitation-item p-2 border-bottom">
                <div class="d-flex justify-content-between align-items-start">
                    <div class="flex-grow-1">
                        <h6 class="mb-1 text-primary">${inv.invitee_email}</h6>
                        <p class="mb-1 small text-muted">
                            Role: <span class="text-info">${inv.role}</span>
                        </p>
                        <p class="mb-2 small text-muted">
                            Expires: ${new Date(inv.expires_at).toLocaleDateString()}
                        </p>
                    </div>
                    <div>
                        <button class="btn btn-outline-danger btn-sm cancel-invitation" 
                                data-invitation-id="${inv.id}">
                            Cancel
                        </button>
                    </div>
                </div>
            </div>`
        )
        .join("");

    dropdown.querySelectorAll(".cancel-invitation").forEach(btn =>
        btn.addEventListener("click", handleCancel)
    );
}

async function handleCancel(e) {
    const id = e.target.dataset.id;
    if (!confirm("Are you sure you want to cancel this invitation?")) return;
    
    try {
        await cancelInvitation(projectId, id);
        notyf.success("Invitation canceled");
        await loadPendingInvitations();
    } catch (err) {
        console.error("Failed to cancel invitation:", err);
        notyf.error(err.message || "Failed to cancel invitation");
    }
}