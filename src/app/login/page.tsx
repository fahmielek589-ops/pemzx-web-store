import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { AnimalVisual } from "@/components/login/animal-visual";
import { LoginForm } from "@/components/login/login-form";
import "@/components/login/animal-visual.css";
import "@/components/login/login-form.css";
import "@/components/ui/input.css";
import "@/components/ui/button.css";
import "./login-page.css";

export const metadata = {
  title: "Sign In — PEMZX",
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  const user = await getSessionUser();
  if (user) {
    redirect("/admin");
  }

  return (
    <main className="login-page">
      <section className="login-page__visual">
        {/* Point videoSrc/posterSrc at real footage once sourced —
            see AnimalVisual's doc comment for the asset contract. */}
        <AnimalVisual alt="Black wolf in a dark cinematic environment" />
      </section>
      <section className="login-page__panel">
        <LoginForm />
      </section>
    </main>
  );
}
