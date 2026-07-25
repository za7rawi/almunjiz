import { createCipheriv, createDecipheriv, randomBytes, createHmac } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const TAG_LENGTH = 16;
const ENCRYPTION_PREFIX = 'enc:v1:';

function getEncryptionKey(): Buffer {
  const key = process.env.PAYMENT_ENCRYPTION_KEY;
  if (!key) throw new Error('PAYMENT_ENCRYPTION_KEY environment variable is required');
  const buf = Buffer.from(key, 'hex');
  if (buf.length !== 32) throw new Error('PAYMENT_ENCRYPTION_KEY must be a 64-character hex string (32 bytes)');
  return buf;
}

export function encrypt(plaintext: string): string {
  if (!plaintext) return plaintext;
  if (plaintext.startsWith(ENCRYPTION_PREFIX)) return plaintext;
  const key = getEncryptionKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${ENCRYPTION_PREFIX}${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`;
}

export function decrypt(ciphertext: string): string {
  if (!ciphertext) return ciphertext;
  if (!ciphertext.startsWith(ENCRYPTION_PREFIX)) return ciphertext;
  const rest = ciphertext.slice(ENCRYPTION_PREFIX.length);
  const [ivHex, tagHex, dataHex] = rest.split(':');
  if (!ivHex || !tagHex || !dataHex) throw new Error('Invalid encrypted value format');
  const key = getEncryptionKey();
  const iv = Buffer.from(ivHex, 'hex');
  const tag = Buffer.from(tagHex, 'hex');
  const encrypted = Buffer.from(dataHex, 'hex');
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString('utf8');
}

export function encryptGatewayKeys<T extends Record<string, unknown>>(
  data: T,
  fields: string[],
): T {
  const result = { ...data } as Record<string, unknown>;
  for (const field of fields) {
    const val = result[field];
    if (typeof val === 'string' && val && !val.startsWith(ENCRYPTION_PREFIX)) {
      result[field] = encrypt(val);
    }
  }
  return result as T;
}

export function decryptGatewayKeys<T extends Record<string, unknown>>(
  data: T,
  fields: string[],
): T {
  const result = { ...data } as Record<string, unknown>;
  for (const field of fields) {
    const val = result[field];
    if (typeof val === 'string' && val) {
      try {
        result[field] = decrypt(val);
      } catch {
        // key may be unencrypted (legacy data)
      }
    }
  }
  return result as T;
}

export function generateIdempotencyKey(): string {
  return `idem_${Date.now().toString(36)}_${randomBytes(8).toString('hex')}`;
}

export function computeHmacSha256(secret: string, payload: string): string {
  return createHmac('sha256', secret).update(payload, 'utf8').digest('hex');
}

export function verifyHmacSha256(secret: string, payload: string, signature: string): boolean {
  const expected = computeHmacSha256(secret, payload);
  return timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(signature, 'hex'));
}

export function computeHmacSha512(secret: string, payload: string): string {
  return createHmac('sha512', secret).update(payload, 'utf8').digest('hex');
}

function timingSafeEqual(a: Buffer, b: Buffer): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a[i] ^ b[i];
  }
  return result === 0;
}
