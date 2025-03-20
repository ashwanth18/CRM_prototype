import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  req: Request,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { name, type, description, url } = await req.json()

    if (!name || !type || !url) {
      return new NextResponse('Missing required fields', { status: 400 })
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

    // Create document
    const document = await prisma.document.create({
      data: {
        name,
        type,
        description,
        url,
        caseId: context.params.id,
        uploadedById: session.user.id,
      },
    })

    // Create case history entry
    await prisma.caseHistory.create({
      data: {
        caseId: context.params.id,
        userId: session.user.id,
        action: 'DOCUMENT_UPLOADED',
        description: `Document "${name}" uploaded`,
      },
    })

    return NextResponse.json(document)
  } catch (error) {
    console.error('Error creating document:', error)
    return new NextResponse(
      'Something went wrong while creating document. Please try again.',
      { status: 500 }
    )
  }
} 