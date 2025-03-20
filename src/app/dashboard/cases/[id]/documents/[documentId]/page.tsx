'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Download } from 'lucide-react'
import Link from 'next/link'

interface Document {
  id: string
  name: string
  type: string
  description: string | null
  url: string
  uploadedAt: string
  uploadedBy: {
    id: string
    name: string
  }
}

export default function DocumentViewerPage({
  params,
}: {
  params: { id: string; documentId: string }
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [document, setDocument] = useState<Document | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const response = await fetch(
          `/api/cases/${params.id}/documents/${params.documentId}`
        )
        if (!response.ok) {
          throw new Error('Failed to fetch document')
        }
        const data = await response.json()
        setDocument(data)
      } catch (error) {
        console.error('Error fetching document:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (session?.user) {
      fetchDocument()
    }
  }, [session, params.id, params.documentId])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!document) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Document Not Found</h2>
          <p className="mt-2 text-muted-foreground">
            The document you're looking for doesn't exist or you don't have
            permission to view it.
          </p>
        </div>
      </div>
    )
  }

  const extension = document.name.split('.').pop()?.toLowerCase()
  const isImage = ['jpg', 'jpeg', 'png'].includes(extension || '')
  const isPdf = extension === 'pdf'

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/dashboard/cases/${params.id}`}>
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to case</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{document.name}</h1>
            <p className="text-sm text-muted-foreground">
              Uploaded by {document.uploadedBy.name}
            </p>
          </div>
        </div>
        <Button variant="outline" asChild>
          <a href={document.url} download={document.name}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </a>
        </Button>
      </div>

      <div className="rounded-lg border bg-card">
        {isImage ? (
          <div className="flex items-center justify-center p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={document.url}
              alt={document.name}
              className="max-h-[80vh] w-auto rounded-lg"
            />
          </div>
        ) : isPdf ? (
          <iframe
            src={document.url}
            className="h-[80vh] w-full rounded-lg"
            title={document.name}
          />
        ) : (
          <div className="flex items-center justify-center p-8">
            <p className="text-muted-foreground">
              Preview not available. Please download the file to view it.
            </p>
          </div>
        )}
      </div>
    </div>
  )
} 