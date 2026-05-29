'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { ArrowRight, Play, Zap, Stars } from 'lucide-react'

const HEADLINE_WORDS = ['Personality', 'Aura', 'Creator DNA', 'True Vibe', 'Future Self']
const LIVE_STATS = [
  { value: '2.4M+', label: 'Generations' },
  { value: '580K+', label: 'Users' },
  { value: '47', label: 'Countries' },
]

/* Floating cards rendered as individual components to avoid hook-in-loop */
const CARDS = [
  { emoji: '🔥', text: '"Your aura is pure chaotic genius energy"', tool: 'Aura Detector', className: 'hidden lg:block left-6 top-32', delay: 0, dy: [-8, 0] },
  { emoji: '🧠', text: '"ENFP with sigma rizz undertones"',         tool: 'Personality Scanner', className: 'hidden lg:block right-6 top-36', delay: 0.6, dy: [-6, 0] },
  { emoji: '✨', text: '"Viral potential: 97% — built different"',  tool: 'Creator DNA', className: 'hidden lg:block left-10 bottom-40', delay: 1.2, dy: [-10, 0] },
]

function FloatingCard({ card }: { card: typeof CARDS[0] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: card.delay + 0.8, duration: 0.6 }}
      className={`absolute z-10 max-w-[210px] ${card.className}`}
    >
      <motion.div
        animate={{ y: card.dy }}
        transition={{ duration: 3.5 + card.delay, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
        className="glass border border-white/10 rounded-2xl p-3 bg-gradient-to-br from-violet-500/15 to-blue-500/10 shadow-glass"
      >
        <div className="flex items-start gap-2">
          <span className="text-xl">{card.emoji}</span>
          <div>
            <p className="text-xs text-muted-foreground leading-relaxed">{card.text}</p>
            <p className="text-[10px] text-primary font-semibold mt-1">{card.tool}</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

function AnimatedWord({ words, current }: { words: string[]; current: number }) {
  return (
    <span className="relative inline-flex items-center justify-center" style={{ minWidth: '340px', height: '1.15em' }}>
      <AnimatePresence mode="wait">
        <motion.span
          key={current}
          initial={{ y: 40, opacity: 0, filter: 'blur(8px)' }}
          animate={{ y: 0,  opacity: 1, filter: 'blur(0px)' }}
          exit={{   y: -40, opacity: 0, filter: 'blur(8px)' }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="absolute gradient-text font-display font-bold whitespace-nowrap"
        >
          {words[current]}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

export function HeroSection() {
  const [current, setCurrent] = useState(0)
  const { scrollYProgress } = useScroll()
  const yParallax    = useTransform(scrollYProgress, [0, 0.3], [0, -50])
  const opacityFade  = useTransform(scrollYProgress, [0, 0.35], [1, 0])

  useEffect(() => {
    const id = setInterval(() => setCurrent(p => (p + 1) % HEADLINE_WORDS.length), 2400)
    return () => clearInterval(id)
  }, [])

  return (
    <section className="relative min-h-[100svh] flex flex-col items-center justify-center overflow-hidden pt-20 pb-10">
      {/* BG layers */}
      <div className="absolute inset-0 hero-grid opacity-40 dark:opacity-60 pointer-events-none" />
      <div className="absolute inset-0 aurora-bg pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full bg-violet-500/8 blur-[120px] pointer-events-none" />

      {/* Floating cards */}
      {CARDS.map((c, i) => <FloatingCard key={i} card={c} />)}

      {/* Main content */}
      <motion.div
        style={{ y: yParallax, opacity: opacityFade }}
        className="relative z-10 text-center max-w-5xl mx-auto px-4"
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-white/10 text-sm mb-8 hover:border-primary/40 transition-colors cursor-pointer"
        >
          <Stars className="w-3.5 h-3.5 text-yellow-400" />
          <span className="text-muted-foreground">New:</span>
          <span className="font-semibold">AI Aura Detector v2 is live</span>
          <ArrowRight className="w-3.5 h-3.5 text-primary" />
        </motion.div>

        {/* H1 */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="font-display font-bold tracking-tight mb-6 leading-none"
          style={{ fontSize: 'clamp(2.5rem, 7vw, 5.5rem)' }}
        >
          Discover Your
          <br />
          <AnimatedWord words={HEADLINE_WORDS} current={current} />
          <br />
          <span className="text-muted-foreground/50" style={{ fontSize: '0.85em' }}>with AI</span>
        </motion.h1>

        {/* Sub */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.55 }}
          className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Free viral AI tools that scan your vibe, roast you, predict your future,
          and supercharge your creator content. Go viral with a single click.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.55 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12"
        >
          <Link
            href="/tools"
            className="btn-primary inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-semibold text-white neon-glow group w-full sm:w-auto justify-center"
          >
            <Zap className="w-5 h-5" />
            Try Tools Free
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="#tools"
            className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl border border-border hover:border-primary/30 text-base font-medium transition-all hover:bg-card group w-full sm:w-auto justify-center"
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Play className="w-3.5 h-3.5 text-primary fill-primary" />
            </div>
            See All Tools
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex items-center justify-center gap-10 sm:gap-16"
        >
          {LIVE_STATS.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.8 + i * 0.1 }} className="text-center">
              <div className="font-display text-2xl sm:text-3xl font-bold gradient-text">{s.value}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">{s.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll hint */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }} className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.6, repeat: Infinity }} className="w-5 h-8 rounded-full border-2 border-muted-foreground/20 flex items-start justify-center p-1">
          <div className="w-1 h-2 rounded-full bg-muted-foreground/40" />
        </motion.div>
      </motion.div>
    </section>
  )
}
