"use client";

import { useState, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { StyledInput } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, rememberMe }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      // BH. Subtle cyan light sweep on success, then redirect.
      setSuccess(true);
      const next = searchParams.get("next");
      const destination = next && next.startsWith("/admin") ? next : "/admin";
      setTimeout(() => {
        router.push(destination);
        router.refresh();
      }, 450);
    } catch {
      setError("Unable to reach the server. Please check your connection.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={`login-form ${success ? "login-form--success" : ""}`} noValidate>
      <div className="login-form__brand">
        <span className="login-form__brand-mark">PEMZX</span>
        <span className="login-form__brand-sub">Admin Portal</span>
      </div>

      <div className="login-form__heading">
        <h1>Welcome back</h1>
        <p>Sign in to access your PEMZX control center.</p>
      </div>

      {error && (
        <div className="login-form__error" role="alert">
          {error}
        </div>
      )}

      <div className="login-form__fields">
        <StyledInput
          label="Email or username"
          type="email"
          name="email"
          autoComplete="username"
          placeholder="you@example.com"
          icon={<Mail size={18} />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <StyledInput
          label="Password"
          type={showPassword ? "text" : "password"}
          name="password"
          autoComplete="current-password"
          placeholder="••••••••••"
          icon={<Lock size={18} />}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          rightElement={
            <button
              type="button"
              className="login-form__toggle-visibility"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              tabIndex={0}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          }
        />
      </div>

      <div className="login-form__row">
        <label className="login-form__checkbox">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          <span>Remember me</span>
        </label>
        <a href="/forgot-password" className="login-form__forgot">
          Forgot password?
        </a>
      </div>

      <Button type="submit" loading={loading} className="login-form__submit">
        Sign In
      </Button>
    </form>
  );
}
