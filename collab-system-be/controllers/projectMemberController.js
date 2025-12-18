import {
  getProjectMembers,
  removeProjectMember,
  isProjectOwner,
  getUserProjectRole,
} from "../models/projectMemberModel.js";

export async function listProjectMembers(req, res) {
  try {
    const projectId = Number(req.params.projectId);

    const userRole = await getUserProjectRole(projectId, req.user.id);
    if (!userRole) {
      return res.status(403).json({ message: "Access denied to project" });
    }

    const members = await getProjectMembers(projectId);
    res.json({ members });
  } catch (err) {
    console.error("listProjectMembers error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

export async function removeMember(req, res) {
  try {
    const projectId = Number(req.params.projectId);
    const memberId = Number(req.params.userId);

    const isOwner = await isProjectOwner(projectId, req.user.id);
    if (!isOwner) {
      return res
        .status(403)
        .json({ message: "Only project owners can remove members" });
    }

    if (memberId === req.user.id) {
      return res
        .status(400)
        .json({ message: "Cannot remove yourself as owner" });
    }

    const success = await removeProjectMember(projectId, memberId);
    if (!success) {
      return res.status(404).json({ message: "Member not found" });
    }

    res.json({ message: "Member removed" });
  } catch (err) {
    console.error("removeMember error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

export async function leaveProject(req, res) {
  try {
    const projectId = Number(req.params.projectId);

    const isOwner = await isProjectOwner(projectId, req.user.id);
    if (isOwner) {
      return res.status(400).json({
        message:
          "Project owner cannot leave project. Transfer ownership or delete project instead.",
      });
    }

    const success = await removeProjectMember(projectId, req.user.id);
    if (!success) {
      return res
        .status(404)
        .json({ message: "You are not a member of this project" });
    }

    res.json({ message: "Left project successfully" });
  } catch (err) {
    console.error("leaveProject error:", err);
    res.status(500).json({ message: "Server error" });
  }
}
