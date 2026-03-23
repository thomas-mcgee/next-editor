"use server";

import { headers } from "next/headers";
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
  updateUserPassword,
  updateUser,
} from "./user-store";
import {
  createPasswordResetTokenValue,
  deletePasswordResetTokensForUser,
  getPasswordResetToken,
  isPasswordResetTokenActive,
  markPasswordResetTokenUsed,
  savePasswordResetToken,
} from "./password-reset-store";
import { sendBrevoEmail } from "./brevo";
import { verifyTurnstileToken } from "./turnstile";

async function requireEditor() {
  const session = await auth();
  const role = session?.user?.role;
  if (role !== "editor" && role !== "admin") redirect("/admin/login");
  return { session, userId: session!.user.id, isAdmin: role === "admin" };
}

export async function neLoginAction(formData: FormData) {
  const requestHeaders = await headers();
  const turnstileToken = String(formData.get("cf-turnstile-response") ?? "");
  const ipHeader = requestHeaders.get("x-forwarded-for");
  const remoteIp = ipHeader ? ipHeader.split(",")[0]?.trim() : null;
  const isTurnstileValid = await verifyTurnstileToken({
    token: turnstileToken,
    remoteIp,
  });

  if (!isTurnstileValid) {
    redirect("/admin/login?error=challenge");
  }

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

export async function neRequestPasswordResetAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();

  if (!email) redirect("/admin/login/forgot?status=invalid");

  const user = await getUserByEmail(email);
  if (!user) {
    redirect("/admin/login/forgot?status=sent");
  }

  const token = createPasswordResetTokenValue();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60);

  try {
    await deletePasswordResetTokensForUser(user.id);
    await savePasswordResetToken({
      userId: user.id,
      token,
      expiresAt,
    });

    const origin = await getRequestOrigin();
    const resetUrl = `${origin}/admin/login/reset?token=${encodeURIComponent(token)}`;
    await sendBrevoEmail({
      toEmail: user.email,
      toName: user.name,
      subject: "Reset your password",
      htmlContent: buildPasswordResetEmailHtml({
        resetUrl,
        recipientName: user.name,
        expiresAt,
      }),
      textContent: buildPasswordResetEmailText({ resetUrl, expiresAt }),
    });
  } catch (error) {
    console.error("[next-editor] Password reset request failed:", error);
    redirect("/admin/login/forgot?status=unavailable");
  }

  redirect("/admin/login/forgot?status=sent");
}

export async function neResetPasswordAction(formData: FormData) {
  const token = String(formData.get("token") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!token || !password || !confirmPassword) {
    redirect(`/admin/login/reset?token=${encodeURIComponent(token)}&status=invalid`);
  }

  if (password !== confirmPassword) {
    redirect(`/admin/login/reset?token=${encodeURIComponent(token)}&status=mismatch`);
  }

  if (password.length < 8) {
    redirect(`/admin/login/reset?token=${encodeURIComponent(token)}&status=weak`);
  }

  const resetToken = await getPasswordResetToken(token);
  if (!isPasswordResetTokenActive(resetToken)) {
    redirect("/admin/login/reset?status=expired");
  }
  if (!resetToken) {
    redirect("/admin/login/reset?status=expired");
  }

  const password_hash = await bcrypt.hash(password, 12);
  await updateUserPassword(resetToken.userId, password_hash);
  await markPasswordResetTokenUsed(token);
  await deletePasswordResetTokensForUser(resetToken.userId);

  redirect("/admin/login?status=reset");
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

async function getRequestOrigin() {
  const requestHeaders = await headers();
  const forwardedHost = requestHeaders.get("x-forwarded-host");
  const host = forwardedHost || requestHeaders.get("host");
  const forwardedProto = requestHeaders.get("x-forwarded-proto");
  const protocol = forwardedProto || (host?.includes("localhost") ? "http" : "https");

  if (!host) {
    const fallback =
      process.env.NEXT_EDITOR_APP_URL ||
      process.env.NEXTAUTH_URL ||
      process.env.AUTH_URL ||
      process.env.VERCEL_URL;

    if (!fallback) {
      throw new Error("[next-editor] Could not determine request origin for password reset URLs.");
    }

    return fallback.startsWith("http") ? fallback : `https://${fallback}`;
  }

  return `${protocol}://${host}`;
}

function buildPasswordResetEmailHtml(input: {
  resetUrl: string;
  recipientName: string;
  expiresAt: Date;
}) {
  return `
    <p>Hello ${escapeHtml(input.recipientName)},</p>
    <p>We received a request to reset your password.</p>
    <p><a href="${input.resetUrl}">Reset your password</a></p>
    <p>This link expires at ${input.expiresAt.toUTCString()}.</p>
    <p>If you did not request this, you can ignore this email.</p>
  `;
}

function buildPasswordResetEmailText(input: { resetUrl: string; expiresAt: Date }) {
  return [
    "We received a request to reset your password.",
    `Reset your password: ${input.resetUrl}`,
    `This link expires at ${input.expiresAt.toUTCString()}.`,
    "If you did not request this, you can ignore this email.",
  ].join("\n\n");
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
