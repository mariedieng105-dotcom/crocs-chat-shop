const KEY = "diaby-editor-pass";

export function getEditorPassword(): string {
  if (typeof window === "undefined") return "";
  try {
    return window.sessionStorage.getItem(KEY) ?? "";
  } catch {
    return "";
  }
}

export function setEditorPassword(password: string) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(KEY, password);
  } catch {
    /* ignore */
  }
}

export function clearEditorPassword() {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
