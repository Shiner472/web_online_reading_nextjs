export const roleAccess: Record<string, string[]> = {
  "/editor": ["editor", "chief_editor", "admin"],
  "/chief-editor": ["chief_editor", "admin"],
  "/admin": ["admin"],
};