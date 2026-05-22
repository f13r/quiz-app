import { useEffect } from 'react'
import NoSleep from 'nosleep.js'

export function useWakeLock() {
  useEffect(() => {
    // Screen Wake Lock API — works only on HTTPS
    if (navigator.wakeLock) {
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
    }

    // Fallback: tiny looping video trick (works over HTTP).
    // iOS requires the play() call to happen inside a user gesture.
    const noSleep = new NoSleep()
    function enable() { noSleep.enable() }
    document.addEventListener('touchstart', enable, { once: true })
    document.addEventListener('click', enable, { once: true })

    return () => {
      document.removeEventListener('touchstart', enable)
      document.removeEventListener('click', enable)
      noSleep.disable()
    }
  }, [])
}
