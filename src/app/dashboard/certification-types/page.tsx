'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { DataTable } from '@/components/ui/data-table'
import { columns } from './columns'

// Temporary type definition - will move to types file later
interface CertificationType {
  id: string
  name: string
  description: string | null
  requirements: string[]
  price: number
  duration: number // in days
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export default function CertificationTypesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [certTypes, setCertTypes] = useState<CertificationType[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Redirect if not admin
    if (status === 'unauthenticated' || (session?.user?.role !== 'ADMIN')) {
      router.push('/dashboard')
    }
  }, [status, session, router])

  useEffect(() => {
    // Fetch certification types
    const fetchCertTypes = async () => {
      try {
        const response = await fetch('/api/certification-types')
        const data = await response.json()
        setCertTypes(data)
      } catch (error) {
        console.error('Error fetching certification types:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCertTypes()
  }, [])

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Certification Types</h1>
          <p className="mt-2 text-muted-foreground">
            Manage certification types and their requirements
          </p>
        </div>
        <Button onClick={() => router.push('/dashboard/certification-types/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Type
        </Button>
      </div>

      <div className="rounded-md border">
        <DataTable columns={columns} data={certTypes} />
      </div>
    </div>
  )
} 