export const ROLES = {
  ADMIN: 'ADMIN',
  MANDOR: 'MANDOR',
  BURUH: 'BURUH',
  SUPIR: 'SUPIR',
};

export const ALL_ROLES = Object.values(ROLES);

export const ROLE_HOME = {
  [ROLES.ADMIN]: '/dashboard',
  [ROLES.MANDOR]: '/mandor/bawahan',
  [ROLES.BURUH]: '/panen',
  [ROLES.SUPIR]: '/pengiriman',
};

export const canAccess = (userRole, allowedRoles = ALL_ROLES) =>
  Boolean(userRole) && allowedRoles.includes(userRole);

export const getDefaultPathForRole = (role) => ROLE_HOME[role] || '/dashboard';
