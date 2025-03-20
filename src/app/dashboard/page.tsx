'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import {
  Activity,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Search,
  Settings,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { cn } from '@/lib/utils'

// Temporary mock data - will be replaced with real data later
const stats = [
  {
    name: 'Active Cases',
    value: '12',
    icon: Activity,
    change: '+2',
    changeType: 'increase',
    description: 'Cases currently in progress'
  },
  {
    name: 'Pending Review',
    value: '4',
    icon: Clock,
    change: '-1',
    changeType: 'decrease',
    description: 'Cases awaiting review'
  },
  {
    name: 'Completed Cases',
    value: '128',
    icon: CheckCircle,
    change: '+12',
    changeType: 'increase',
    description: 'Successfully resolved cases'
  },
  {
    name: 'Urgent Cases',
    value: '2',
    icon: AlertCircle,
    change: '+1',
    changeType: 'increase',
    description: 'High priority cases'
  }
]

const recentCases = [
  {
    id: 'CASE-2024-001',
    title: 'Emergency Medical Evacuation',
    status: 'In Progress',
    priority: 'High',
    client: 'John Doe',
    updatedAt: '2 hours ago'
  },
  {
    id: 'CASE-2024-002',
    title: 'Hospital Admission Assistance',
    status: 'Pending',
    priority: 'Medium',
    client: 'Jane Smith',
    updatedAt: '4 hours ago'
  },
  {
    id: 'CASE-2024-003',
    title: 'Insurance Claim Processing',
    status: 'Completed',
    priority: 'Normal',
    client: 'Robert Johnson',
    updatedAt: '1 day ago'
  }
]

const quickActions = [
  {
    title: 'Create New Case',
    icon: Plus,
    href: '/dashboard/cases/new',
    description: 'Start a new medical case'
  },
  {
    title: 'Search Cases',
    icon: Search,
    href: '/dashboard/cases',
    description: 'Find and manage existing cases'
  },
  {
    title: 'Update Profile',
    icon: Settings,
    href: '/dashboard/settings',
    description: 'Manage your account settings'
  }
]

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {session?.user?.name}</h1>
        <p className="text-muted-foreground">
          Here's an overview of your medical case management system
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.name}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.name}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
                <div className={cn(
                  "text-xs font-medium mt-1",
                  stat.changeType === 'increase' ? "text-green-600" : "text-red-600"
                )}>
                  {stat.change} from last month
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {quickActions.map((action) => {
          const Icon = action.icon
          return (
            <Card key={action.title} className="hover:bg-muted/50 transition-colors">
              <Link href={action.href}>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5" />
                    <CardTitle className="text-lg">{action.title}</CardTitle>
                  </div>
                  <CardDescription>{action.description}</CardDescription>
                </CardHeader>
              </Link>
            </Card>
          )
        })}
      </div>

      {/* Recent Cases */}
      <div>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Cases</CardTitle>
                <CardDescription>Latest updates from your active cases</CardDescription>
              </div>
              <Button asChild>
                <Link href="/dashboard/cases">View All Cases</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentCases.map((case_) => (
                <div
                  key={case_.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{case_.title}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{case_.id}</span>
                      <span>•</span>
                      <span>{case_.client}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end">
                      <span className={cn(
                        "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
                        case_.status === 'In Progress' && "bg-blue-100 text-blue-700",
                        case_.status === 'Pending' && "bg-yellow-100 text-yellow-700",
                        case_.status === 'Completed' && "bg-green-100 text-green-700"
                      )}>
                        {case_.status}
                      </span>
                      <span className="text-xs text-muted-foreground mt-1">
                        {case_.updatedAt}
                      </span>
                    </div>
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/dashboard/cases/${case_.id}`}>
                        <FileText className="h-4 w-4" />
                        <span className="sr-only">View case details</span>
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 