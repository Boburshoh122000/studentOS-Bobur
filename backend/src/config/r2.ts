import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

let r2Client: S3Client | null = null;

export const R2_BUCKET = process.env.R2_BUCKET_NAME || 'studentos';
export const R2_PUBLIC_URL = (process.env.R2_PUBLIC_URL || '').replace(/\/$/, '');

/**
 * Get or create the R2 S3-compatible client.
 * Returns null if R2 env vars are not configured.
 */
export function getR2Client(): S3Client | null {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    console.warn(
      '[R2] R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, or R2_SECRET_ACCESS_KEY not set — storage uploads disabled'
    );
    return null;
  }

  if (!r2Client) {
    r2Client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId, secretAccessKey },
    });
  }

  return r2Client;
}

/**
 * Upload a file to Cloudflare R2.
 * @returns The public URL of the uploaded file, or null on failure.
 */
export async function uploadToR2(
  key: string,
  body: Buffer,
  contentType: string
): Promise<string | null> {
  const client = getR2Client();
  if (!client) return null;

  try {
    await client.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
        Body: body,
        ContentType: contentType,
      })
    );

    if (!R2_PUBLIC_URL) {
      console.warn('[R2] R2_PUBLIC_URL not set — cannot build public URL');
      return null;
    }

    return `${R2_PUBLIC_URL}/${key}`;
  } catch (error) {
    console.error('[R2] Upload failed:', error);
    return null;
  }
}

/**
 * Delete a file from Cloudflare R2.
 */
export async function deleteFromR2(key: string): Promise<boolean> {
  const client = getR2Client();
  if (!client) return false;

  try {
    await client.send(
      new DeleteObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
      })
    );
    return true;
  } catch (error) {
    console.error('[R2] Delete failed:', error);
    return false;
  }
}
