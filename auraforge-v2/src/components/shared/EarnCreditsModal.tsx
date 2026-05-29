'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Play, Share2, Copy, Check, Loader2, Sparkles, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'
import { AD_WATCH_BONUS, REFERRAL_BONUS } from '@/lib/constants'

interface Props {
  open:         boolean
  onClose:      () => void
  userId?:      string
  referralLink: string
  onCreditsEarned: (amount: number) => void
}

// ── NEW REQ 2: Earn credits modal ─────────────────────────────
// Tab 1: Watch Ad (+2 credits) — pluggable ad network hook
// Tab 2: Refer friends (+5 credits each)
export function EarnCreditsModal({ open, onClose, userId, referralLink, onCreditsEarned }: Props) {
  const [tab, setTab]           = useState<'ad' | 'refer'>('ad')
  const [adLoading, setAdLoad]  = useState(false)
  const [adDone, setAdDone]     = useState(false)
  const [copied, setCopied]     = useState(false)

  const handleWatchAd = async () => {
    setAdLoad(true)
    try {
      // ── Plug your ad network SDK here ───────────────────
      // e.g. window.googletag.cmd.push(() => { rewardedSlot.makeRewardedVisible() })
      // For now simulate ad completion with a 3s delay
      await new Promise(r => setTimeout(r, 3000))

      // Call our API with an ad completion token
      const res = await fetch('/api/credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ad_watch', ad_token: 'simulated_token_' + Date.now() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')

      setAdDone(true)
      onCreditsEarned(AD_WATCH_BONUS)
      toast.success(`+${AD_WATCH_BONUS} credits added! 🎉`)
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Ad failed. Try again.')
    } finally { setAdLoad(false) }
  }

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(referralLink)
    setCopied(true)
    toast.success('Referral link copied!')
    setTimeout(() => setCopied(false), 2500)
  }

  const handleShareLink = () => {
    const text = encodeURIComponent(`Try AuraForge — free viral AI tools! 🔥 Use my link and we both get bonus credits: ${referralLink}`)
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank')
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={onClose} />

          <motion.div
            initial={{ opacity: 0, scale: 0.93, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 20 }}
            transition={{ type: 'spring', stiffness: 280, damping: 24 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="pointer-events-auto w-full max-w-md glass border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between px-6 pt-6 pb-4">
                <div>
                  <h2 className="font-display font-bold text-xl">Earn More Credits</h2>
                  <p className="text-muted-foreground text-sm">Free ways to keep generating</p>
                </div>
                <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 px-6 mb-5">
                {[
                  { id: 'ad' as const,    label: `Watch Ad  +${AD_WATCH_BONUS} credits`,   emoji: '📺' },
                  { id: 'refer' as const, label: `Refer Friends  +${REFERRAL_BONUS} each`, emoji: '🎁' },
                ].map(t => (
                  <button key={t.id} onClick={() => setTab(t.id)}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all border ${tab === t.id ? 'bg-primary/20 text-primary border-primary/40' : 'border-border text-muted-foreground hover:border-primary/20'}`}>
                    {t.emoji} {t.label}
                  </button>
                ))}
              </div>

              <div className="px-6 pb-6">
                {tab === 'ad' ? (
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-border bg-card/50 p-5 text-center">
                      <div className="text-4xl mb-3">📺</div>
                      <p className="text-sm text-muted-foreground mb-1">Watch a short ad</p>
                      <p className="font-bold text-lg gradient-text">Get +{AD_WATCH_BONUS} Credits Instantly</p>
                      <p className="text-xs text-muted-foreground mt-1">~30 seconds · Up to 3 times per day</p>
                    </div>

                    {adDone ? (
                      <div className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-emerald-500/10 text-emerald-400 font-semibold text-sm border border-emerald-500/20">
                        <Check className="w-4 h-4" /> Credits Added! Come back tomorrow for more.
                      </div>
                    ) : (
                      <button onClick={handleWatchAd} disabled={adLoading}
                        className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60">
                        {adLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Loading ad…</> : <><Play className="w-4 h-4" /> Watch Ad for +{AD_WATCH_BONUS} Credits</>}
                      </button>
                    )}

                    <p className="text-xs text-center text-muted-foreground">
                      Ad revenue helps us keep the free tier running for everyone 💜
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-border bg-card/50 p-5 text-center">
                      <div className="text-4xl mb-3">🎁</div>
                      <p className="text-sm text-muted-foreground">For every friend who signs up with your link</p>
                      <p className="font-bold text-lg gradient-text">You both get +{REFERRAL_BONUS} Credits</p>
                    </div>

                    <div className="rounded-xl border border-border bg-muted/30 p-3 flex items-center gap-2">
                      <span className="text-xs text-muted-foreground flex-1 truncate font-mono">{referralLink}</span>
                      <button onClick={handleCopyLink}
                        className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline px-2 py-1 rounded flex-shrink-0">
                        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        {copied ? 'Copied!' : 'Copy'}
                      </button>
                    </div>

                    <button onClick={handleShareLink}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-border hover:border-primary/30 text-sm font-semibold transition-colors">
                      <Share2 className="w-4 h-4" /> Share on X / Twitter
                    </button>

                    <p className="text-xs text-center text-muted-foreground">
                      Your credits are added automatically when friends sign up. No limit!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
