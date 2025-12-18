// frontend/js/pages/invitation/invitationManager.js
import { getPendingInvitations, acceptInvitation, declineInvitation } from "../../../api/invitation.js";
import { notyf } from "../../../vendor/utils/notify.js";

let pendingInvitations = [];

export async function loadInvitations() {
    try {
        const response = await getPendingInvitations();
        pendingInvitations = response.invitations || [];
        updateInvitationUI();
    } catch (err) {
        console.error('Failed to load invitations:', err);
    }
}

function updateInvitationUI() {
    const invitationCount = document.getElementById('invitationCount');
    const invitationList = document.getElementById('invitationList');
    
    // Update counter
    invitationCount.textContent = pendingInvitations.length.toString();
    
    // Update invitation list
    if (pendingInvitations.length === 0) {
        invitationList.innerHTML = `
            <a class="dropdown-item d-flex align-items-center" href="#">
                <div class="mr-3">
                    <div class="icon-circle bg-secondary">
                        <i class="fas fa-bell-slash text-white"></i>
                    </div>
                </div>
                <div>
                    <span class="font-weight-bold">No pending invitations</span>
                </div>
            </a>
        `;
        return;
    }

    invitationList.innerHTML = pendingInvitations.map(invitation => `
        <a class="dropdown-item d-flex align-items-center invitation-item" data-token="${invitation.token}">
            <div class="mr-3">
                <div class="icon-circle bg-primary">
                    <i class="fas fa-envelope text-white"></i>
                </div>
            </div>
            <div>
                <div class="small text-gray-500">${new Date(invitation.created_at).toLocaleDateString()}</div>
                <span class="font-weight-bold">Invitation to: ${invitation.project_name}</span>
                <div class="small">From: ${invitation.inviter_name}</div>
                <div class="mt-1">
                    <button class="btn btn-sm btn-success accept-btn" data-token="${invitation.token}">Accept</button>
                    <button class="btn btn-sm btn-danger decline-btn" data-token="${invitation.token}">Decline</button>
                </div>
            </div>
        </a>
    `).join('');

    // Add event listeners to buttons
    document.querySelectorAll('.accept-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const token = btn.dataset.token;
            await handleAcceptInvitation(token);
        });
    });

    document.querySelectorAll('.decline-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const token = btn.dataset.token;
            await handleDeclineInvitation(token);
        });
    });
}

async function handleAcceptInvitation(token) {
    try {
        await acceptInvitation(token);
        pendingInvitations = pendingInvitations.filter(inv => inv.token !== token);
        updateInvitationUI();
        notyf.success('Invitation accepted!');
        window.dispatchEvent(new Event('project:joined'));
    } catch (err) {
        notyf.error('Failed to accept invitation: ' + err.message);
    }
}

async function handleDeclineInvitation(token) {
    try {
        await declineInvitation(token);
        pendingInvitations = pendingInvitations.filter(inv => inv.token !== token);
        updateInvitationUI();
        notyf.success('Invitation declined.');
    } catch (err) {
        notyf.error('Failed to decline invitation: ' + err.message);
    }
}
