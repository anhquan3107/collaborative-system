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
      detail: (id) => `/projects/${id}`,
      members: (id) => `/projects/${id}/members`,

      chat: (id) => `/projects/${id}/messages`,
    },
    documents: {
      list: (projectId) => `/projects/${projectId}/documents`,
      detail: (projectId, docId) => `/projects/${projectId}/documents/${docId}`,
    },
    invitations: {
      project: (projectId) => `/invitations/project/${projectId}`,
  
  // Result: /api/invitations/project/123/456
      projectDetail: (projectId, invitationId) => `/invitations/project/${projectId}/${invitationId}`,
  
      pending: `/invitations/pending`,
      accept: (token) => `/invitations/${token}/accept`,
      decline: (token) => `/invitations/${token}/decline`
    }
};