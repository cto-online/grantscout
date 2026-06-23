import { useState } from 'react'
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
} from 'firebase/auth'
import { AlertCircle, TerminalSquare } from 'lucide-react'
import { auth, usingEmulator } from '@/lib/firebase'

const provider = new GoogleAuthProvider()

export function LoginPage() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const run = async (fn: () => Promise<unknown>) => {
    setError('')
    setLoading(true)
    try {
      await fn()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = () => run(() => signInWithPopup(auth, provider))
  const handleDevSignIn = () =>
    run(() => signInWithEmailAndPassword(auth, 'dev@grantmaster.nl', 'devpass123'))

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas">
      <div className="w-full max-w-md rounded-lg border border-hair bg-panel p-8 shadow-sm">
        <h1 className="mb-2 text-2xl font-bold text-fg">GrantScout Admin</h1>
        <p className="mb-8 text-sm text-muted">
          Sign in to manage your grant discovery pipeline
        </p>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded bg-danger/10 p-3 text-sm text-danger">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="flex w-full items-center justify-center gap-3 rounded border border-hair bg-card px-4 py-3 text-sm font-medium text-fg hover:bg-card/80 disabled:opacity-50"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          {loading ? 'Signing in…' : 'Sign in with Google'}
        </button>

        {usingEmulator && (
          <>
            <div className="my-4 flex items-center gap-3 text-xs text-faint">
              <span className="h-px flex-1 bg-hair" />
              local development
              <span className="h-px flex-1 bg-hair" />
            </div>
            <button
              onClick={handleDevSignIn}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded border border-accent/40 bg-accent-soft px-4 py-3 text-sm font-medium text-accent hover:bg-accent-soft/70 disabled:opacity-50"
            >
              <TerminalSquare className="h-4 w-4" />
              Dev sign-in (emulator)
            </button>
            <p className="mt-2 text-center text-xs text-faint">
              Connected to the Firebase emulator
            </p>
          </>
        )}
      </div>
    </div>
  )
}
