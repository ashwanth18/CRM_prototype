import { mkdir } from 'fs/promises'
import { join } from 'path'

export async function ensureUploadsDirectory() {
  const uploadDir = join(process.cwd(), 'public', 'uploads')
  try {
    await mkdir(uploadDir, { recursive: true })
  } catch (error) {
    console.error('Error creating uploads directory:', error)
  }
}

// Maximum file size (5MB)
export const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB in bytes

// Allowed file types
export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
] 