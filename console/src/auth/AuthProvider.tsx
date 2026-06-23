import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react'
import {
  initializeApp,
  getApps,
} from 'firebase/app'
import {
  getAuth,
  onAuthStateChanged,
  signOut,
  User as FirebaseUser,
} from 'firebase/auth'
import type { User } from '@/types'

interface AuthContextType {
  user: User | null
  loading: boolean
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const firebaseConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    }

    if (!getApps().length) {
      initializeApp(firebaseConfig)
    }

    const auth = getAuth()
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        setUser({
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || undefined,
          photoURL: firebaseUser.photoURL || undefined,
        })
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const logout = async () => {
    const auth = getAuth()
    await signOut(auth)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
