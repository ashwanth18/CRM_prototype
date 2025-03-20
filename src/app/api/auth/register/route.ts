import { NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import speakeasy from 'speakeasy'
import QRCode from 'qrcode'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'

export async function POST(req: Request) {
  try {
    // Log the incoming request
    console.log('Registration request received')
    
    const body = await req.json()
    console.log('Request body:', {
      ...body,
      password: '[REDACTED]'
    })
    
    const { name, email, password } = body

    if (!name || !email || !password) {
      console.log('Missing required fields:', { 
        hasName: !!name, 
        hasEmail: !!email, 
        hasPassword: !!password 
      })
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      })

      if (existingUser) {
        console.log('User already exists:', email)
        return NextResponse.json(
          { error: 'User already exists' },
          { status: 400 }
        )
      }

      // Check if this is the first user (will be admin)
      const userCount = await prisma.user.count()
      const isFirstUser = userCount === 0
      console.log('Is first user:', isFirstUser)

      // Generate 2FA secret
      const secret = speakeasy.generateSecret({
        name: `GMCA2 Systems (${email})`,
      })
      console.log('2FA secret generated')

      // Generate QR code
      const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!)
      console.log('QR code generated')

      // Hash password
      const hashedPassword = await hash(password, 12)
      console.log('Password hashed')

      // Create user
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          twoFactorSecret: secret.base32,
          twoFactorEnabled: true,
          role: isFirstUser ? 'ADMIN' : 'CLIENT',
        },
      })
      console.log('User created successfully:', user.id)

      return NextResponse.json({
        success: true,
        qrCode: qrCodeUrl,
        secret: secret.base32,
      })
    } catch (error) {
      console.error('Database or processing error:', error)
      // Log the full error details
      if (error instanceof PrismaClientKnownRequestError) {
        console.error('Prisma error details:', {
          code: error.code,
          message: error.message,
          meta: error.meta,
        })
      } else if (error instanceof Error) {
        console.error('Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack,
        })
      }
      return NextResponse.json(
        { 
          error: 'Failed to create user',
          details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : 'Unknown error' : undefined
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Registration error:', error)
    // Log the full error details
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
      })
    }
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : 'Unknown error' : undefined
      },
      { status: 500 }
    )
  }
} 