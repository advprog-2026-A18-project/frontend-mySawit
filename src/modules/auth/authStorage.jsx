const AUTH_USER_KEY = 'authUser';

export const persistAuthSession = (authData) => {
  if (!authData?.accessToken || !authData?.refreshToken) return;

  localStorage.setItem('accessToken', authData.accessToken);
  localStorage.setItem('refreshToken', authData.refreshToken);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(authData.user || null));
};

export const getAuthUser = () => {
  const rawUser = localStorage.getItem(AUTH_USER_KEY);
  if (!rawUser) return null;

  try {
    return JSON.parse(rawUser);
  } catch {
    localStorage.removeItem(AUTH_USER_KEY);
    return null;
  }
};

export const isAuthenticated = () => Boolean(localStorage.getItem('accessToken'));

export const clearAuthSession = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem(AUTH_USER_KEY);
};
