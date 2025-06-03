// @file: apps/client/src/components/ui/SessionExpiryPopup.tsx

'use client'

import { useEffect, useState } from 'react'

type Props = {
  expiresAt: number
  onExtend: () => void
  onLogout: () => void
}

export const SessionExpiryPopup = ({ expiresAt, onExtend, onLogout }: Props) => {
  const [visible, setVisible] = useState(false)
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    const now = Date.now()
    const diff = expiresAt - now
    const showAt = diff - 5 * 60_000 // 5 minut przed końcem

    if (showAt <= 0) {
      setVisible(true)
    } else {
      const timeout = setTimeout(() => setVisible(true), showAt)
      return () => clearTimeout(timeout)
    }
  }, [expiresAt])

  useEffect(() => {
    if (!visible) return

    const interval = setInterval(() => {
      const secondsLeft = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000))
      setCountdown(secondsLeft)
    }, 1000)

    return () => clearInterval(interval)
  }, [visible, expiresAt])

  if (!visible) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 bg-white dark:bg-gray-800 shadow-lg border border-gray-300 dark:border-gray-700 p-4 rounded-xl w-80">
      <p className="text-sm text-gray-800 dark:text-white mb-2">
        Twoja sesja wygaśnie za <strong>{Math.floor(countdown / 60)}m {countdown % 60}s</strong>
      </p>
      <div className="flex justify-end gap-2">
        <button
          onClick={onLogout}
          className="text-sm px-3 py-1 rounded bg-red-100 hover:bg-red-200 text-red-800 dark:bg-red-900 dark:text-red-100"
        >
          Wyloguj
        </button>
        <button
          onClick={() => {
            setVisible(false)
            onExtend()
          }}
          className="text-sm px-3 py-1 rounded bg-green-600 hover:bg-green-700 text-white"
        >
          Przedłuż sesję
        </button>
      </div>
    </div>
  )
}
// EOF
