"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";
import { auth, signIn, signOut } from "./config";
import {
  countUsers,
  createUser,
  deleteUser,
  getUserByEmail,
  updateUser,
} from "./user-store";

async function requireEditor() {
  const session = await auth();
  const role = session?.user?.role;
  if (role !== "editor" && role !== "admin") redirect("/admin/login");
  return { session, userId: session!.user.id, isAdmin: role === "admin" };
}

export async function neLoginAction(formData: FormData) {
  try {
    await signIn("credentials", {
      email: String(formData.get("email") ?? "").trim(),
      password: String(formData.get("password") ?? ""),
      redirectTo: "/admin",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect("/admin/login?error=invalid");
    }
    throw error;
  }
}

export async function neLogoutAction() {
  await signOut({ redirectTo: "/admin/login" });
}

export async function neSetupAction(formData: FormData) {
  // Guard: only allowed when no users exist
  const userCount = await countUsers();
  if (userCount > 0) redirect("/admin/login");

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!name || !email || !password) redirect("/admin/setup?status=invalid");
  if (password !== confirmPassword) redirect("/admin/setup?status=mismatch");
  if (password.length < 8) redirect("/admin/setup?status=weak");

  const existing = await getUserByEmail(email);
  if (existing) redirect("/admin/setup?status=exists");

  const password_hash = await bcrypt.hash(password, 12);
  await createUser({ name, email, password_hash, role: "admin" });

  try {
    await signIn("credentials", { email, password, redirectTo: "/admin" });
  } catch (error) {
    throw error;
  }
}

export async function neUpdateAccountAction(formData: FormData) {
  const { userId } = await requireEditor();

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim() || null;

  if (!name || !email) redirect("/admin/account?status=invalid");

  await updateUser(userId, { name, email, title });
  revalidatePath("/admin/account");
  redirect("/admin/account?status=saved");
}

export async function neCreateUserAction(formData: FormData) {
  const { isAdmin } = await requireEditor();
  if (!isAdmin) redirect("/admin");

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const role = String(formData.get("role") ?? "editor");
  const title = String(formData.get("title") ?? "").trim() || null;

  if (!name || !email || !password) redirect("/admin/users/new?status=invalid");
  if (!["editor", "admin"].includes(role)) redirect("/admin/users/new?status=invalid");

  const existing = await getUserByEmail(email);
  if (existing) redirect("/admin/users/new?status=exists");

  const password_hash = await bcrypt.hash(password, 12);
  await createUser({ name, email, password_hash, role, title });
  revalidatePath("/admin/users");
  redirect("/admin/users?status=created");
}

export async function neDeleteUserAction(formData: FormData) {
  const { isAdmin, userId } = await requireEditor();
  if (!isAdmin) return;

  const targetId = String(formData.get("userId") ?? "");
  if (!targetId || targetId === userId) return;

  await deleteUser(targetId);
  revalidatePath("/admin/users");
}
