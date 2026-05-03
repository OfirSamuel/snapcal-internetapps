import { OAuth2Client } from 'google-auth-library';
import type { TokenPayload } from 'google-auth-library';

/**
 * Verifies a Google Sign-In ID token (JWT) for the given OAuth Web client ID.
 * Throws if the token is invalid or the payload is missing.
 */
export async function verifyGoogleIdToken(idToken: string, audience: string): Promise<TokenPayload> {
  const client = new OAuth2Client(audience);
  const ticket = await client.verifyIdToken({
    idToken,
    audience,
  });
  const payload = ticket.getPayload();
  if (!payload) {
    throw new Error('Empty Google token payload');
  }
  return payload;
}
