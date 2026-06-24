import { useQuery } from '@tanstack/react-query'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { qk } from './keys'
import { toGrantOpportunity } from './converters'
import type { GrantOpportunity } from './types'

const STATUS_ORDER: Record<string, number> = {
  active: 0,
  upcoming: 1,
  closed: 2,
  archived: 3,
}

export function useOpportunities() {
  return useQuery({
    queryKey: qk.opportunities.all,
    queryFn: async (): Promise<GrantOpportunity[]> => {
      const snap = await getDocs(collection(db, 'grants'))
      return snap.docs
        .map((d) => toGrantOpportunity(d.id, d.data()))
        .sort((a, b) => {
          const s = (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9)
          if (s !== 0) return s
          return (a.dateClose?.getTime() ?? Infinity) - (b.dateClose?.getTime() ?? Infinity)
        })
    },
  })
}
