"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { SESSION_COOKIE, USER_COOKIE, getEditorSession } from "@/lib/auth";
import { getUserByEmail, updateUser } from "@/lib/user-store";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "").trim();
  const user = await getUserByEmail(email);

  if (!user || user.password !== password) {
    redirect("/login?error=invalid");
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, user.role, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
  });
  cookieStore.set(USER_COOKIE, user.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
  });

  redirect("/");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  cookieStore.delete(USER_COOKIE);
  redirect("/login");
}

export async function updateAccountAction(formData: FormData) {
  const session = await getEditorSession();

  if (!session.userId) {
    redirect("/login");
  }

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();

  if (!name || !email) {
    redirect("/admin/account?status=invalid");
  }

  await updateUser(session.userId, {
    name,
    email,
    title,
  });

  revalidatePath("/admin/account");
  revalidatePath("/admin");
  redirect("/admin/account?status=saved");
}
