import { SignJWT, jwtVerify } from "jose";

const issuer = "saved-collections";
const audience = "saved-collections-api";
const algorithm = "HS256";
const defaultExpiry = "30d";

function secretKey() {
  const secret = process.env.NEXTAUTH_SECRET;

  if (!secret) {
    throw new Error("NEXTAUTH_SECRET is not configured.");
  }

  return new TextEncoder().encode(secret);
}

export async function signApiToken(userId: string, expiresIn: string = defaultExpiry) {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: algorithm })
    .setIssuer(issuer)
    .setAudience(audience)
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secretKey());
}

export async function verifyApiToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey(), { issuer, audience });
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}
