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

    const caseTypes = await prisma.caseType.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        description: true,
      },
    })

    return NextResponse.json(caseTypes)
  } catch (error) {
    console.error('Error fetching case types:', error)
    return NextResponse.json(
      { error: 'Something went wrong while fetching case types. Please try again.' },
      { status: 500 }
    )
  }
} 