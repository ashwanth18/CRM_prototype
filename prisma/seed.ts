import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  try {
    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10)
    const admin = await prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: {},
      create: {
        email: 'admin@example.com',
        name: 'Admin User',
        password: adminPassword,
        role: 'ADMIN',
        isActive: true,
      },
    })

    console.log('Created admin user:', admin.email)

    // Create case types
    const caseTypes = await Promise.all([
      prisma.caseType.upsert({
        where: { name: 'Emergency Transport' },
        update: {},
        create: {
          name: 'Emergency Transport',
          description: 'Urgent medical transportation services',
          isActive: true,
        },
      }),
      prisma.caseType.upsert({
        where: { name: 'Medical Evacuation' },
        update: {},
        create: {
          name: 'Medical Evacuation',
          description: 'International medical evacuation services',
          isActive: true,
        },
      }),
      prisma.caseType.upsert({
        where: { name: 'Medical Repatriation' },
        update: {},
        create: {
          name: 'Medical Repatriation',
          description: 'Return transport to home country for medical treatment',
          isActive: true,
        },
      }),
    ])

    console.log('Created case types:', caseTypes.map(ct => ct.name))

    // Create client users
    const clientPassword = await bcrypt.hash('client123', 10)
    
    const client1 = await prisma.user.upsert({
      where: { email: 'contact@insuranceco.com' },
      update: {},
      create: {
        email: 'contact@insuranceco.com',
        name: 'John Smith',
        password: clientPassword,
        role: 'CLIENT',
        isActive: true,
        clientProfile: {
          create: {
            companyName: 'Global Insurance Co.',
            contactPerson: 'John Smith',
            phoneNumber: '+1234567890',
            country: 'United States',
          },
        },
      },
      include: {
        clientProfile: true,
      },
    })

    const client2 = await prisma.user.upsert({
      where: { email: 'contact@hospital.com' },
      update: {},
      create: {
        email: 'contact@hospital.com',
        name: 'Sarah Johnson',
        password: clientPassword,
        role: 'CLIENT',
        isActive: true,
        clientProfile: {
          create: {
            companyName: 'City General Hospital',
            contactPerson: 'Sarah Johnson',
            phoneNumber: '+1987654321',
            country: 'Canada',
          },
        },
      },
      include: {
        clientProfile: true,
      },
    })

    console.log('Created client users:', [client1.email, client2.email])

    // Create employee user
    const employeePassword = await bcrypt.hash('employee123', 10)
    const employee = await prisma.user.upsert({
      where: { email: 'coordinator@gmca.com' },
      update: {},
      create: {
        email: 'coordinator@gmca.com',
        name: 'Michael Brown',
        password: employeePassword,
        role: 'EMPLOYEE',
        isActive: true,
        employeeProfile: {
          create: {
            department: 'Operations',
            position: 'Case Coordinator',
          },
        },
      },
    })

    console.log('Created employee user:', employee.email)

    // Create a sample case
    if (client1.clientProfile) {
      const sampleCase = await prisma.case.create({
        data: {
          title: 'Emergency Medical Transport - Sample',
          description: 'Sample case for testing',
          caseTypeId: caseTypes[0].id,
          clientId: client1.clientProfile.id,
          createdById: admin.id,
          assignedToId: employee.id,
          location: 'New York, USA',
          priority: 'HIGH',
          symptoms: 'Patient requires urgent medical transport',
          requiredAssistance: 'Ground ambulance with medical team',
          medicalHistory: 'No significant medical history',
          currentMedications: 'None',
        },
      })

      // Create case history entry
      await prisma.caseHistory.create({
        data: {
          caseId: sampleCase.id,
          userId: admin.id,
          action: 'CREATED',
          description: 'Case created and assigned',
        },
      })

      console.log('Created sample case:', sampleCase.title)
    }

  } catch (error) {
    console.error('Error seeding database:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 