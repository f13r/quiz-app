import { useEffect } from 'react'

export function useWakeLock() {
  useEffect(() => {
    if (!navigator.wakeLock) return

    let sentinel: WakeLockSentinel | null = null

    async function acquire() {
      try {
        sentinel = await navigator.wakeLock.request('screen')
      } catch {
        // device denied or API unavailable — silently ignore
      }
    }

    function onVisibilityChange() {
      if (document.visibilityState === 'visible') acquire()
    }

    acquire()
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange)
      sentinel?.release()
    }
  }, [])
}
