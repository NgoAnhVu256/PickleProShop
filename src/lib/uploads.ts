import path from "path";

/**
 * Central upload directory management.
 * 
 * On VPS (Linux), uploads go to /var/www/picklepro/public/uploads/
 * This uses an absolute path to avoid issues with process.cwd() changing
 * when PM2 restarts or when Next.js build runs.
 * 
 * The UPLOAD_DIR env variable can be set to override the default.
 */

function getUploadBaseDir(): string {
  // Allow override via environment variable
  if (process.env.UPLOAD_DIR) {
    return process.env.UPLOAD_DIR;
  }
  // Default: <project>/public/uploads
  return path.join(process.cwd(), "public", "uploads");
}

export function getUploadDir(subfolder?: string): string {
  const base = getUploadBaseDir();
  if (subfolder) {
    const safe = subfolder.replace(/[^a-z0-9_-]/gi, "_").toLowerCase();
    return path.join(base, safe);
  }
  return base;
}

export function getUploadFilePath(relativePath: string): string {
  // relativePath example: "products/abc.jpg" or "/uploads/products/abc.jpg"
  let cleaned = relativePath;
  // Strip leading /uploads/ prefix if present
  if (cleaned.startsWith("/uploads/")) {
    cleaned = cleaned.slice("/uploads/".length);
  } else if (cleaned.startsWith("uploads/")) {
    cleaned = cleaned.slice("uploads/".length);
  }
  // Security: prevent directory traversal
  cleaned = cleaned.replace(/\.\./g, "").replace(/^\/+/, "");
  return path.join(getUploadBaseDir(), cleaned);
}

export function getPublicUrl(subfolder: string, filename: string): string {
  return `/uploads/${subfolder}/${filename}`;
}
