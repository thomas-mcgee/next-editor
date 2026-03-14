import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getEditorSession } from "@/lib/auth";
import { savePageDocument } from "@/lib/content-store";

const pathByPageId: Record<string, string> = {
  home: "/",
  about: "/about",
};

export async function POST(request: Request) {
  const session = await getEditorSession();
  if (!session.isEditor) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized." },
      { status: 401 },
    );
  }

  const body = (await request.json()) as {
    pageId?: string;
    values?: Record<string, unknown>;
  };

  if (!body.pageId || !body.values) {
    return NextResponse.json(
      { ok: false, error: "Missing page payload." },
      { status: 400 },
    );
  }

  await savePageDocument(body.pageId, body.values, session.role ?? "editor");
  revalidatePath(pathByPageId[body.pageId] ?? "/");

  return NextResponse.json({ ok: true });
}
