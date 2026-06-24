import { useEffect, useState } from 'react'
import { onSnapshot, type Query, type DocumentData } from 'firebase/firestore'

export interface LiveState<T> {
  data: T[] | undefined
  isLoading: boolean
  isError: boolean
  error: unknown
  retry: () => void
}

/**
 * Subscribe to a Firestore query in real time. Returns a React-Query-shaped
 * state object so screens can swap a `useQuery` hook for a live one with no
 * other changes. `build`/`map` are expected to be stable per screen.
 */
export function useLiveCollection<T>(
  build: () => Query<DocumentData>,
  map: (id: string, data: DocumentData) => T,
  postProcess?: (items: T[]) => T[],
): LiveState<T> {
  const [data, setData] = useState<T[] | undefined>(undefined)
  const [error, setError] = useState<unknown>(null)
  const [nonce, setNonce] = useState(0)

  useEffect(() => {
    setData(undefined)
    setError(null)
    const unsub = onSnapshot(
      build(),
      (snap) => {
        const items = snap.docs.map((d) => map(d.id, d.data()))
        setData(postProcess ? postProcess(items) : items)
      },
      (err) => setError(err),
    )
    return unsub
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nonce])

  return {
    data,
    isLoading: data === undefined && !error,
    isError: !!error,
    error,
    retry: () => setNonce((n) => n + 1),
  }
}
