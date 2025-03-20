import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const clients = await prisma.clientProfile.findMany({
      where: {
        user: {
          isActive: true,
        },
      },
      select: {
        id: true,
        companyName: true,
        contactPerson: true,
        phoneNumber: true,
        country: true,
      },
      orderBy: {
        companyName: 'asc',
      },
    })

    return NextResponse.json(clients)
  } catch (error) {
    console.error('Error fetching clients:', error)
    return NextResponse.json(
      { error: 'Something went wrong while fetching clients. Please try again.' },
      { status: 500 }
    )
  }
} 