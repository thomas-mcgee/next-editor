import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { ok: false, error: "No image file was provided." },
      { status: 400 },
    );
  }

  return NextResponse.json(
    {
      ok: false,
      error:
        "Image uploads are unavailable until Backblaze B2 is configured for this project.",
    },
    { status: 501 },
  );
}
