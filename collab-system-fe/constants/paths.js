// Centralized API path definitions
export const paths = {
  api: {
    base: "/api",  // base API prefix
    auth: {
      base: "/auth",
      register: "/auth/register",
      login: "/auth/login",
    },
    user: {
      me: "/me",  // /api/me
    },
    projects: {
      base: "/projects",
      list: "/projects",       // GET
      create: "/projects",     // POST
      detail: (id) => `/projects/${id}`,  // dynamic route example
    },
  },
};
