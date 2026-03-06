import { S3Client } from '@aws-sdk/client-s3';

let r2Client: S3Client | null = null;

/**
 * Get Cloudflare R2 client (S3-compatible).
 * Returns null if R2 env vars are not configured.
 *
 * Required env vars:
 *   R2_ACCOUNT_ID       — Cloudflare account ID
 *   R2_ACCESS_KEY_ID    — R2 API token access key ID
 *   R2_SECRET_ACCESS_KEY — R2 API token secret
 *   R2_BUCKET_NAME      — bucket name
 *   R2_PUBLIC_URL       — public base URL for serving files
 *                         (e.g. https://pub-xxx.r2.dev or custom domain)
 */
export const getR2Client = (): S3Client | null => {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    console.warn(
      '[R2] R2_ACCOUNT_ID, R2_ACCESS_KEY_ID or R2_SECRET_ACCESS_KEY not set — storage uploads disabled'
    );
    return null;
  }

  if (!r2Client) {
    r2Client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  return r2Client;
};

export const R2_BUCKET = process.env.R2_BUCKET_NAME || 'studentos';
export const R2_PUBLIC_URL = (process.env.R2_PUBLIC_URL || '').replace(/\/$/, '');
