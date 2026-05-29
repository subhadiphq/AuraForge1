'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { Heart, Share2, Users, Loader2, RefreshCw, Globe } from 'lucide-react'
import { cn, timeAgo } from '@/lib/utils'
import Link from 'next/link'

interface FeedItem {
  id:           string
  tool_slug:    string
  tool_emoji:   string
  preview_text: string
  username:     string | null
  likes:        number
  created_at:   string
  share_id:     string | null
}

// Skeleton card while loading
function FeedSkeleton() {
  return (
    <div className="glass border border-white/5 rounded-2xl p-5 space-y-3 animate-pulse">
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-full bg-border" />
        <div className="space-y-1 flex-1">
          <div className="h-3 bg-border rounded w-24" />
          <div className="h-2 bg-border rounded w-16" />
        </div>
        <div className="h-5 bg-border rounded-full w-24" />
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-border rounded w-full" />
        <div className="h-3 bg-border rounded w-4/5" />
      </div>
    </div>
  )
}

function FeedCard({ item, inView, index }: { item: FeedItem; inView: boolean; index: number }) {
  const [liked, setLiked]   = useState(false)
  const [count, setCount]   = useState(item.likes)
  const [liking, setLiking] = useState(false)

  const handleLike = async () => {
    if (liking) return
    setLiking(true)
    const next = !liked
    setLiked(next)
    setCount(c => next ? c + 1 : c - 1)
    // Optimistic — no await needed for UX
    try {
      await fetch(`/api/feed/${item.id}/like`, { method: 'POST' })
    } catch { /* silent */ }
    setLiking(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.06, duration: 0.45, ease: 'easeOut' }}
      className="glass border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all duration-300"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500/30 to-blue-500/20 border border-white/10 flex items-center justify-center text-base font-semibold text-primary">
            {item.username ? item.username.charAt(0).toUpperCase() : '?'}
          </div>
          <div>
            <div className="text-sm font-medium">{item.username ? `@${item.username}` : 'Anonymous'}</div>
            <div className="text-xs text-muted-foreground">{timeAgo(item.created_at)}</div>
          </div>
        </div>
        <span className={cn(
          'text-xs px-2.5 py-1 rounded-full font-semibold text-white',
          'bg-gradient-to-r from-violet-500 to-blue-500'
        )}>
          {item.tool_emoji} {item.tool_slug.replace(/-/g,' ').replace(/\b\w/g, c => c.toUpperCase())}
        </span>
      </div>

      {/* Content */}
      <p className="text-sm leading-relaxed text-foreground/90 mb-4 line-clamp-3">
        "{item.preview_text}"
      </p>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={handleLike}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-red-400 transition-colors group/like">
            <Heart className={cn('w-4 h-4 transition-all group-hover/like:scale-125', liked && 'fill-red-400 text-red-400')} />
            {count.toLocaleString()}
          </button>
          {item.share_id && (
            <button onClick={() => navigator.clipboard.writeText(`${window.location.origin}/share/${item.share_id}`)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
              <Share2 className="w-3.5 h-3.5" /> Share
            </button>
          )}
        </div>
        {item.share_id && (
          <Link href={`/share/${item.share_id}`} className="text-xs text-primary hover:underline font-medium">
            View full →
          </Link>
        )}
      </div>
    </motion.div>
  )
}

export function CommunityFeed() {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  const [items,   setItems]   = useState<FeedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(false)

  const load = useCallback(async () => {
    setLoading(true); setError(false)
    try {
      const res  = await fetch('/api/feed?limit=9')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setItems(data.items ?? [])
    } catch {
      setError(true)
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { if (inView) load() }, [inView, load])

  return (
    <section ref={ref} className="py-20 sm:py-32 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/3 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 28 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.55 }} className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-5">
            <Globe className="w-3.5 h-3.5" />
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            Live Community Feed
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-bold mb-4">
            See what people are{' '}
            <span className="gradient-text">discovering</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Real results from real people. Share yours and watch it go viral.
          </p>
        </motion.div>

        {/* Feed grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 9 }).map((_, i) => <FeedSkeleton key={i} />)}
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground mb-4">Could not load feed.</p>
            <button onClick={load} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border hover:border-primary/30 text-sm transition-colors">
              <RefreshCw className="w-4 h-4" /> Retry
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🌱</div>
            <p className="text-muted-foreground mb-2 font-medium">Be the first to share!</p>
            <p className="text-sm text-muted-foreground/60">Generate a result and share it to the feed.</p>
            <Link href="/tools" className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white mt-5">
              Try a Tool →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item, i) => <FeedCard key={item.id} item={item} inView={inView} index={i} />)}
          </div>
        )}

        {/* Refresh */}
        {!loading && items.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-center mt-10">
            <button onClick={load}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border hover:border-primary/30 text-sm font-medium transition-colors">
              <RefreshCw className="w-4 h-4" /> Load fresh results
            </button>
          </motion.div>
        )}
      </div>
    </section>
  )
}
