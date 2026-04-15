import { createHash, randomInt, randomUUID } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

const ACCESS_CODE_ALPHABET = "ABCDEFGHJKMNPQRSTVWXYZ23456789";
const ACCESS_CODE_LENGTH = 8;
const INTERNAL_CLIENT_EMAIL_DOMAIN = "@purephysique.local";

function randomAccessCodeValue() {
  return Array.from({ length: ACCESS_CODE_LENGTH }, () =>
    ACCESS_CODE_ALPHABET[randomInt(0, ACCESS_CODE_ALPHABET.length)],
  ).join("");
}

export function normalizeAccessCode(value: string) {
  return value.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function formatAccessCode(value: string) {
  const normalizedValue = normalizeAccessCode(value);

  if (!normalizedValue) {
    return "";
  }

  return normalizedValue.match(/.{1,4}/g)?.join("-") ?? normalizedValue;
}

export function hashAccessCode(value: string) {
  return createHash("sha256").update(normalizeAccessCode(value)).digest("hex");
}

export function buildInternalClientEmail(clientId: string) {
  return `client-${clientId}${INTERNAL_CLIENT_EMAIL_DOMAIN}`;
}

export function isInternalClientEmail(value: string | null | undefined) {
  const normalizedValue = value?.trim().toLowerCase() ?? "";
  return normalizedValue.startsWith("client-") && normalizedValue.endsWith(INTERNAL_CLIENT_EMAIL_DOMAIN);
}

export async function generateUniqueClientAccessCode(admin: SupabaseClient) {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const accessCode = randomAccessCodeValue();
    const result = await admin
      .from("clients")
      .select("id")
      .eq("invite_token", accessCode)
      .maybeSingle();

    if (result.error) {
      throw new Error(`Failed to check client access code uniqueness: ${result.error.message}`);
    }

    if (!result.data) {
      return accessCode;
    }
  }

  throw new Error("Failed to generate a unique client access code.");
}

export async function seedClientAccessCode(
  admin: SupabaseClient,
  clientId: string,
  accessCode: string,
  nowIso: string,
) {
  const result = await admin.from("client_access_tokens").insert({
    id: randomUUID(),
    client_id: clientId,
    token_hash: hashAccessCode(accessCode),
    expires_at: null,
    used_at: null,
    created_at: nowIso,
  });

  if (result.error) {
    throw new Error(`Failed to create client access code record: ${result.error.message}`);
  }
}

export async function rotateClientAccessCode(
  admin: SupabaseClient,
  clientId: string,
  nowIso: string,
) {
  const nextAccessCode = await generateUniqueClientAccessCode(admin);
  const clientUpdateResult = await admin
    .from("clients")
    .update({
      invite_token: nextAccessCode,
      updated_at: nowIso,
    })
    .eq("id", clientId);

  if (clientUpdateResult.error) {
    throw new Error(`Failed to update client access code: ${clientUpdateResult.error.message}`);
  }

  const markOldCodesResult = await admin
    .from("client_access_tokens")
    .update({
      used_at: nowIso,
    })
    .eq("client_id", clientId)
    .is("used_at", null);

  if (markOldCodesResult.error) {
    throw new Error(`Failed to retire previous client access codes: ${markOldCodesResult.error.message}`);
  }

  await seedClientAccessCode(admin, clientId, nextAccessCode, nowIso);

  return nextAccessCode;
}
