import Link from "next/link";
import { redirect } from "next/navigation";
import { loginAction } from "@/lib/auth-actions";
import { getEditorSession } from "@/lib/auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await getEditorSession();
  if (session.isEditor) {
    redirect("/");
  }

  const params = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16 font-sans">
      <div className="w-full max-w-md rounded-[32px] border border-zinc-200 bg-white p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">
          Demo Access
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-zinc-900">Editor login</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-600">
          Use the seeded editor or admin account to reveal the floating admin
          controls on the live site.
        </p>
        <form action={loginAction} className="mt-8 space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-zinc-800">Email</span>
            <input
              name="email"
              type="email"
              defaultValue="admin@example.com"
              className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-900"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-zinc-800">Password</span>
            <input
              name="password"
              type="password"
              defaultValue="demo-password"
              className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-900"
            />
          </label>
          {params.error === "invalid" ? (
            <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
              Invalid credentials. Use the seeded demo account.
            </p>
          ) : null}
          <button
            type="submit"
            className="w-full rounded-full bg-zinc-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-700"
          >
            Sign in
          </button>
        </form>
        <p className="mt-6 text-sm text-zinc-500">
          Demo credentials:
          <span className="ml-2 font-medium text-zinc-900">admin@example.com</span>
          <span className="mx-2 text-zinc-400">or</span>
          <span className="font-medium text-zinc-900">editor@example.com</span>
          <span className="ml-2">with password</span>
          <span className="ml-2 font-medium text-zinc-900">demo-password</span>
        </p>
        <Link href="/" className="mt-6 inline-flex text-sm font-medium text-zinc-900">
          Back to site
        </Link>
      </div>
    </main>
  );
}
