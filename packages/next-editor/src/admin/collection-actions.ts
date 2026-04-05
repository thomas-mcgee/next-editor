"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "../auth/config";
import { deleteCollectionEntry, saveCollectionEntry } from "../content/collection-store";
import type { CollectionStatus } from "../types";

async function requireEditor() {
  const session = await auth();
  const role = session?.user?.role;
  if (role !== "editor" && role !== "admin") redirect("/admin/login");
  return { session, userId: session!.user.id, isAdmin: role === "admin" };
}

export async function neSaveCollectionEntryAction(formData: FormData) {
  const { userId } = await requireEditor();

  const collectionId = String(formData.get("collectionId") ?? "").trim();
  const collectionMode = String(formData.get("collectionMode") ?? "").trim();
  const entryId = String(formData.get("entryId") ?? "").trim() || randomUUID();
  const slug = String(formData.get("slug") ?? "").trim() || null;
  const status = String(formData.get("status") ?? "draft") as CollectionStatus;
  const publishedAtRaw = String(formData.get("publishedAt") ?? "").trim();
  const valuesRaw = String(formData.get("values") ?? "{}");
  const allowedStatusesRaw = String(formData.get("allowedStatuses") ?? "[]");

  if (!collectionId) redirect("/admin");

  let allowedStatuses: string[] = [];
  try {
    const parsed = JSON.parse(allowedStatusesRaw) as unknown;
    if (Array.isArray(parsed)) {
      allowedStatuses = parsed.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
    }
  } catch {
    allowedStatuses = [];
  }

  const statusOptions =
    allowedStatuses.length > 0
      ? allowedStatuses
      : collectionMode === "incoming"
        ? ["new", "resolved"]
        : ["draft", "published", "scheduled"];

  if (!statusOptions.includes(status)) {
    redirect(`/admin/collections/${collectionId}?status=invalid`);
  }

  let values: Record<string, unknown>;
  try {
    values = JSON.parse(valuesRaw) as Record<string, unknown>;
  } catch {
    redirect(`/admin/collections/${collectionId}?status=invalid`);
  }

  await saveCollectionEntry({
    collectionId,
    entryId,
    slug: collectionMode === "incoming" ? null : slug,
    status,
    publishedAt: collectionMode === "incoming" ? null : publishedAtRaw || null,
    values,
    updatedBy: userId,
  });

  revalidatePath(`/admin/collections/${collectionId}`);
  redirect(`/admin/collections/${collectionId}?status=saved`);
}

export async function neDeleteCollectionEntryAction(formData: FormData) {
  const { isAdmin } = await requireEditor();
  if (!isAdmin) redirect("/admin");

  const collectionId = String(formData.get("collectionId") ?? "").trim();
  const entryId = String(formData.get("entryId") ?? "").trim();

  if (!collectionId || !entryId) redirect("/admin");

  await deleteCollectionEntry(collectionId, entryId);
  revalidatePath(`/admin/collections/${collectionId}`);
  redirect(`/admin/collections/${collectionId}?status=deleted`);
}
