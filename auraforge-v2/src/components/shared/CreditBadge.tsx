'use client'

import Link from 'next/link'
import { Zap, Crown, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCredits } from '@/hooks/useCredits'
import { FREE_DAILY_CREDITS } from '@/lib/constants'

interface Props {
  userId?: string
  className?: string
  showEarn?: boolean
  onEarnClick?: () => void
}

// ── NEW REQ 1: Live credit badge ─────────────────────────────
// Shows real remaining credits from DB, updates instantly
export function CreditBadge({ userId, className, showEarn, onEarnClick }: Props) {
  const { remaining, used, limit, isPremium, loading } = useCredits(userId)

  if (loading) {
    return <div className={cn('w-24 h-9 rounded-xl bg-border animate-pulse', className)} />
  }

  if (isPremium) {
    return (
      <div className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-semibold', className)}>
        <Crown className="w-3.5 h-3.5" /> Unlimited
      </div>
    )
  }

  const pct     = Math.min(100, (used / FREE_DAILY_CREDITS) * 100)
  const isLow   = remaining <= 3 && remaining > 0
  const isEmpty = remaining === 0

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <div className="flex items-center gap-2">
        <Link href="/pricing">
          <div className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer',
            isEmpty  ? 'bg-red-500/10 border-red-500/20 text-red-400'
            : isLow  ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
            : 'bg-primary/10 border-primary/20 text-primary',
          )}>
            <Zap className="w-3.5 h-3.5" />
            {remaining === Infinity ? '∞' : remaining} / {FREE_DAILY_CREDITS} credits
          </div>
        </Link>
        {showEarn && onEarnClick && !isPremium && (
          <button
            onClick={onEarnClick}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/20 transition-colors"
            title="Earn more credits"
          >
            <RefreshCw className="w-3 h-3" /> +credits
          </button>
        )}
      </div>
      {/* Progress bar */}
      <div className="h-1 bg-border rounded-full overflow-hidden w-full">
        <div
          className={cn('h-full rounded-full transition-all duration-500',
            isEmpty ? 'bg-red-500' : isLow ? 'bg-yellow-500' : 'bg-primary')}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
