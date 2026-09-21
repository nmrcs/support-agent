import type { AuthUser } from '@support-agent/contracts'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SessionState {
	user: AuthUser | null
	accessToken: string | null
	setAuth: (user: AuthUser, accessToken: string) => void
	clearAuth: () => void
}

export const useSession = create<SessionState>()(
	persist(
		(set) => ({
			user: null,
			accessToken: null,
			setAuth: (user, accessToken) => set({ user, accessToken }),
			clearAuth: () => set({ user: null, accessToken: null }),
		}),
		{ name: 'support-agent-session' },
	),
)
