"use server";

import SwitchAdminMode from "./switch-admin-mode";

export async function switchAdminAction(formData: FormData) {
  const mode = formData.get("mode") as "admin" | "user";
  await SwitchAdminMode(mode);
}