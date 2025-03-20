import { z } from 'zod'

export const CasePriorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])

export const createCaseSchema = z.object({
  caseTypeId: z.string({
    required_error: 'Case type is required',
  }),
  clientId: z.string({
    required_error: 'Client is required',
  }),
  title: z
    .string({
      required_error: 'Title is required',
    })
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title must not exceed 100 characters'),
  location: z
    .string({
      required_error: 'Location is required',
    })
    .min(3, 'Location must be at least 3 characters')
    .max(100, 'Location must not exceed 100 characters'),
  priority: CasePriorityEnum,
  description: z
    .string({
      required_error: 'Description is required',
    })
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description must not exceed 2000 characters'),
  medicalHistory: z
    .string()
    .max(2000, 'Medical history must not exceed 2000 characters')
    .optional(),
  currentMedications: z
    .string()
    .max(2000, 'Current medications must not exceed 2000 characters')
    .optional(),
  symptoms: z
    .string({
      required_error: 'Symptoms are required',
    })
    .min(10, 'Symptoms must be at least 10 characters')
    .max(2000, 'Symptoms must not exceed 2000 characters'),
  requiredAssistance: z
    .string({
      required_error: 'Required assistance is required',
    })
    .min(10, 'Required assistance must be at least 10 characters')
    .max(2000, 'Required assistance must not exceed 2000 characters'),
  assignedToId: z.string().min(1, 'Assigned employee is required'),
})

export type CreateCaseInput = z.infer<typeof createCaseSchema> 