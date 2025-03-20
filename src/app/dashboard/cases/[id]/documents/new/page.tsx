'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Upload } from 'lucide-react'
import Link from 'next/link'

interface CaseType {
  id: string
  name: string
  requiredDocuments: Array<{
    id: string
    name: string
    description: string
    isRequired: boolean
  }>
}

export default function NewDocumentPage({
  params,
}: {
  params: { id: string }
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [documentType, setDocumentType] = useState('')
  const [description, setDescription] = useState('')
  const [caseType, setCaseType] = useState<CaseType | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  // Fetch case type and required documents
  useEffect(() => {
    const fetchCaseType = async () => {
      try {
        const response = await fetch(`/api/cases/${params.id}/type`)
        if (!response.ok) {
          throw new Error('Failed to fetch case type')
        }
        const data = await response.json()
        setCaseType(data)
      } catch (error) {
        console.error('Error fetching case type:', error)
      }
    }

    if (session?.user) {
      fetchCaseType()
    }
  }, [session, params.id])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    setIsSubmitting(true)

    try {
      // Create form data with the file
      const formData = new FormData()
      formData.append('file', file)

      // Upload file
      const uploadResponse = await fetch('/api/upload-url', {
        method: 'POST',
        body: formData,
      })

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file')
      }

      const { url } = await uploadResponse.json()

      // Create document record
      const documentResponse = await fetch(`/api/cases/${params.id}/documents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: file.name,
          type: documentType,
          description,
          url,
        }),
      })

      if (!documentResponse.ok) {
        throw new Error('Failed to create document record')
      }

      router.push(`/dashboard/cases/${params.id}`)
    } catch (error) {
      console.error('Error uploading document:', error)
      // TODO: Show error message to user
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/dashboard/cases/${params.id}`}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to case</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Upload Document</h1>
          <p className="text-muted-foreground">
            Add a new document to the case
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Document Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Document Type</label>
              <Select
                value={documentType}
                onValueChange={setDocumentType}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  {caseType?.requiredDocuments.map((doc) => (
                    <SelectItem key={doc.id} value={doc.name}>
                      {doc.name}
                      {doc.isRequired && ' (Required)'}
                    </SelectItem>
                  ))}
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">File</label>
              <Input
                type="file"
                onChange={handleFileChange}
                required
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
              <p className="text-xs text-muted-foreground">
                Supported formats: PDF, Word, Images (JPG, PNG)
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter document description"
                className="min-h-[100px]"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            variant="outline"
            asChild
          >
            <Link href={`/dashboard/cases/${params.id}`}>Cancel</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting || !file}>
            {isSubmitting ? (
              <>
                <Upload className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload Document
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
} 