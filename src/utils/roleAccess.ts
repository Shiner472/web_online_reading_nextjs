export const roleAccess: Record<string, string[]> = {
  "/editor": ["editor", "chief-editor", "admin"],
  "/chief-editor": ["chief-editor", "admin"],
  "/admin": ["admin"],
};