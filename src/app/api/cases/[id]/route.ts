import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type Props = {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: Props) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user with profiles
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        clientProfile: true,
        employeeProfile: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Build where clause based on user role
    const where = {
      id: params.id,
      ...(user.role === 'CLIENT'
        ? { clientId: user.clientProfile?.id }
        : user.role === 'EMPLOYEE'
        ? {
            OR: [
              { assignedToId: user.employeeProfile?.id },
              { createdById: user.id },
            ],
          }
        : {}), // Admins can see all cases
    }

    const case_ = await prisma.case.findFirst({
      where,
      include: {
        caseType: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        client: {
          select: {
            id: true,
            companyName: true,
            contactPerson: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignedTo: true,
        history: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        documents: {
          include: {
            uploadedBy: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            uploadedAt: 'desc',
          },
        },
      },
    })

    if (!case_) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    }

    return NextResponse.json(case_)
  } catch (error) {
    console.error('Error fetching case details:', error)
    return NextResponse.json(
      { error: 'Something went wrong while fetching case details. Please try again.' },
      { status: 500 }
    )
  }
} 