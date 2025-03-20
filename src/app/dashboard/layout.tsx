'use client'

import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { UserNav } from '@/components/user-nav'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  FileText,
  Users,
  Building2,
  Settings,
  HelpCircle,
  Menu,
} from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    allowedRoles: ['ADMIN', 'EMPLOYEE', 'CLIENT'],
  },
  {
    name: 'Cases',
    href: '/dashboard/cases',
    icon: FileText,
    allowedRoles: ['ADMIN', 'EMPLOYEE', 'CLIENT'],
  },
  {
    name: 'Providers',
    href: '/dashboard/providers',
    icon: Building2,
    allowedRoles: ['ADMIN', 'EMPLOYEE'],
  },
  {
    name: 'Users',
    href: '/dashboard/users',
    icon: Users,
    allowedRoles: ['ADMIN'],
  },
  {
    name: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
    allowedRoles: ['ADMIN', 'EMPLOYEE', 'CLIENT'],
  },
  {
    name: 'Help',
    href: '/dashboard/help',
    icon: HelpCircle,
    allowedRoles: ['ADMIN', 'EMPLOYEE', 'CLIENT'],
  },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session } = useSession()
  const pathname = usePathname()

  const filteredNavigation = navigation.filter((item) =>
    item.allowedRoles.includes(session?.user?.role as string)
  )

  const NavigationItems = () => (
    <nav className="flex-1 space-y-1 px-2 py-4">
      {filteredNavigation.map((item) => {
        const Icon = item.icon
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              pathname === item.href
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
              'group flex items-center rounded-md px-2 py-2 text-sm font-medium'
            )}
          >
            <Icon
              className={cn(
                pathname === item.href
                  ? 'text-gray-500'
                  : 'text-gray-400 group-hover:text-gray-500',
                'mr-3 h-5 w-5 flex-shrink-0'
              )}
            />
            {item.name}
          </Link>
        )
      })}
    </nav>
  )

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Desktop Sidebar */}
      <div className="hidden w-64 bg-white md:flex md:flex-col">
        <div className="flex h-16 items-center justify-center border-b px-4">
          <Link href="/dashboard" className="flex items-center">
            <span className="text-xl font-bold">GMCA2</span>
          </Link>
        </div>
        <div className="flex flex-1 flex-col overflow-y-auto">
          <NavigationItems />
        </div>
      </div>

      {/* Mobile Navigation */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            className="md:hidden"
          >
            <Menu className="h-6 w-6" />
            <span className="sr-only">Open navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex h-16 items-center justify-center border-b px-4">
            <Link href="/dashboard" className="flex items-center">
              <span className="text-xl font-bold">GMCA2</span>
            </Link>
          </div>
          <div className="flex flex-1 flex-col overflow-y-auto">
            <NavigationItems />
          </div>
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-y-auto">
        <header className="w-full border-b bg-white">
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Open navigation menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0">
                  <div className="flex h-16 items-center justify-center border-b px-4">
                    <Link href="/dashboard" className="flex items-center">
                      <span className="text-xl font-bold">GMCA2</span>
                    </Link>
                  </div>
                  <div className="flex flex-1 flex-col overflow-y-auto">
                    <NavigationItems />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            <div className="flex flex-1 justify-end">
              <UserNav />
            </div>
          </div>
        </header>

        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
} 