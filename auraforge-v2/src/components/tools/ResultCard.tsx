'use client'

import { useState, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Share2, Copy, Download, Twitter, Check, Sparkles, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Props {
  result:    Record<string, unknown>
  toolName:  string
  toolEmoji: string
  gradient:  [string, string]
  shareId?:  string
  isPremium?: boolean
}

function getShareUrl(shareId: string): string {
  const base =
    process.env.NEXT_PUBLIC_APP_URL ||
    (typeof window !== 'undefined' ? window.location.origin : 'https://auraforge.app')
  return `${base}/share/${shareId}`
}

export function ResultCard({ result, toolName, toolEmoji, gradient, shareId, isPremium = false }: Props) {
  const [copied,    setCopied]   = useState(false)
  const [dlLoading, setDlLoad]   = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const shareUrl = shareId ? getShareUrl(shareId) : ''

  const handleCopy = useCallback(async () => {
    if (!shareUrl) return
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    toast.success('Share link copied!')
    setTimeout(() => setCopied(false), 2500)
  }, [shareUrl])

  const handleTweet = useCallback(() => {
    const text = encodeURIComponent(`I just got my ${toolName} result on AuraForge 🤯\n\n${shareUrl}\n\n#AuraForge #AITools`)
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank')
  }, [toolName, shareUrl])

  // Phase 2: Download result card as image
  const handleDownload = useCallback(async () => {
    if (!isPremium) {
      toast.error('Upgrade to Pro for watermark-free image downloads!')
      return
    }
    if (!cardRef.current) return
    setDlLoad(true)
    try {
      const { default: html2canvas } = await import('html2canvas')
      const canvas = await html2canvas(cardRef.current, {
        scale: 2, backgroundColor: null, useCORS: true, logging: false,
      })
      const link    = document.createElement('a')
      link.download = `auraforge-${toolName.toLowerCase().replace(/\s+/g,'-')}.png`
      link.href     = canvas.toDataURL('image/png')
      link.click()
      toast.success('Downloaded!')
    } catch { toast.error('Download failed. Try again.') }
    finally { setDlLoad(false) }
  }, [isPremium, toolName])

  const entries = Object.entries(result).filter(([k]) => !['error','raw'].includes(k))

  return (
    <motion.div initial={{ opacity: 0, scale: 0.96, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 22 }} className="space-y-4">

      {/* Actions bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="font-semibold text-sm">Your Result</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleTweet} className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-[#1DA1F2] hover:border-[#1DA1F2]/30 transition-colors" title="Share on X">
            <Twitter className="w-4 h-4" />
          </button>
          <button onClick={handleCopy} className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors" title="Copy link">
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
          <button onClick={handleDownload} disabled={dlLoading}
            className={cn('w-9 h-9 rounded-lg border flex items-center justify-center transition-colors',
              isPremium ? 'border-border text-muted-foreground hover:text-primary hover:border-primary/30' : 'border-border/40 text-muted-foreground/30 cursor-not-allowed')}
            title={isPremium ? 'Download as PNG' : 'Pro: Watermark-free download'}>
            {dlLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Card */}
      <div ref={cardRef} className="relative overflow-hidden rounded-2xl">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${gradient[0]}18 0%, ${gradient[1]}12 100%)` }} />
        <div className="absolute inset-0 border border-white/8 rounded-2xl pointer-events-none" />

        <div className="relative p-5 sm:p-7">
          {/* Tool badge */}
          <div className="flex items-center gap-2 mb-5">
            <span className="text-2xl">{toolEmoji}</span>
            <span className="text-xs font-bold px-3 py-1 rounded-full text-white"
              style={{ background: `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})` }}>
              {toolName.toUpperCase()}
            </span>
            <span className="text-xs text-muted-foreground ml-auto">auraforge.app</span>
          </div>

          {/* Fields */}
          <div className="space-y-4">
            {entries.map(([key, value]) => (
              <ResultField key={key} label={key} value={value} gradient={gradient} />
            ))}
          </div>

          {/* Watermark for free users */}
          {!isPremium && (
            <div className="absolute bottom-2 right-3 text-[9px] text-white/20 font-medium select-none">
              auraforge.app
            </div>
          )}
        </div>
      </div>

      <p className="text-xs text-center text-muted-foreground">
        Not happy?{' '}
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-primary hover:underline">
          Try again ↑
        </button>
      </p>
    </motion.div>
  )
}

function ResultField({ label, value, gradient }: { label: string; value: unknown; gradient: [string, string] }) {
  const display = label.replace(/_/g,' ').replace(/\b\w/g, c => c.toUpperCase())

  if (Array.isArray(value)) {
    return (
      <div>
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{display}</div>
        <div className="flex flex-wrap gap-2">
          {value.map((v: unknown, i: number) => (
            <span key={i} className="text-sm px-3 py-1 rounded-full border border-white/10 bg-white/5">{String(v)}</span>
          ))}
        </div>
      </div>
    )
  }

  if (typeof value === 'number') {
    const pct = Math.min(100, Math.max(0, value))
    return (
      <div>
        <div className="flex justify-between mb-1.5">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{display}</div>
          <span className="text-sm font-bold">{pct}<span className="text-xs text-muted-foreground">/100</span></span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
            className="h-full rounded-full" style={{ background: `linear-gradient(90deg, ${gradient[0]}, ${gradient[1]})` }} />
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">{display}</div>
      <p className="text-sm sm:text-base leading-relaxed font-medium">{String(value)}</p>
    </div>
  )
}
