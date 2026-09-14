/**
 * Re-exports of Prisma's generated model types, so components can
 * import domain types from a stable path (`@/types`) without every
 * file needing to know it's ultimately backed by Prisma.
 */
export type {
  User,
  Session,
  Video,
  Product,
  Project,
  Message,
  SiteSettings,
  Role,
  UserStatus,
  ContentStatus,
  ProductStatus,
  MessageStatus,
} from "@prisma/client";
