import { Github, Linkedin, Instagram, Twitter } from "lucide-react";
import { prisma } from "@/lib/db";

async function getSocialLinks() {
  const settings = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });
  return settings;
}

export async function Footer() {
  const settings = await getSocialLinks();
  const year = new Date().getFullYear();

  const socials = [
    { url: settings?.githubUrl, icon: Github, label: "GitHub" },
    { url: settings?.linkedinUrl, icon: Linkedin, label: "LinkedIn" },
    { url: settings?.instagramUrl, icon: Instagram, label: "Instagram" },
    { url: settings?.xUrl, icon: Twitter, label: "X" },
  ].filter((s) => s.url);

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <span className="site-footer__brand">PEMZX</span>
        <p className="site-footer__copyright">
          © {year} Pemzx. All rights reserved.
        </p>
        {socials.length > 0 && (
          <div className="site-footer__socials">
            {socials.map((social) => {
              const Icon = social.icon;
              return (
                <a
                  key={social.label}
                  href={social.url!}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="site-footer__social-link"
                >
                  <Icon size={17} />
                </a>
              );
            })}
          </div>
        )}
      </div>
    </footer>
  );
}
