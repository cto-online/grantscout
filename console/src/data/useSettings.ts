import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import { qk } from './keys'
import { toSettings } from './converters'
import type { ConsoleSettings } from './types'

export function useSettings() {
  return useQuery({
    queryKey: qk.settings.all,
    queryFn: async (): Promise<ConsoleSettings> => {
      const snap = await getDoc(doc(db, 'settings', 'console'))
      return toSettings(snap.exists() ? snap.data() : undefined)
    },
  })
}

export function useSaveSettings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (settings: ConsoleSettings) => {
      await setDoc(
        doc(db, 'settings', 'console'),
        {
          autoRunEnabled: settings.autoRunEnabled,
          emailOnFailure: settings.emailOnFailure,
          debugLogging: settings.debugLogging,
          minRelevanceScore: settings.minRelevanceScore,
          minFitScore: settings.minFitScore,
          updatedAt: serverTimestamp(),
          updatedBy: auth.currentUser?.email ?? 'unknown',
        },
        { merge: true },
      )
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.settings.all }),
  })
}
