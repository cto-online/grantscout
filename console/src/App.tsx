import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/auth/AuthProvider'
import { LoginPage } from '@/auth/LoginPage'
import { AppShell } from '@/app/AppShell'
import { Overview } from '@/screens/Overview'
import { PipelineRuns } from '@/screens/PipelineRuns'
import { Sources } from '@/screens/Sources'
import { ExtractedGrants } from '@/screens/ExtractedGrants'
import { ReviewQueue } from '@/screens/ReviewQueue'
import { ScoringResults } from '@/screens/ScoringResults'
import { Settings } from '@/screens/Settings'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
})

function Splash() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas">
      <div className="flex items-center gap-3 text-muted">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-hair-strong border-t-accent" />
        <span className="text-sm">Loading…</span>
      </div>
    </div>
  )
}

export function AuthGate() {
  const { user, loading } = useAuth()

  if (loading) return <Splash />
  if (!user) return <LoginPage />

  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Overview />} />
        <Route path="runs" element={<PipelineRuns />} />
        <Route path="sources" element={<Sources />} />
        <Route path="grants" element={<ExtractedGrants />} />
        <Route path="review" element={<ReviewQueue />} />
        <Route path="scoring" element={<ScoringResults />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <AuthGate />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}
