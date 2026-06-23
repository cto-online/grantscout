import { useState } from 'react'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import { AlertCircle } from 'lucide-react'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const auth = getAuth()
      await signInWithEmailAndPassword(auth, email, password)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to sign in'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas">
      <div className="w-full max-w-md rounded-lg border border-hair bg-surface-primary p-8 shadow-sm">
        <h1 className="mb-2 text-2xl font-bold text-text-primary">
          GrantScout Admin
        </h1>
        <p className="mb-6 text-sm text-text-secondary">
          Sign in to manage your grant discovery pipeline
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text-primary">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded border border-hair bg-surface-secondary px-3 py-2 text-sm text-text-primary placeholder-text-tertiary focus:border-accent focus:outline-none"
              placeholder="you@example.com"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-text-primary">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded border border-hair bg-surface-secondary px-3 py-2 text-sm text-text-primary placeholder-text-tertiary focus:border-accent focus:outline-none"
              placeholder="••••••••"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded bg-error/10 p-3 text-sm text-error">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-accent px-4 py-2 font-medium text-text-inverted hover:bg-accent-dark disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
