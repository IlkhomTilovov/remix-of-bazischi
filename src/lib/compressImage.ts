import imageCompression from 'browser-image-compression';

const SKIP_TYPES = ['image/svg+xml', 'image/gif', 'image/x-icon', 'image/vnd.microsoft.icon'];

/**
 * Resize and re-encode an image to WebP before upload. Skips vector/animated/icon
 * formats and falls back to the original file if compression fails.
 */
export async function compressImage(file: File, maxWidthOrHeight: number, quality = 0.8): Promise<File> {
  if (!file.type.startsWith('image/') || SKIP_TYPES.includes(file.type)) return file;
  try {
    const compressed = await imageCompression(file, {
      maxWidthOrHeight,
      maxSizeMB: 3,
      useWebWorker: true,
      initialQuality: quality,
      fileType: 'image/webp',
    });
    return new File([compressed], 'image.webp', { type: 'image/webp' });
  } catch (e) {
    console.warn('Image compression failed, using original file', e);
    return file;
  }
}
