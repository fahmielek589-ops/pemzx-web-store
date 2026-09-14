import Link from "next/link";
import { ShieldOff } from "lucide-react";

export function AccessDenied() {
  return (
    <main className="status-page">
      <div className="status-page__content">
        <div className="status-page__icon">
          <ShieldOff size={28} />
        </div>
        <h1>Access Denied</h1>
        <p>Your account doesn&apos;t have permission to view this page.</p>
        <Link href="/" className="btn btn--secondary">
          Back Home
        </Link>
      </div>
    </main>
  );
}
