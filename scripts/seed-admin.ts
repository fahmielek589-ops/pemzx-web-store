/**
 * PEMZX — Initial admin seed script
 * ============================================================
 * Run once with: npm run db:seed
 *
 * Reads ADMIN_EMAIL and ADMIN_PASSWORD from process.env (populated
 * from your .env file, which is git-ignored and never committed).
 * ADMIN_PASSWORD is hashed with Argon2id immediately and only the
 * hash is written to the database — the plaintext value is never
 * logged, stored, or written anywhere else.
 *
 * After the account exists, you can remove ADMIN_PASSWORD from
 * .env entirely and manage the password going forward from
 * /admin/settings (Change Password), which invalidates old
 * sessions on rotation.
 *
 * Safe to re-run: if a user with ADMIN_EMAIL already exists, the
 * script does nothing rather than overwriting an existing account.
 */

import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error(
      "Seed aborted: ADMIN_EMAIL and ADMIN_PASSWORD must be set in your .env file.\n" +
        "Copy .env.example to .env and fill both in before running `npm run db:seed`."
    );
    process.exitCode = 1;
    return;
  }

  if (password.length < 10) {
    console.error(
      "Seed aborted: ADMIN_PASSWORD is too short. Use at least 10 characters, " +
        "mixing upper/lowercase letters and numbers."
    );
    process.exitCode = 1;
    return;
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(
      `An account for ${email} already exists — seed skipped. ` +
        "Use /admin/settings to change the password instead of re-seeding."
    );
    return;
  }

  const passwordHash = await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
  });

  await prisma.user.create({
    data: {
      email,
      passwordHash,
      name: "Pemzx",
      role: "ADMIN",
      status: "ACTIVE",
    },
  });

  console.log(`Admin account created for ${email}.`);
  console.log(
    "You can now remove ADMIN_PASSWORD from .env — only its Argon2id hash " +
      "was stored, the plaintext value was never written to disk."
  );
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
