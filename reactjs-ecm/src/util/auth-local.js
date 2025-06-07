const AUTH_KEY = "token";

const USER_ID_KEY = "userId";

const ROLE_KEY = "role";

export const authLocal = {
  setToken: (token) => {
    localStorage.setItem(AUTH_KEY, token);
  },
  getToken: () => {
    return localStorage.getItem(AUTH_KEY);
  },
  removeToken: () => {
    localStorage.removeItem(AUTH_KEY);
  },
};

export const userIdLocal = {
  setUserId: (userId) => {
    localStorage.setItem(USER_ID_KEY, userId);
  },
  getUserId: () => {
    return localStorage.getItem(USER_ID_KEY);
  },
  removeUserId: () => {
    localStorage.removeItem(USER_ID_KEY);
  },
};

export const roleLocal = {
  setRole: (role) => {
    localStorage.setItem(ROLE_KEY, role);
  },
  getRole: () => {
    return localStorage.getItem(ROLE_KEY);
  },
  removeRole: () => {
    localStorage.removeItem(ROLE_KEY);
  },
};

export const getToken = () => {
  let token = authLocal.getToken();
  return token ? token.replace(/"/g, "") : null;
};
export const getUserId = () => {
  let userId = userIdLocal.getUserId();
  return userId ? userId.replace(/"/g, "") : null;
};
export const getRole = () => {
  let role = roleLocal.getRole();
  return role ? role.replace(/"/g, "") : null;
};
