import { Link } from "@tanstack/react-router";

export function SiteNotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="text-[8rem] font-bold leading-none text-gradient font-[family-name:var(--font-display)]">404</div>
        <h2 className="mt-2 text-xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex rounded-md bg-gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-glow hover:opacity-90 transition"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
