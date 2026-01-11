import { useCallback } from 'react'
import { useRouter } from 'next/router'

/**
 * Next.js router adapter to match our existing `onNavigate(pathOrDelta)` contract.
 * - string => router.push(path)
 * - number => history back/forward
 */
export function useNextNavigation() {
  const router = useRouter()

  const navigate = useCallback(
    (pathOrDelta) => {
      if (typeof pathOrDelta === 'number') {
        if (typeof window !== 'undefined') {
          window.history.go(pathOrDelta)
        }
        return
      }

      // Keep behavior consistent with prior SPA navigation
      router.push(pathOrDelta)
    },
    [router],
  )

  return { navigate }
}


