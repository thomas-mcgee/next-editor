import { ThemePicker } from "@/components/theme-picker";

export default function AdminSettingsPage() {
  return (
    <section className="font-sans">
      <h2
        className="text-3xl font-semibold"
        style={{ color: "var(--foreground)" }}
      >
        Interface Theme
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-6" style={{ color: "var(--muted)" }}>
        Choose whether the admin interface follows the system appearance or stays
        in a fixed light or dark theme.
      </p>
      <div className="mt-8">
        <ThemePicker />
      </div>
    </section>
  );
}
