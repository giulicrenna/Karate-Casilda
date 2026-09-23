import 'server-only';
import crypto from 'node:crypto';

const ALGO = 'aes-256-gcm';
const KEY_LEN = 32;
const IV_LEN = 12;

function deriveKey(purpose: string): Buffer {
  const secret = process.env.SESSION_PASSWORD;
  if (!secret || secret.length < 32 || secret.includes('REEMPLAZAR')) {
    throw new Error(
      'SESSION_PASSWORD debe estar definida en .env con al menos 32 caracteres y no ser el placeholder.'
    );
  }
  return crypto.hkdfSync('sha256', secret, '', purpose, KEY_LEN) as unknown as Buffer;
}

export function encryptSecret(plain: string, purpose: string): string {
  const key = deriveKey(purpose);
  const iv = crypto.randomBytes(IV_LEN);
  const cipher = crypto.createCipheriv(ALGO, key, iv);
  const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${tag.toString('hex')}:${enc.toString('hex')}`;
}

export function decryptSecret(payload: string, purpose: string): string {
  const [ivHex, tagHex, encHex] = payload.split(':');
  if (!ivHex || !tagHex || !encHex) {
    throw new Error('Formato de secreto cifrado inválido.');
  }
  const key = deriveKey(purpose);
  const decipher = crypto.createDecipheriv(ALGO, key, Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
  const dec = Buffer.concat([decipher.update(Buffer.from(encHex, 'hex')), decipher.final()]);
  return dec.toString('utf8');
}
