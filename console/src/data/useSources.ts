import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { collection, doc, getDocs, setDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { qk } from './keys'
import { toSource } from './converters'
import type { Source } from './types'

export function useSources() {
  return useQuery({
    queryKey: qk.sources.all,
    queryFn: async (): Promise<Source[]> => {
      const snap = await getDocs(collection(db, 'sources'))
      return snap.docs
        .map((d) => toSource(d.id, d.data()))
        .sort((a, b) => a.name.localeCompare(b.name))
    },
  })
}

export function useToggleSource() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      await updateDoc(doc(db, 'sources', id), { enabled })
    },
    onMutate: async ({ id, enabled }) => {
      await qc.cancelQueries({ queryKey: qk.sources.all })
      const prev = qc.getQueryData<Source[]>(qk.sources.all)
      qc.setQueryData<Source[]>(qk.sources.all, (old = []) =>
        old.map((s) => (s.id === id ? { ...s, enabled } : s)),
      )
      return { prev }
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(qk.sources.all, ctx.prev)
    },
    onSettled: () => qc.invalidateQueries({ queryKey: qk.sources.all }),
  })
}

/** Create or update a source document (used by the edit / add modals). */
export function useSaveSource() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (source: Source) => {
      const { id, ...rest } = source
      await setDoc(doc(db, 'sources', id), rest, { merge: true })
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.sources.all }),
  })
}
