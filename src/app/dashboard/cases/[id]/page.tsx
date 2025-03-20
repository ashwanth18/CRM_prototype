'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, use } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ArrowLeft,
  Calendar,
  Clock,
  Edit,
  FileText,
  MapPin,
  Plus,
  User,
  Building,
  AlertTriangle,
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

interface CaseDetails {
  id: string
  title: string
  caseNumber: string
  status: string
  priority: string
  location: string
  description: string
  medicalHistory: string | null
  currentMedications: string | null
  symptoms: string
  requiredAssistance: string
  createdAt: string
  updatedAt: string
  caseType: {
    id: string
    name: string
    description: string
  }
  client: {
    id: string
    companyName: string
    contactPerson: string
  }
  createdBy: {
    id: string
    name: string
    email: string
  }
  assignedTo: {
    id: string
    name: string
    email: string
  } | null
  providers: Array<{
    id: string
    role: string
    provider: {
      id: string
      name: string
      type: string
    }
  }>
  history: Array<{
    id: string
    action: string
    description: string
    createdAt: string
    user: {
      id: string
      name: string
    }
  }>
  documents: Array<{
    id: string
    name: string
    type: string
    url: string
    uploadedAt: string
    uploadedBy: {
      id: string
      name: string
    }
  }>
}

export default function CaseDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [caseDetails, setCaseDetails] = useState<CaseDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const resolvedParams = use(params)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    const fetchCaseDetails = async () => {
      try {
        const response = await fetch(`/api/cases/${resolvedParams.id}`)
        if (!response.ok) {
          throw new Error('Failed to fetch case details')
        }
        const data = await response.json()
        setCaseDetails(data)
      } catch (error) {
        console.error('Error fetching case details:', error)
        // TODO: Show error message to user
      } finally {
        setIsLoading(false)
      }
    }

    if (session?.user) {
      fetchCaseDetails()
    }
  }, [session, resolvedParams.id])

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!caseDetails) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Case Not Found</h2>
          <p className="mt-2 text-muted-foreground">
            The case you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Button asChild className="mt-4">
            <Link href="/dashboard/cases">Back to Cases</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/cases">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to cases</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{caseDetails.title}</h1>
            <p className="text-muted-foreground">Case #{caseDetails.caseNumber}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/cases/${resolvedParams.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Case
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/dashboard/cases/${resolvedParams.id}/documents/new`}>
              <Plus className="mr-2 h-4 w-4" />
              Add Document
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Main Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Case Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Type:</span>
                  <span className="text-sm">{caseDetails.caseType.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Location:</span>
                  <span className="text-sm">{caseDetails.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Priority:</span>
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
                      caseDetails.priority === 'High' && "bg-red-100 text-red-700",
                      caseDetails.priority === 'Medium' && "bg-orange-100 text-orange-700",
                      caseDetails.priority === 'Normal' && "bg-blue-100 text-blue-700"
                    )}
                  >
                    {caseDetails.priority}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Status:</span>
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
                      caseDetails.status === 'PENDING' && "bg-yellow-100 text-yellow-700",
                      caseDetails.status === 'IN_PROGRESS' && "bg-blue-100 text-blue-700",
                      caseDetails.status === 'RESOLVED' && "bg-green-100 text-green-700",
                      caseDetails.status === 'REJECTED' && "bg-red-100 text-red-700",
                      caseDetails.status === 'CLOSED' && "bg-gray-100 text-gray-700"
                    )}
                  >
                    {caseDetails.status}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Created:</span>
                  <span className="text-sm">
                    {format(new Date(caseDetails.createdAt), 'PPP')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Created By:</span>
                  <span className="text-sm">{caseDetails.createdBy.name}</span>
                </div>
                {caseDetails.assignedTo && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Assigned To:</span>
                    <span className="text-sm">{caseDetails.assignedTo.name}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Client Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Company:</span>
                  <span className="text-sm">{caseDetails.client.companyName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Contact Person:</span>
                  <span className="text-sm">{caseDetails.client.contactPerson}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Medical Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="mb-2 text-sm font-medium">Description</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {caseDetails.description}
                </p>
              </div>
              <div>
                <h4 className="mb-2 text-sm font-medium">Current Symptoms</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {caseDetails.symptoms}
                </p>
              </div>
              {caseDetails.medicalHistory && (
                <div>
                  <h4 className="mb-2 text-sm font-medium">Medical History</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {caseDetails.medicalHistory}
                  </p>
                </div>
              )}
              {caseDetails.currentMedications && (
                <div>
                  <h4 className="mb-2 text-sm font-medium">Current Medications</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {caseDetails.currentMedications}
                  </p>
                </div>
              )}
              <div>
                <h4 className="mb-2 text-sm font-medium">Required Assistance</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {caseDetails.requiredAssistance}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Side Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Documents</CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/dashboard/cases/${resolvedParams.id}/documents/new`}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Document
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {!caseDetails.documents || caseDetails.documents.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No documents uploaded yet.</p>
                ) : (
                  caseDetails.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{doc.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Uploaded by {doc.uploadedBy.name} on{' '}
                            {format(new Date(doc.uploadedAt), 'PP')}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <a href={doc.url} target="_blank" rel="noopener noreferrer">
                          View
                        </a>
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Providers</CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/dashboard/cases/${resolvedParams.id}/providers/assign`}>
                  <Plus className="mr-2 h-4 w-4" />
                  Assign Provider
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {caseDetails.providers.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No providers assigned yet.</p>
                ) : (
                  caseDetails.providers.map((provider) => (
                    <div
                      key={provider.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <p className="text-sm font-medium">{provider.provider.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {provider.provider.type} • {provider.role}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/dashboard/providers/${provider.provider.id}`}>
                          View
                        </Link>
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Case History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {caseDetails.history.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-start gap-3 rounded-lg border p-3"
                  >
                    <div className="mt-0.5">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-medium">{entry.user.name}</span>{' '}
                        {entry.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(entry.createdAt), 'PPp')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 