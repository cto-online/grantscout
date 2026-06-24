import { useQuery } from '@tanstack/react-query'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { qk } from './keys'
import { toOrganization, toAccountScore, toSignalSummary } from './converters'
import type { Organization, AccountScore, SignalSummary } from './types'

export function useOrganizations() {
  return useQuery({
    queryKey: qk.organizations.all,
    queryFn: async (): Promise<Organization[]> => {
      const snap = await getDocs(collection(db, 'organizations'))
      return snap.docs
        .map((d) => toOrganization(d.id, d.data()))
        .sort((a, b) => (a.names[0] ?? '').localeCompare(b.names[0] ?? ''))
    },
  })
}

export interface OrgDetail {
  org: Organization | null
  score: AccountScore | null
  signals: SignalSummary[]
}

export function useOrganizationDetail(id: string) {
  return useQuery({
    queryKey: qk.organizations.detail(id),
    queryFn: async (): Promise<OrgDetail> => {
      const [orgSnap, scoreSnap, sigSnap] = await Promise.all([
        getDoc(doc(db, 'organizations', id)),
        getDoc(doc(db, 'accountScores', id)),
        getDocs(query(collection(db, 'signals'), where('orgId', '==', id))),
      ])
      return {
        org: orgSnap.exists() ? toOrganization(orgSnap.id, orgSnap.data()) : null,
        score: scoreSnap.exists() ? toAccountScore(scoreSnap.id, scoreSnap.data()) : null,
        signals: sigSnap.docs.map((d) => toSignalSummary(d.id, d.data())),
      }
    },
  })
}
