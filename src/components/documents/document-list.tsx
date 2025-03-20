import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { formatDistanceToNow } from 'date-fns'
import { Download, Eye, FileText, Plus } from 'lucide-react'
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

interface DocumentListProps {
  caseId: string
  documents: Document[]
}

export function DocumentList({ caseId, documents }: DocumentListProps) {
  const isPreviewable = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase()
    return ['jpg', 'jpeg', 'png', 'pdf'].includes(extension || '')
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Documents</CardTitle>
            <CardDescription>
              Case-related documents and files
            </CardDescription>
          </div>
          <Button asChild>
            <Link href={`/dashboard/cases/${caseId}/documents/new`}>
              <Plus className="mr-2 h-4 w-4" />
              Add Document
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <FileText className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">No documents yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Upload documents related to this case
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-start justify-between rounded-lg border p-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <h4 className="font-medium">{doc.name}</h4>
                  </div>
                  {doc.description && (
                    <p className="text-sm text-muted-foreground">
                      {doc.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Uploaded by {doc.uploadedBy.name}</span>
                    <span>•</span>
                    <span>
                      {formatDistanceToNow(new Date(doc.uploadedAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    asChild
                  >
                    <a href={doc.url} download={doc.name}>
                      <Download className="h-4 w-4" />
                      <span className="sr-only">Download {doc.name}</span>
                    </a>
                  </Button>
                  {isPreviewable(doc.name) && (
                    <Button
                      variant="outline"
                      size="icon"
                      asChild
                    >
                      <Link
                        href={`/dashboard/cases/${caseId}/documents/${doc.id}`}
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">Preview {doc.name}</span>
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
} 