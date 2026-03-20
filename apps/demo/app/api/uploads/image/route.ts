import { NextResponse } from "next/server";
import { hasB2Config, uploadImageToB2 } from "next-editor/b2";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { ok: false, error: "No image file was provided." },
      { status: 400 },
    );
  }

  if (!hasB2Config()) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Image uploads are not configured. Set the Backblaze B2 environment variables for this app first.",
      },
      { status: 503 },
    );
  }

  try {
    const result = await uploadImageToB2(file);

    return NextResponse.json({
      ok: true,
      key: result.key,
      url: result.url,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : "Image upload failed.",
      },
      { status: 500 },
    );
  }
}
