import { useQuery } from '@tanstack/react-query'
import {
  collection,
  getCountFromServer,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { qk } from './keys'
import { toRun } from './converters'
import type { Run } from './types'

export interface OverviewData {
  totalRuns: number
  activeSources: number
  pendingReview: number
  organizations: number
  recentRuns: Run[]
}

export function useOverview() {
  return useQuery({
    queryKey: qk.overview.all,
    queryFn: async (): Promise<OverviewData> => {
      const [runsCount, sourcesCount, reviewCount, orgsCount, recentSnap] =
        await Promise.all([
          getCountFromServer(collection(db, 'syncLogs')),
          getCountFromServer(
            query(collection(db, 'sources'), where('enabled', '==', true)),
          ),
          getCountFromServer(
            query(collection(db, 'reviewQueue'), where('status', '==', 'pending')),
          ),
          getCountFromServer(collection(db, 'organizations')),
          getDocs(
            query(
              collection(db, 'syncLogs'),
              orderBy('timestamp', 'desc'),
              limit(5),
            ),
          ),
        ])
      return {
        totalRuns: runsCount.data().count,
        activeSources: sourcesCount.data().count,
        pendingReview: reviewCount.data().count,
        organizations: orgsCount.data().count,
        recentRuns: recentSnap.docs.map((d) => toRun(d.id, d.data())),
      }
    },
  })
}
