import { create } from 'zustand'
import type { AuthUser, AuthStatus } from '@shared/types'
import * as authApi from '@shared/api'

interface AuthState {
  user: AuthUser | null
  status: AuthStatus
  initialize: () => () => void
  signInWithEmail: (email: string, password: string) => Promise<{ error: string | null }>
  signUpWithEmail: (email: string, password: string) => Promise<{ error: string | null }>
  signInWithGoogle: () => Promise<{ error: string | null }>
  resetPassword: (email: string) => Promise<{ error: string | null }>
  updatePassword: (newPassword: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  status: 'idle',

  initialize: () => {
    return authApi.subscribeToAuthChanges(
      (user) => set({ user, status: 'authenticated' }),
      () => set({ user: null, status: 'unauthenticated' }),
    )
  },

  signInWithEmail: async (email, password) => {
    set({ status: 'loading' })
    const result = await authApi.signInWithEmail(email, password)
    if (result.error) {
      set({ status: 'unauthenticated' })
    }
    return result
  },

  signUpWithEmail: async (email, password) => {
    set({ status: 'loading' })
    const result = await authApi.signUpWithEmail(email, password)
    if (result.error) {
      set({ status: 'unauthenticated' })
    }
    return result
  },

  signInWithGoogle: async () => {
    return authApi.signInWithGoogle()
  },

  resetPassword: async (email) => {
    return authApi.resetPassword(email)
  },

  updatePassword: async (newPassword) => {
    return authApi.updatePassword(newPassword)
  },

  signOut: async () => {
    await authApi.signOut()
    set({ user: null, status: 'unauthenticated' })
  },
}))

export const useUser = () => useAuthStore((s) => s.user)
export const useAuthStatus = () => useAuthStore((s) => s.status)
export const useIsAuthenticated = () => useAuthStore((s) => s.status === 'authenticated')
