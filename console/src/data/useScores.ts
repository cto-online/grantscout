import { useQuery } from '@tanstack/react-query'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { qk } from './keys'
import { toAccountScore, toOrganization } from './converters'
import type { AccountScore } from './types'

export function useScores() {
  return useQuery({
    queryKey: qk.scores.all,
    queryFn: async (): Promise<AccountScore[]> => {
      const [scoreSnap, orgSnap] = await Promise.all([
        getDocs(collection(db, 'accountScores')),
        getDocs(collection(db, 'organizations')),
      ])
      const nameById = new Map(
        orgSnap.docs.map((d) => {
          const org = toOrganization(d.id, d.data())
          return [org.canonicalId, org.names[0] ?? org.canonicalId]
        }),
      )
      return scoreSnap.docs
        .map((d) => {
          const score = toAccountScore(d.id, d.data())
          return { ...score, orgName: nameById.get(score.orgId) ?? score.orgId }
        })
        .sort((a, b) => b.score - a.score)
    },
  })
}
