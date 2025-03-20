import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createCaseSchema } from '@/lib/validations/case'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const json = await req.json()
    const body = createCaseSchema.parse(json)

    // Get the current user
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        employeeProfile: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Create the case
    const newCase = await prisma.case.create({
      data: {
        title: body.title,
        description: body.description,
        caseTypeId: body.caseTypeId,
        clientId: body.clientId,
        createdById: session.user.id,
        assignedToId: body.assignedToId,
        location: body.location,
        priority: body.priority,
        symptoms: body.symptoms,
        requiredAssistance: body.requiredAssistance,
        medicalHistory: body.medicalHistory,
        currentMedications: body.currentMedications,
      },
    })

    // Create initial case history entry
    await prisma.caseHistory.create({
      data: {
        caseId: newCase.id,
        userId: session.user.id,
        action: 'CREATED',
        description: 'Case created',
      },
    })

    return NextResponse.json(newCase)
  } catch (error) {
    console.error('Error creating case:', error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json(
      { error: 'Something went wrong while creating the case. Please try again.' },
      { status: 500 }
    )
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const search = searchParams.get('search')

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

    // Build where clause based on user role and filters
    const where = {
      ...(status ? { status } : {}),
      ...(priority ? { priority } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } },
              { location: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
      // Role-based filters
      ...(user.role === 'CLIENT'
        ? { clientId: user.clientProfile?.id }
        : user.role === 'EMPLOYEE'
        ? {
            OR: [
              { assignedToId: user.employeeProfile?.id },
              { userId: user.id },
            ],
          }
        : {}), // Admins can see all cases
    }

    const cases = await prisma.case.findMany({
      where,
      include: {
        caseType: true,
        client: true,
        createdBy: true,
        assignedTo: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(cases)
  } catch (error) {
    console.error('Error fetching cases:', error)
    return new NextResponse(
      'Something went wrong while fetching cases. Please try again.',
      { status: 500 }
    )
  }
} 