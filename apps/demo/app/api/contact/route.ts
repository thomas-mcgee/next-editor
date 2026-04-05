import { NextRequest, NextResponse } from "next/server";
import { createIncomingCollectionEntry } from "@makeablebrand/next-editor/server";
import { nextEditorConfig } from "@/lib/editor-config";

export async function POST(req: NextRequest) {
  const body = await req.json();

  await createIncomingCollectionEntry(nextEditorConfig, {
    collectionId: "contact-submissions",
    values: {
      name: body.name ?? "",
      email: body.email ?? "",
      phone: body.phone ?? "",
      topic: body.topic ?? "general",
      message: body.message ?? "",
    },
  });

  return NextResponse.json({ ok: true });
}
