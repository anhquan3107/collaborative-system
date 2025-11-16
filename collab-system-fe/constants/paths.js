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
    },
    documents: {
      list: (projectId) => `/projects/${projectId}/documents`,
      detail: (projectId, docId) => `/projects/${projectId}/documents/${docId}`,
    },
};