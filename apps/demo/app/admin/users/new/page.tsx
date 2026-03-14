export default function NewUserPage() {
  return (
    <section className="font-sans">
      <h2
        className="text-3xl font-semibold"
        style={{ color: "var(--foreground)" }}
      >
        Add User
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-6" style={{ color: "var(--muted)" }}>
        Starter user creation screen. This gives the admin UI a destination for
        adding users before the full save flow is defined.
      </p>

      <form className="mt-8 max-w-3xl space-y-5">
        {[
          ["Name", "text"],
          ["Email", "email"],
          ["Title", "text"],
          ["Role", "text"],
        ].map(([label, type]) => (
          <label key={label} className="block">
            <span
              className="mb-2 block text-sm font-medium"
              style={{ color: "var(--foreground)" }}
            >
              {label}
            </span>
            <input
              type={type}
              className="w-full rounded-xl px-4 py-3 text-sm outline-none"
              style={{
                border: "1px solid var(--border-strong)",
                background: "var(--surface)",
                color: "var(--foreground)",
              }}
            />
          </label>
        ))}

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="rounded-xl px-5 py-3 text-sm font-semibold"
            style={{
              border: 0,
              background: "var(--foreground)",
              color: "var(--background)",
            }}
          >
            Add User
          </button>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            UI scaffold only for now.
          </p>
        </div>
      </form>
    </section>
  );
}
