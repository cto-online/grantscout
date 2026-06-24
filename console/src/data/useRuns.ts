import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  addDoc,
  collection,
  doc,
  getDoc,
  orderBy,
  query,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { qk } from './keys'
import { toRun } from './converters'
import type { Run } from './types'
import { useLiveCollection } from './useLive'

/** Live list of pipeline runs (real-time via Firestore onSnapshot). */
export function useLiveRuns() {
  return useLiveCollection(
    () => query(collection(db, 'syncLogs'), orderBy('timestamp', 'desc')),
    toRun,
  )
}

export function useRun(id: string) {
  return useQuery({
    queryKey: qk.runs.detail(id),
    queryFn: async (): Promise<Run | null> => {
      const snap = await getDoc(doc(db, 'syncLogs', id))
      return snap.exists() ? toRun(snap.id, snap.data()) : null
    },
  })
}

/** Enqueue a manual run; the backend pipeline picks up `queued` syncLogs. */
export function useTriggerRun() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (sourceId: string) => {
      await addDoc(collection(db, 'syncLogs'), {
        sourceId,
        timestamp: new Date().toISOString(),
        status: 'queued',
        orgsIngested: 0,
        signalsIngested: 0,
      })
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.runs.all }),
  })
}
