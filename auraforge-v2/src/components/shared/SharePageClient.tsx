'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Copy, Check, Twitter, Download, Share2, Loader2 } from 'lucide-react'
import { TOOL_META } from '@/lib/constants'
import toast from 'react-hot-toast'

interface Props {
  result:    Record<string, unknown>
  meta:      typeof TOOL_META[string] | undefined
  shareId:   string
  isPremium?: boolean
}

// Phase 2: Fixed share URL (was "undefined/share/…")
function getShareUrl(shareId: string): string {
  // Use NEXT_PUBLIC env var on client, fallback to window.location.origin
  const base =
    process.env.NEXT_PUBLIC_APP_URL ||
    (typeof window !== 'undefined' ? window.location.origin : 'https://auraforge.app')
  return `${base}/share/${shareId}`
}

export function SharePageClient({ result, meta, shareId, isPremium = false }: Props) {
  const [copied,   setCopied]   = useState(false)
  const [dlLoading, setDlLoad]  = useState(false)

  const shareUrl = getShareUrl(shareId)
  const ogImage  = `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/api/og?tool=${encodeURIComponent(meta?.name ?? 'AI Result')}&emoji=${encodeURIComponent(meta?.emoji ?? '✨')}&result=${encodeURIComponent(getFirstString(result))}&shareId=${shareId}`

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    toast.success('Link copied!')
    setTimeout(() => setCopied(false), 2500)
  }

  const handleTweet = () => {
    const text = encodeURIComponent(`I just got my ${meta?.name} result on AuraForge 🤯\n\n${shareUrl}\n\n#AuraForge #AITools`)
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank')
  }

  // Phase 2: Download image (watermark-free for Pro)
  const handleDownload = async () => {
    if (!isPremium) {
      toast.error('Upgrade to Pro for watermark-free image downloads!')
      return
    }
    setDlLoad(true)
    try {
      const res = await fetch(ogImage)
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `auraforge-${meta?.name?.toLowerCase().replace(/\s+/g,'-') ?? 'result'}.png`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Downloaded!')
    } catch { toast.error('Download failed. Try again.') }
    finally { setDlLoad(false) }
  }

  const handleNativeShare = async () => {
    if (typeof navigator.share !== 'undefined') {
      try {
        await navigator.share({ title: `My ${meta?.name} Result`, text: 'Check out my AuraForge AI result!', url: shareUrl })
      } catch { /* user cancelled */ }
    } else {
      await handleCopy()
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      {/* Result card */}
      <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-blue-500/5 p-6 space-y-4">
        {Object.entries(result).map(([key, value]) => {
          const label = key.replace(/_/g,' ').replace(/\b\w/g, c => c.toUpperCase())
          return (
            <div key={key}>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">{label}</div>
              {Array.isArray(value) ? (
                <div className="flex flex-wrap gap-2">
                  {value.map((v: unknown, i: number) => (
                    <span key={i} className="text-sm px-3 py-1 rounded-full bg-primary/10 text-primary">{String(v)}</span>
                  ))}
                </div>
              ) : typeof value === 'number' ? (
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${value}%` }} />
                  </div>
                  <span className="text-sm font-bold">{value}/100</span>
                </div>
              ) : (
                <p className="text-sm leading-relaxed font-medium">{String(value)}</p>
              )}
            </div>
          )
        })}
      </div>

      {/* Share actions */}
      <div className="grid grid-cols-2 gap-3">
        <button onClick={handleTweet}
          className="flex items-center justify-center gap-2 py-3 rounded-xl border border-border hover:border-[#1DA1F2]/40 hover:text-[#1DA1F2] transition-colors text-sm font-semibold">
          <Twitter className="w-4 h-4" /> Share on X
        </button>
        <button onClick={handleNativeShare}
          className="flex items-center justify-center gap-2 py-3 rounded-xl border border-border hover:border-primary/40 hover:text-primary transition-colors text-sm font-semibold">
          <Share2 className="w-4 h-4" /> Share
        </button>
        <button onClick={handleCopy}
          className="flex items-center justify-center gap-2 py-3 rounded-xl border border-border hover:border-primary/40 transition-colors text-sm font-semibold">
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copied!' : 'Copy Link'}
        </button>
        <button onClick={handleDownload} disabled={dlLoading}
          className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-semibold transition-colors ${isPremium ? 'border-border hover:border-primary/40' : 'border-border/40 text-muted-foreground/50 cursor-not-allowed'}`}>
          {dlLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          {isPremium ? 'Download PNG' : 'Pro: Download'}
        </button>
      </div>
    </motion.div>
  )
}

function getFirstString(result: Record<string, unknown>): string {
  for (const v of Object.values(result)) {
    if (typeof v === 'string' && v.length > 10) return v.slice(0, 140)
  }
  return 'Check out my AI result!'
}
