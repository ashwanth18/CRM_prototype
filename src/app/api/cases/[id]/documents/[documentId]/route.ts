import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: Request,
  context: { params: { id: string; documentId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
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
      return new NextResponse('User not found', { status: 404 })
    }

    // Check if user has access to the case
    const case_ = await prisma.case.findFirst({
      where: {
        id: context.params.id,
        OR: [
          { clientId: user.clientProfile?.id },
          { assignedToId: user.employeeProfile?.id },
          { userId: user.id },
          user.role === 'ADMIN',
        ],
      },
    })

    if (!case_) {
      return new NextResponse('Case not found or access denied', { status: 404 })
    }

    // Get document
    const document = await prisma.document.findFirst({
      where: {
        id: context.params.documentId,
        caseId: context.params.id,
      },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    if (!document) {
      return new NextResponse('Document not found', { status: 404 })
    }

    return NextResponse.json(document)
  } catch (error) {
    console.error('Error fetching document:', error)
    return new NextResponse(
      'Something went wrong while fetching document. Please try again.',
      { status: 500 }
    )
  }
} 