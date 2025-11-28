// Centralized API path definitions
export const paths = {
  auth: {
    register: "/auth/register",
    login: "/auth/login",
  },
  user: {
    me: "/user/me",
  },
  projects: {
    list: "/projects",
    create: "/projects",
    count: "/projects/count",
    detail: (id) => `/projects/${id}`,
    members: (id) => `/projects/${id}/members`,
    memberDetail: (projectId, userId) =>
      `/projects/${projectId}/members/${userId}`,
    memberRole: (projectId, userId) =>
      `/projects/${projectId}/members/${userId}/role`,
    chat: (id) => `/projects/${id}/messages`,
  },
  documents: {
    list: (projectId) => `/projects/${projectId}/documents`,
    detail: (projectId, docId) => `/projects/${projectId}/documents/${docId}`,
  },
  invitations: {
    //for inviting users to project (for inviters)
    project: (projectId) => `/invitations/project/${projectId}`,

    // Result: /api/invitations/project/123/456
    projectDetail: (projectId, invitationId) =>
      `/invitations/project/${projectId}/${invitationId}`,

    //for invitees
    pending: `/invitations/pending`,
    accept: (token) => `/invitations/${token}/accept`,
    decline: (token) => `/invitations/${token}/decline`,
  },
};
