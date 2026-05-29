'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { LayoutDashboard, History, Star, Settings, Crown, Zap, TrendingUp, LogOut, ChevronRight, Sparkles, Gift, Copy, Check } from 'lucide-react'
import { cn, timeAgo, formatNumber } from '@/lib/utils'
import { FREE_DAILY_CREDITS, TOOL_META, REFERRAL_BONUS } from '@/lib/constants'
import type { User, Generation } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { useCredits } from '@/hooks/useCredits'
import { EarnCreditsModal } from '@/components/shared/EarnCreditsModal'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

interface Props {
  profile: User | null
  recentGenerations: Generation[]
}

const NAV = [
  { id: 'overview',  label: 'Overview',  icon: LayoutDashboard },
  { id: 'history',   label: 'History',   icon: History          },
  { id: 'referrals', label: 'Referrals', icon: Gift             },
  { id: 'settings',  label: 'Settings',  icon: Settings         },
]

export function DashboardContent({ profile, recentGenerations }: Props) {
  const [tab, setTab]               = useState('overview')
  const [earnOpen, setEarnOpen]     = useState(false)
  const [referralLink, setReferralLink] = useState('')
  const router   = useRouter()
  const supabase = createClient()
  const { remaining, used, isPremium, loading: credLoading } = useCredits(profile?.id)

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin
    setReferralLink(`${base}/signup?ref=${profile?.referral_code ?? ''}`)
  }, [profile?.referral_code])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex flex-col lg:flex-row gap-8">

        {/* ── Sidebar ───────────────────────────────────────── */}
        <aside className="lg:w-64 flex-shrink-0">
          <div className="glass border border-white/5 rounded-2xl p-5 sticky top-24">
            {/* User info */}
            <div className="flex items-center gap-3 mb-5 pb-5 border-b border-border">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                {(profile?.full_name ?? profile?.email ?? 'U').charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-sm truncate">{profile?.full_name ?? 'User'}</div>
                <div className="text-xs text-muted-foreground truncate">{profile?.email}</div>
              </div>
            </div>

            {/* Live credits widget */}
            <div className="mb-5 p-3.5 rounded-xl bg-primary/5 border border-primary/10 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold">Daily Credits</span>
                <span className="font-bold text-primary">
                  {credLoading ? '…' : isPremium ? '∞' : `${used}/${FREE_DAILY_CREDITS}`}
                </span>
              </div>
              {!isPremium && !credLoading && (
                <div className="h-1.5 bg-border rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (used / FREE_DAILY_CREDITS) * 100)}%` }} />
                </div>
              )}
              <div className="flex gap-2 pt-0.5">
                {!isPremium && (
                  <button onClick={() => setEarnOpen(true)}
                    className="flex-1 text-xs py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 font-semibold hover:bg-emerald-500/20 transition-colors border border-emerald-500/20">
                    + Earn Credits
                  </button>
                )}
                {!isPremium && (
                  <Link href="/pricing" className="flex-1 text-center text-xs py-1.5 rounded-lg bg-primary/10 text-primary font-semibold hover:bg-primary/20 transition-colors border border-primary/20">
                    Upgrade
                  </Link>
                )}
                {isPremium && (
                  <div className="flex items-center gap-1.5 text-xs text-yellow-400 font-semibold">
                    <Crown className="w-3.5 h-3.5" /> Pro — Unlimited
                  </div>
                )}
              </div>
            </div>

            {/* Nav */}
            <nav className="space-y-1">
              {NAV.map(item => (
                <button key={item.id} onClick={() => setTab(item.id)}
                  className={cn('w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                    tab === item.id ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-card hover:text-foreground')}>
                  <item.icon className="w-4 h-4" />
                  {item.label}
                  {item.id === 'referrals' && (profile?.referral_count ?? 0) > 0 && (
                    <span className="ml-auto text-xs bg-primary text-white px-1.5 py-0.5 rounded-full">
                      {profile?.referral_count}
                    </span>
                  )}
                </button>
              ))}
              <button onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </nav>
          </div>
        </aside>

        {/* ── Main ──────────────────────────────────────────── */}
        <main className="flex-1 min-w-0">
          {tab === 'overview'  && <OverviewTab  profile={profile} generations={recentGenerations} isPremium={isPremium} />}
          {tab === 'history'   && <HistoryTab   generations={recentGenerations} />}
          {tab === 'referrals' && <ReferralsTab profile={profile} referralLink={referralLink} />}
          {tab === 'settings'  && <SettingsTab  profile={profile} />}
        </main>
      </div>

      {/* Earn Credits Modal */}
      <EarnCreditsModal
        open={earnOpen} onClose={() => setEarnOpen(false)}
        userId={profile?.id} referralLink={referralLink}
        onCreditsEarned={amount => toast.success(`+${amount} credits added!`)}
      />
    </div>
  )
}

function OverviewTab({ profile, generations, isPremium }: { profile: User | null; generations: Generation[]; isPremium: boolean }) {
  const stats = [
    { label: 'Total Generations', value: formatNumber(profile?.total_generations ?? 0), icon: Sparkles, color: 'text-violet-400' },
    { label: 'Referrals Made',    value: String(profile?.referral_count ?? 0),         icon: Gift,     color: 'text-emerald-400' },
    { label: 'Public Shares',     value: String(generations.filter(g => g.is_public).length), icon: TrendingUp, color: 'text-blue-400' },
  ]
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold mb-1">
          Welcome back {profile?.full_name?.split(' ')[0] ?? ''} 👋
        </h1>
        <p className="text-muted-foreground text-sm">Here's your AuraForge dashboard.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="glass border border-white/5 rounded-2xl p-5">
            <div className={cn('w-8 h-8 rounded-lg bg-card flex items-center justify-center mb-3', s.color)}>
              <s.icon className="w-4 h-4" />
            </div>
            <div className="font-display text-2xl font-bold mb-0.5">{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </motion.div>
        ))}
      </div>
      <div>
        <h2 className="font-semibold mb-4">Recent Generations</h2>
        {generations.length === 0 ? (
          <div className="text-center py-14 border border-dashed border-border rounded-2xl">
            <Sparkles className="w-9 h-9 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground mb-4 text-sm">No generations yet</p>
            <Link href="/tools" className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm text-white font-semibold">
              Try your first tool
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {generations.slice(0, 8).map(g => <GenerationRow key={g.id} g={g} />)}
          </div>
        )}
      </div>
    </div>
  )
}

function HistoryTab({ generations }: { generations: Generation[] }) {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-6">Generation History</h1>
      {generations.length === 0
        ? <div className="text-center py-14 border border-dashed border-border rounded-2xl text-muted-foreground text-sm">No history yet.</div>
        : <div className="space-y-3">{generations.map(g => <GenerationRow key={g.id} g={g} />)}</div>
      }
    </div>
  )
}

function ReferralsTab({ profile, referralLink }: { profile: User | null; referralLink: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = async () => {
    await navigator.clipboard.writeText(referralLink)
    setCopied(true); toast.success('Referral link copied!')
    setTimeout(() => setCopied(false), 2500)
  }
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold mb-1">Referral Program</h1>
        <p className="text-muted-foreground text-sm">Invite friends. You both get +5 free credits when they sign up.</p>
      </div>
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass border border-white/5 rounded-2xl p-5">
          <div className="font-display text-3xl font-bold gradient-text mb-1">{profile?.referral_count ?? 0}</div>
          <div className="text-sm text-muted-foreground">Friends Referred</div>
        </div>
        <div className="glass border border-white/5 rounded-2xl p-5">
          <div className="font-display text-3xl font-bold gradient-text mb-1">{profile?.credits_earned_from_referrals ?? 0}</div>
          <div className="text-sm text-muted-foreground">Credits Earned</div>
        </div>
      </div>
      {/* Link */}
      <div className="glass border border-white/5 rounded-2xl p-6 space-y-4">
        <h3 className="font-semibold">Your Referral Link</h3>
        <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/30 border border-border">
          <span className="text-sm text-muted-foreground flex-1 truncate font-mono">{referralLink}</span>
          <button onClick={handleCopy} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline px-2 flex-shrink-0">
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <div className="flex gap-3">
          <button onClick={() => { const t = encodeURIComponent(`Try AuraForge for free AI identity tools! Use my link: ${referralLink}`); window.open(`https://twitter.com/intent/tweet?text=${t}`, '_blank') }}
            className="flex-1 py-2.5 rounded-xl border border-border hover:border-primary/30 text-sm font-semibold transition-colors">
            Share on X
          </button>
          <button onClick={handleCopy}
            className="flex-1 py-2.5 rounded-xl btn-primary text-sm font-semibold text-white">
            Copy Link
          </button>
        </div>
      </div>
      <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
        <p className="text-sm text-muted-foreground">
          💡 Your referral code: <span className="font-mono font-bold text-primary">{profile?.referral_code}</span>
          <br />Share the link above or tell friends to enter code at signup.
        </p>
      </div>
    </div>
  )
}

function SettingsTab({ profile }: { profile: User | null }) {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Settings</h1>
      <div className="glass border border-white/5 rounded-2xl p-6 space-y-1">
        <h2 className="font-semibold mb-4 text-sm">Account</h2>
        {[
          ['Email',        profile?.email ?? '—'],
          ['Plan',         profile?.is_premium ? '⭐ Pro' : 'Free'],
          ['Member since', new Date(profile?.created_at ?? '').toLocaleDateString()],
          ['Referral code', profile?.referral_code ?? '—'],
        ].map(([l, v]) => (
          <div key={l} className="flex justify-between py-3 border-b border-border last:border-0 text-sm">
            <span className="text-muted-foreground">{l}</span>
            <span className={l === 'Plan' && profile?.is_premium ? 'text-yellow-400 font-semibold' : 'font-mono text-xs'}>{v}</span>
          </div>
        ))}
      </div>
      {!profile?.is_premium && (
        <div className="glass border border-primary/20 rounded-2xl p-6 bg-primary/5">
          <h2 className="font-semibold mb-2 flex items-center gap-2">
            <Crown className="w-4 h-4 text-yellow-400" /> Upgrade to Pro
          </h2>
          <p className="text-sm text-muted-foreground mb-4">Unlimited generations, faster AI, no watermarks.</p>
          <Link href="/pricing" className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white">
            View Plans →
          </Link>
        </div>
      )}
    </div>
  )
}

function GenerationRow({ g }: { g: Generation }) {
  const meta    = TOOL_META[g.tool_slug]
  const preview = g.output.slice(0, 100)
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary/20 transition-colors bg-card/50 group">
      <div className="text-2xl flex-shrink-0">{meta?.emoji ?? '✨'}</div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium">{meta?.name ?? g.tool_slug}</div>
        <div className="text-xs text-muted-foreground truncate mt-0.5">{preview}…</div>
      </div>
      <div className="text-xs text-muted-foreground flex-shrink-0 hidden sm:block">{timeAgo(g.created_at)}</div>
      {g.share_id && (
        <Link href={`/share/${g.share_id}`} className="opacity-0 group-hover:opacity-100 transition-opacity">
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </Link>
      )}
    </div>
  )
}
