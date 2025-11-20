import { createProjectInvitation, getProjectInvitations, cancelInvitation as deleteInvitation, getPendingInvitationsByEmail, updateInvitationStatus, getInvitationByToken } from "../models/projectInvitationModel.js";
import { addProjectMember, isProjectOwner } from "../models/projectMemberModel.js";

export async function inviteToProject(req, res) {
  try {
    const projectId = Number(req.params.projectId);
    const { email, role } = req.body;
    
    const isOwner = await isProjectOwner(projectId, req.user.id);
    if (!isOwner) {
      return res.status(403).json({ message: "Only project owners can invite members" });
    }

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    if (email === req.user.email) {
      return res.status(400).json({ message: "Cannot invite yourself" });
    }

    const invitation = await createProjectInvitation({
      projectId,
      inviterId: req.user.id,
      inviteeEmail: email,
      role: role || 'editor'
    });

    res.status(201).json({ 
      message: "Invitation sent",
      invitation: {
        id: invitation.id,
        token: invitation.token,
        expiresAt: invitation.expiresAt
      }
    });
  } catch (err) {
    console.error("inviteToProject error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

export async function getInvitations(req, res) {
  try {
    const projectId = Number(req.params.projectId);
    
    const isOwner = await isProjectOwner(projectId, req.user.id);
    if (!isOwner) {
      return res.status(403).json({ message: "Access denied" });
    }

    const invitations = await getProjectInvitations(projectId);
    res.json({ invitations });
  } catch (err) {
    console.error("getInvitations error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

export async function cancelInvitation(req, res) {
  try {
    const { invitationId } = req.params;
    
    const success = await deleteInvitation(Number(invitationId), req.user.id);
    if (!success) {
      return res.status(404).json({ message: "Invitation not found" });
    }

    res.json({ message: "Invitation cancelled" });
  } catch (err) {
    console.error("cancelInvitation error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

export async function getMyPendingInvitations(req, res) {
  try {
    const invitations = await getPendingInvitationsByEmail(req.user.email);
    res.json({ invitations });
  } catch (err) {
    console.error("getMyPendingInvitations error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

export async function acceptInvitation(req, res) {
  try {
    const { token } = req.params;
    
    const invitation = await getInvitationByToken(token);
    if (!invitation) {
      return res.status(404).json({ message: "Invitation not found or expired" });
    }

    if (invitation.invitee_email !== req.user.email) {
      return res.status(403).json({ message: "This invitation is not for you" });
    }

    await addProjectMember(invitation.project_id, req.user.id, invitation.role);
    await updateInvitationStatus(token, 'accepted');

    res.json({ 
      message: "Invitation accepted",
      projectId: invitation.project_id,
      projectName: invitation.project_name
    });
  } catch (err) {
    console.error("acceptInvitation error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

export async function declineInvitation(req, res) {
  try {
    const { token } = req.params;
    
    const invitation = await getInvitationByToken(token);
    if (!invitation) {
      return res.status(404).json({ message: "Invitation not found or expired" });
    }

    if (invitation.invitee_email !== req.user.email) {
      return res.status(403).json({ message: "This invitation is not for you" });
    }

    await updateInvitationStatus(token, 'declined');
    res.json({ message: "Invitation declined" });
  } catch (err) {
    console.error("declineInvitation error:", err);
    res.status(500).json({ message: "Server error" });
  }
}