"use client";

import { useEffect, useState, FormEvent } from "react";
import { AdminHeader } from "@/components/admin/admin-header";
import { StyledInput } from "@/components/ui/input";
import { StyledTextarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/admin/toast";
import "@/components/admin/admin-header.css";
import "@/components/admin/admin-common.css";
import "@/components/ui/input.css";
import "@/components/ui/button.css";

interface SiteSettingsValues {
  siteTitle: string;
  siteDescription: string;
  githubUrl: string;
  linkedinUrl: string;
  instagramUrl: string;
  xUrl: string;
}

interface AdminProfile {
  name: string;
  email: string;
}

export default function AdminSettingsPage() {
  const { showToast } = useToast();
  const [settings, setSettings] = useState<SiteSettingsValues | null>(null);
  const [savingSettings, setSavingSettings] = useState(false);
  const [profile, setProfile] = useState<AdminProfile | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.item) {
          setSettings({
            siteTitle: data.item.siteTitle,
            siteDescription: data.item.siteDescription,
            githubUrl: data.item.githubUrl ?? "",
            linkedinUrl: data.item.linkedinUrl ?? "",
            instagramUrl: data.item.instagramUrl ?? "",
            xUrl: data.item.xUrl ?? "",
          });
        }
      })
      .catch(() => showToast("Failed to load settings.", "error"));

    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          setProfile({ name: data.user.name, email: data.user.email });
        }
      })
      .catch(() => {
        /* Profile display is non-critical; the page still functions without it. */
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function updateSettings<K extends keyof SiteSettingsValues>(key: K, value: string) {
    setSettings((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  async function handleSaveSettings(e: FormEvent) {
    e.preventDefault();
    if (!settings) return;
    setSavingSettings(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error ?? "Failed to save settings.", "error");
        return;
      }
      showToast("Changes saved.");
    } catch {
      showToast("Failed to save settings.", "error");
    } finally {
      setSavingSettings(false);
    }
  }

  async function handleChangePassword(e: FormEvent) {
    e.preventDefault();
    setPasswordError(null);

    if (newPassword !== confirmNewPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setChangingPassword(true);
    try {
      const res = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword, confirmNewPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPasswordError(data.error ?? "Failed to change password.");
        return;
      }
      showToast("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch {
      setPasswordError("Failed to change password. Please try again.");
    } finally {
      setChangingPassword(false);
    }
  }

  return (
    <div>
      <AdminHeader title="Settings" subtitle="Manage your profile, website, and security." />

      <div className="section-card">
        <h2 className="section-card__title">Profile</h2>
        <p className="section-card__description">Your administrator account details.</p>
        <div className="form-grid">
          <StyledInput label="Name" value={profile?.name ?? "…"} disabled />
          <StyledInput label="Email" value={profile?.email ?? "…"} disabled />
        </div>
        <p className="section-card__hint">
          Role: Administrator. To change your name or email, update it directly in the database — this is intentionally not self-service from the UI.
        </p>
      </div>

      <div className="section-card">
        <h2 className="section-card__title">Website</h2>
        <p className="section-card__description">
          Shown in search results and social previews.
        </p>
        {settings && (
          <form onSubmit={handleSaveSettings}>
            <div className="form-grid">
              <div className="form-grid--full">
                <StyledInput
                  label="Site title"
                  value={settings.siteTitle}
                  onChange={(e) => updateSettings("siteTitle", e.target.value)}
                />
              </div>
              <div className="form-grid--full">
                <StyledTextarea
                  label="Site description"
                  rows={3}
                  value={settings.siteDescription}
                  onChange={(e) => updateSettings("siteDescription", e.target.value)}
                />
              </div>
            </div>
            <div className="section-card__actions">
              <Button type="submit" loading={savingSettings}>
                Save Changes
              </Button>
            </div>
          </form>
        )}
      </div>

      <div className="section-card">
        <h2 className="section-card__title">Social Links</h2>
        <p className="section-card__description">Displayed in your portfolio footer.</p>
        {settings && (
          <form onSubmit={handleSaveSettings}>
            <div className="form-grid">
              <StyledInput
                label="GitHub"
                placeholder="https://github.com/…"
                value={settings.githubUrl}
                onChange={(e) => updateSettings("githubUrl", e.target.value)}
              />
              <StyledInput
                label="LinkedIn"
                placeholder="https://linkedin.com/in/…"
                value={settings.linkedinUrl}
                onChange={(e) => updateSettings("linkedinUrl", e.target.value)}
              />
              <StyledInput
                label="Instagram"
                placeholder="https://instagram.com/…"
                value={settings.instagramUrl}
                onChange={(e) => updateSettings("instagramUrl", e.target.value)}
              />
              <StyledInput
                label="X"
                placeholder="https://x.com/…"
                value={settings.xUrl}
                onChange={(e) => updateSettings("xUrl", e.target.value)}
              />
            </div>
            <div className="section-card__actions">
              <Button type="submit" loading={savingSettings}>
                Save Changes
              </Button>
            </div>
          </form>
        )}
      </div>

      <div className="section-card">
        <h2 className="section-card__title">Security</h2>
        <p className="section-card__description">Change your account password.</p>
        <form onSubmit={handleChangePassword}>
          {passwordError && (
            <div className="form-error" role="alert">
              {passwordError}
            </div>
          )}
          <div className="form-grid">
            <div className="form-grid--full">
              <StyledInput
                label="Current password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <StyledInput
              label="New password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <StyledInput
              label="Confirm new password"
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              required
            />
          </div>
          <div className="section-card__actions">
            <Button type="submit" loading={changingPassword}>
              Change Password
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
