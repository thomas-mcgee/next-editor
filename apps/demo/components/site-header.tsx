import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
      <Link href="/" className="text-sm font-semibold uppercase tracking-[0.24em] text-zinc-900">
        NextEditor
      </Link>
      <nav className="flex items-center gap-6 text-sm text-zinc-600">
        <Link href="/">Home</Link>
        <Link href="/about">About</Link>
        <Link href="/admin/login">Login</Link>
      </nav>
    </header>
  );
}
