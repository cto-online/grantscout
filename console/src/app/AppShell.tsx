import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/auth/AuthProvider'
import {
  BarChart3,
  Settings,
  LogOut,
  Database,
  Play,
  CheckSquare,
  Zap,
  BookOpen,
} from 'lucide-react'

export function AppShell() {
  const { user, logout } = useAuth()
  const location = useLocation()

  const navItems = [
    {
      label: 'Overview',
      path: '/',
      icon: BarChart3,
    },
    {
      label: 'Pipeline Runs',
      path: '/runs',
      icon: Play,
    },
    {
      label: 'Sources',
      path: '/sources',
      icon: Database,
    },
    {
      label: 'Extracted Grants',
      path: '/grants',
      icon: BookOpen,
    },
    {
      label: 'Review Queue',
      path: '/review',
      icon: CheckSquare,
    },
    {
      label: 'Scoring Results',
      path: '/scoring',
      icon: Zap,
    },
    {
      label: 'Settings',
      path: '/settings',
      icon: Settings,
    },
  ]

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <div className="flex h-screen bg-canvas">
      {/* Sidebar */}
      <nav className="w-64 border-r border-hair bg-surface-primary">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 border-b border-hair">
            <h1 className="text-lg font-bold text-accent">GrantScout</h1>
            <p className="text-xs text-text-tertiary">Admin Console</p>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item.path)
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`flex items-center gap-3 rounded px-3 py-2 text-sm transition-colors ${
                        active
                          ? 'bg-accent/10 text-accent font-medium'
                          : 'text-text-secondary hover:bg-surface-secondary'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* User Section */}
          <div className="border-t border-hair p-4">
            <div className="mb-3">
              <p className="text-xs font-medium text-text-secondary">
                Signed in as
              </p>
              <p className="text-sm font-medium text-text-primary truncate">
                {user?.email}
              </p>
            </div>
            <button
              onClick={() => logout()}
              className="w-full flex items-center justify-center gap-2 rounded bg-surface-secondary px-3 py-2 text-sm text-text-secondary hover:bg-hair transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
