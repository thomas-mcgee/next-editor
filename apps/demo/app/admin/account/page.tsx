import { updateAccountAction } from "@/lib/auth-actions";
import { getEditorSession } from "@/lib/auth";

export default async function AdminAccountPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await getEditorSession();
  const params = await searchParams;

  if (!session.user) {
    return null;
  }

  return (
    <section className="font-sans">
      <h2
        className="text-3xl font-semibold"
        style={{ color: "var(--foreground)" }}
      >
        Account Details
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-6" style={{ color: "var(--muted)" }}>
        Update the signed-in user details for this demo account.
      </p>

      <form action={updateAccountAction} className="mt-8 max-w-2xl space-y-5">
        <label className="block">
          <span
            className="mb-2 block text-sm font-medium"
            style={{ color: "var(--foreground)" }}
          >
            Name
          </span>
          <input
            name="name"
            defaultValue={session.user.name}
            className="w-full rounded-xl px-4 py-3 text-sm outline-none"
            style={{
              border: "1px solid var(--border-strong)",
              background: "var(--surface-muted)",
              color: "var(--foreground)",
            }}
          />
        </label>

        <label className="block">
          <span
            className="mb-2 block text-sm font-medium"
            style={{ color: "var(--foreground)" }}
          >
            Email
          </span>
          <input
            name="email"
            type="email"
            defaultValue={session.user.email}
            className="w-full rounded-xl px-4 py-3 text-sm outline-none"
            style={{
              border: "1px solid var(--border-strong)",
              background: "var(--surface-muted)",
              color: "var(--foreground)",
            }}
          />
        </label>

        <label className="block">
          <span
            className="mb-2 block text-sm font-medium"
            style={{ color: "var(--foreground)" }}
          >
            Title
          </span>
          <input
            name="title"
            defaultValue={session.user.title ?? ""}
            className="w-full rounded-xl px-4 py-3 text-sm outline-none"
            style={{
              border: "1px solid var(--border-strong)",
              background: "var(--surface-muted)",
              color: "var(--foreground)",
            }}
          />
        </label>

        {params.status === "saved" ? (
          <p
            className="rounded-xl px-4 py-3 text-sm"
            style={{
              background: "var(--surface-muted)",
              color: "var(--foreground)",
              border: "1px solid var(--border-strong)",
            }}
          >
            Account details saved.
          </p>
        ) : null}

        {params.status === "invalid" ? (
          <p
            className="rounded-xl px-4 py-3 text-sm"
            style={{
              background: "var(--surface-muted)",
              color: "var(--foreground)",
              border: "1px solid var(--border-strong)",
            }}
          >
            Name and email are required.
          </p>
        ) : null}

        <button
          type="submit"
          className="rounded-xl px-5 py-3 text-sm font-semibold"
          style={{
            border: 0,
            background: "var(--foreground)",
            color: "var(--background)",
          }}
        >
          Save Account
        </button>
      </form>
    </section>
  );
}
