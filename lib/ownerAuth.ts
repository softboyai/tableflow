import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

export function hashOwnerPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyOwnerPassword(password: string, storedHash: string) {
  const [salt, originalHash] = storedHash.split(":");

  if (!salt || !originalHash) {
    return false;
  }

  const nextHash = scryptSync(password, salt, 64);
  const originalBuffer = Buffer.from(originalHash, "hex");

  if (originalBuffer.length !== nextHash.length) {
    return false;
  }

  return timingSafeEqual(originalBuffer, nextHash);
}

export function getOwnerDashboardCookieName(slug: string) {
  return `tableflow_owner_${slug}`;
}
