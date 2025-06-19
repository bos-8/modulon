// @file: client/src/store/session.zustand.ts

import { create } from 'zustand'

interface SessionState {
  expiresAt: number | null
  visible: boolean
  countdown: number
  setExpiresAt: (ts: number | null) => void
  setVisible: (v: boolean) => void
  setCountdown: (c: number) => void
  reset: () => void
}

export const useSessionStore = create<SessionState>()((set) => ({
  expiresAt: null,
  visible: false,
  countdown: 0,
  setExpiresAt: (ts) => set({ expiresAt: ts }),
  setVisible: (v) => set({ visible: v }),
  setCountdown: (c) => set({ countdown: c }),
  reset: () => set({ expiresAt: null, visible: false, countdown: 0 }),
}))
