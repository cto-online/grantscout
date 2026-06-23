/**
 * Central React Query key factory. Keeps cache keys consistent across hooks
 * and makes targeted invalidation straightforward.
 */
export const qk = {
  runs: {
    all: ['runs'] as const,
    detail: (id: string) => ['runs', id] as const,
  },
  sources: {
    all: ['sources'] as const,
  },
  grants: {
    all: ['grants'] as const,
    detail: (id: string) => ['grants', id] as const,
  },
  scores: {
    all: ['scores'] as const,
  },
  review: {
    all: ['review'] as const,
  },
  settings: {
    all: ['settings'] as const,
  },
  overview: {
    all: ['overview'] as const,
  },
}
