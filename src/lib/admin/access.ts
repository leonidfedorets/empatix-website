export function isAdministrator(roles: string[]) {
  return roles.some((role) => role === "admin" || role === "super_admin");
}

export function canEditInsights(roles: string[]) {
  return isAdministrator(roles) || roles.includes("editor");
}

export function editorPathAllowed(path: string) {
  return path === "/admin" || path === "/admin/" || path.startsWith("/admin/insights") || path === "/admin/account";
}