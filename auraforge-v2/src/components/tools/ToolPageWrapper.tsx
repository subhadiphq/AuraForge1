'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Crown, Zap, HelpCircle, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FREE_DAILY_CREDITS, TOOL_META } from '@/lib/constants'

interface RelatedTool { slug: string; label: string; emoji: string }

interface Props {
  /* header */
  emoji: string
  name: string
  description: string
  gradient: [string, string]
  /* credits */
  isPremiumUser?: boolean
  creditsUsed?: number
  /* layout slots */
  inputPanel: ReactNode
  resultPanel: ReactNode
  hasResult: boolean
  /* bottom sections */
  howItWorks?: Array<{ step: string; title: string; desc: string }>
  faqs?: Array<{ q: string; a: string }>
  relatedTools?: RelatedTool[]
}

export function ToolPageWrapper({
  emoji, name, description, gradient,
  isPremiumUser = false, creditsUsed = 0,
  inputPanel, resultPanel, hasResult,
  howItWorks, faqs, relatedTools,
}: Props) {
  const remaining = isPremiumUser ? Infinity : Math.max(0, FREE_DAILY_CREDITS - creditsUsed)

  return (
    <div className="min-h-screen">
      {/* ── Tool header ───────────────────────────────────────────── */}
      <div
        className="relative py-10 sm:py-14 px-4 border-b border-border overflow-hidden"
        style={{ background: `radial-gradient(ellipse 70% 60% at 50% 0%, ${gradient[0]}18, transparent 70%)` }}
      >
        <div className="absolute inset-0 hero-grid opacity-20 pointer-events-none" />
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="mb-6">
            <Link href="/tools" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> All Tools
            </Link>
          </motion.div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 200 }} className="text-5xl sm:text-6xl select-none">
              {emoji}
            </motion.div>
            <div className="flex-1">
              <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold mb-1.5">
                {name}
              </motion.h1>
              <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="text-muted-foreground text-sm sm:text-base max-w-xl">
                {description}
              </motion.p>
            </div>
            {/* Credits badge */}
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
              {isPremiumUser ? (
                <div className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm font-semibold">
                  <Crown className="w-4 h-4" /> Unlimited
                </div>
              ) : (
                <Link href="/pricing">
                  <div className={cn(
                    'flex items-center gap-1.5 px-4 py-2 rounded-xl border text-sm font-semibold transition-colors',
                    remaining > 3 ? 'bg-primary/10 border-primary/20 text-primary'
                    : remaining > 0 ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                    : 'bg-red-500/10 border-red-500/20 text-red-400',
                  )}>
                    <Zap className="w-4 h-4" />
                    {remaining === Infinity ? '∞' : `${remaining}/${FREE_DAILY_CREDITS}`} credits
                  </div>
                </Link>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── Main split layout ──────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">
          {/* Left: Input */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            {inputPanel}
          </motion.div>

          {/* Right: Result / Preview */}
          <div className="lg:sticky lg:top-24">
            <AnimatePresence mode="wait">
              {hasResult ? (
                <motion.div key="result" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.35 }}>
                  {resultPanel}
                </motion.div>
              ) : (
                <motion.div key="placeholder" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center min-h-[320px] rounded-2xl border-2 border-dashed border-border bg-card/30 text-center px-6"
                >
                  <div className="text-5xl mb-4 opacity-40">{emoji}</div>
                  <p className="text-muted-foreground text-sm font-medium">Your result will appear here</p>
                  <p className="text-muted-foreground/60 text-xs mt-1">Fill in the form and hit Generate</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ── How it works ──────────────────────────────────────────── */}
      {howItWorks && howItWorks.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-10 border-t border-border">
          <h2 className="font-display text-2xl font-bold mb-8 text-center">How it works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {howItWorks.map((s) => (
              <div key={s.step} className="flex items-start gap-4 p-5 rounded-2xl border border-border bg-card/50">
                <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold flex-shrink-0">{s.step}</div>
                <div>
                  <div className="font-semibold text-sm mb-1">{s.title}</div>
                  <div className="text-xs text-muted-foreground leading-relaxed">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Related tools ─────────────────────────────────────────── */}
      {relatedTools && relatedTools.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-10 border-t border-border">
          <h2 className="font-display text-xl font-bold mb-6">You might also like</h2>
          <div className="flex flex-wrap gap-3">
            {relatedTools.map((t) => (
              <Link key={t.slug} href={`/tools/${t.slug}`}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card hover:border-primary/30 hover:bg-card/80 transition-all text-sm font-medium group">
                <span>{t.emoji}</span>
                {t.label}
                <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── FAQ ───────────────────────────────────────────────────── */}
      {faqs && faqs.length > 0 && (
        <section className="max-w-3xl mx-auto px-4 py-10 border-t border-border">
          <h2 className="font-display text-2xl font-bold mb-8 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-primary" /> FAQ
          </h2>
          <div className="space-y-4">
            {faqs.map((f, i) => (
              <details key={i} className="group rounded-xl border border-border bg-card overflow-hidden">
                <summary className="flex items-center justify-between p-5 cursor-pointer font-medium text-sm list-none">
                  {f.q}
                  <span className="ml-4 text-muted-foreground group-open:rotate-45 transition-transform text-lg leading-none">+</span>
                </summary>
                <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">{f.a}</div>
              </details>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
