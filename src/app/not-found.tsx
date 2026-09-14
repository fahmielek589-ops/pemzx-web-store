import Link from "next/link";
import "@/components/admin/status-page.css";

export const metadata = {
  title: "Page Not Found — PEMZX",
};

export default function NotFound() {
  return (
    <main className="status-page">
      <div className="status-page__content">
        <p className="status-page__code">404</p>
        <h1>Page not found.</h1>
        <p>The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
        <Link href="/" className="btn btn--primary">
          Back Home
        </Link>
      </div>
    </main>
  );
}
