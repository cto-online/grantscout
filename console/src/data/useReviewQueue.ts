import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  collection,
  doc,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import { qk } from './keys'
import { toReviewItem } from './converters'
import { useLiveCollection } from './useLive'

/**
 * Live pending review queue. Filtered to `status == 'pending'` (single-field
 * index, no composite needed) and sorted newest-first client-side.
 */
export function useLiveReviewQueue() {
  return useLiveCollection(
    () => query(collection(db, 'reviewQueue'), where('status', '==', 'pending')),
    toReviewItem,
    (items) =>
      [...items].sort(
        (a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0),
      ),
  )
}

type Decision = 'approved' | 'rejected'

/**
 * Approve/reject a review item. The live query removes it from the list as soon
 * as the write lands, so no optimistic cache surgery is needed here.
 */
export function useReviewDecision() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, decision }: { id: string; decision: Decision }) => {
      await updateDoc(doc(db, 'reviewQueue', id), {
        status: decision,
        reviewedBy: auth.currentUser?.email ?? 'unknown',
        reviewedAt: serverTimestamp(),
      })
    },
    onSettled: () => qc.invalidateQueries({ queryKey: qk.overview.all }),
  })
}
