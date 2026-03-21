import { auth } from "../auth/config";
import { getPageContent, setPageContent } from "../content/store";
import { hasB2Config, uploadImageToB2 } from "../b2";
import { revalidatePath } from "next/cache";

type RouteContext = { params: Promise<{ path: string[] }> };

function unauthorized() {
  return Response.json({ ok: false, error: "Unauthorized." }, { status: 401 });
}

async function requireEditor() {
  const session = await auth();
  const role = session?.user?.role;
  if (role !== "editor" && role !== "admin") return null;
  return session;
}

export async function GET(request: Request, context: RouteContext) {
  const { path } = await context.params;
  const route = path.join("/");

  if (route === "content") {
    const session = await requireEditor();
    if (!session) return unauthorized();

    const pageId = new URL(request.url).searchParams.get("pageId");
    if (!pageId) return Response.json({ ok: false }, { status: 400 });

    const values = await getPageContent(pageId);
    return Response.json({ ok: true, values });
  }

  return new Response("Not found.", { status: 404 });
}

export async function POST(request: Request, context: RouteContext) {
  const { path } = await context.params;
  const route = path.join("/");

  if (route === "content") {
    const session = await requireEditor();
    if (!session) return unauthorized();

    const body = await request.json() as { pageId?: string; values?: Record<string, unknown> };
    const { pageId, values } = body;
    if (!pageId || !values) return Response.json({ ok: false }, { status: 400 });

    await setPageContent(pageId, values);
    revalidatePath("/");
    return Response.json({ ok: true });
  }

  if (route === "upload") {
    const session = await requireEditor();
    if (!session) return unauthorized();

    if (!hasB2Config()) {
      return Response.json(
        { ok: false, error: "Image uploads are not configured. Set B2 environment variables." },
        { status: 503 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) return Response.json({ ok: false, error: "No file provided." }, { status: 400 });

    const result = await uploadImageToB2(file);
    return Response.json({ ok: true, url: result.url });
  }

  return new Response("Not found.", { status: 404 });
}
