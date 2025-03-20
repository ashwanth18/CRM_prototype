import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import crypto from 'crypto'
import { ensureUploadsDirectory, MAX_FILE_SIZE, ALLOWED_FILE_TYPES } from '@/lib/upload'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Ensure uploads directory exists
    await ensureUploadsDirectory()

    const formData = await req.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return new NextResponse('No file uploaded', { status: 400 })
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return new NextResponse('File size exceeds 5MB limit', { status: 400 })
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return new NextResponse('File type not allowed', { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate a unique filename
    const uniqueId = crypto.randomUUID()
    const originalName = file.name
    const extension = originalName.split('.').pop()
    const fileName = `${uniqueId}.${extension}`

    // Save file to uploads directory
    const uploadDir = join(process.cwd(), 'public', 'uploads')
    await writeFile(join(uploadDir, fileName), buffer)

    // Return the public URL
    const url = `/uploads/${fileName}`

    return NextResponse.json({ url })
  } catch (error) {
    console.error('Error handling file upload:', error)
    return new NextResponse(
      'Something went wrong while handling the file upload. Please try again.',
      { status: 500 }
    )
  }
} 