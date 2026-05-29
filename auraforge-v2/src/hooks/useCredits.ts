'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { FREE_DAILY_CREDITS } from '@/lib/constants'

export interface CreditsState {
  used:       number
  limit:      number
  remaining:  number
  isPremium:  boolean
  loading:    boolean
}

// ── NEW REQ 1: Real-time credit hook ─────────────────────────
// Reads live from Supabase so UI always reflects actual state
export function useCredits(userId?: string) {
  const [state, setState] = useState<CreditsState>({
    used: 0, limit: FREE_DAILY_CREDITS, remaining: FREE_DAILY_CREDITS,
    isPremium: false, loading: true,
  })

  const supabase = createClient()

  const refresh = useCallback(async () => {
    if (!userId) {
      setState(s => ({ ...s, loading: false }))
      return
    }
    const { data } = await supabase
      .from('users')
      .select('credits_used, credits_limit, is_premium')
      .eq('id', userId)
      .single()

    if (data) {
      const used      = data.credits_used  ?? 0
      const limit     = data.is_premium ? Infinity : (data.credits_limit ?? FREE_DAILY_CREDITS)
      const remaining = data.is_premium ? Infinity : Math.max(0, limit - used)
      setState({ used, limit, remaining, isPremium: data.is_premium, loading: false })
    } else {
      setState(s => ({ ...s, loading: false }))
    }
  }, [userId, supabase])

  useEffect(() => { refresh() }, [refresh])

  // Subscribe to realtime changes so badge updates instantly after generation
  useEffect(() => {
    if (!userId) return
    const channel = supabase
      .channel(`credits:${userId}`)
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'users',
        filter: `id=eq.${userId}`,
      }, payload => {
        const d = payload.new as { credits_used: number; credits_limit: number; is_premium: boolean }
        const used      = d.credits_used ?? 0
        const limit     = d.is_premium ? Infinity : (d.credits_limit ?? FREE_DAILY_CREDITS)
        const remaining = d.is_premium ? Infinity : Math.max(0, limit - used)
        setState({ used, limit, remaining, isPremium: d.is_premium, loading: false })
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [userId, supabase])

  return { ...state, refresh }
}
