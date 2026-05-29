import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { createAdminClient } from '@/lib/supabase/server'
import { Trophy, Flame, Star, Crown } from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Leaderboard — Wall of Fame | AuraForge',
  description: 'The most viral AI results of the week. Most brutal roasts, rarest auras, and top creators on AuraForge.',
}

export const dynamic = 'force-dynamic'
export const revalidate = 300 // revalidate every 5 min

async function getLeaderboard() {
  try {
    const supabase = createAdminClient()
    const { data } = await supabase
      .from('public_feed')
      .select('id, tool_slug, tool_emoji, preview_text, username, likes, share_id, created_at')
      .eq('is_visible', true)
      .gte('created_at', new Date(Date.now() - 7 * 86400000).toISOString())
      .order('likes', { ascending: false })
      .limit(20)
    return data ?? []
  } catch { return [] }
}

const CATEGORY_META: Record<string, { label: string; icon: typeof Flame; color: string }> = {
  'ai-roast-me':        { label: 'Most Brutal Roast',    icon: Flame, color: 'text-orange-400' },
  'aura-detector':      { label: 'Rarest Aura',          icon: Star,  color: 'text-cyan-400'   },
  'personality-scanner':{ label: 'Wildest Personality',  icon: Crown, color: 'text-violet-400' },
}

export default async function LeaderboardPage() {
  const items = await getLeaderboard()

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-20 px-4 min-h-screen">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-500/10 text-yellow-400 text-sm font-semibold mb-5">
              <Trophy className="w-3.5 h-3.5" /> Wall of Fame
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-bold mb-3">
              This Week's{' '}
              <span className="gradient-text">Best Results</span>
            </h1>
            <p className="text-muted-foreground text-lg">Top AI-generated results ranked by community votes. Updated every 5 minutes.</p>
          </div>

          {/* Podium — top 3 */}
          {items.length >= 3 && (
            <div className="grid grid-cols-3 gap-3 mb-10 items-end">
              {[1, 0, 2].map((rank, pos) => {
                const item = items[rank]
                const meta = CATEGORY_META[item.tool_slug]
                const heights = ['h-28', 'h-36', 'h-24']
                const medals  = ['🥈', '🥇', '🥉']
                return (
                  <div key={item.id} className={`flex flex-col items-center gap-2`}>
                    <div className="text-2xl">{medals[pos]}</div>
                    <Link href={item.share_id ? `/share/${item.share_id}` : '#'}
                      className={`w-full ${heights[pos]} flex flex-col items-center justify-center rounded-2xl border border-border bg-card hover:border-primary/30 transition-all p-3 text-center cursor-pointer`}>
                      <div className="text-2xl mb-1">{item.tool_emoji}</div>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-tight">{item.preview_text.slice(0, 60)}…</p>
                      <div className="text-xs font-bold text-primary mt-1">♥ {item.likes.toLocaleString()}</div>
                    </Link>
                    <span className="text-xs text-muted-foreground">#{rank + 1}</span>
                  </div>
                )
              })}
            </div>
          )}

          {/* Full list */}
          {items.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-border rounded-2xl">
              <Trophy className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">No results yet this week.</p>
              <p className="text-sm text-muted-foreground/60 mb-5">Be the first — generate a result and share it!</p>
              <Link href="/tools" className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white">
                Try a Tool →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              <h2 className="font-semibold text-muted-foreground text-sm uppercase tracking-wider">All Rankings</h2>
              {items.map((item, i) => (
                <Link key={item.id} href={item.share_id ? `/share/${item.share_id}` : '#'}
                  className="flex items-center gap-4 p-4 rounded-2xl border border-border bg-card hover:border-primary/20 transition-all group">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
                    {i + 1}
                  </div>
                  <div className="text-2xl flex-shrink-0">{item.tool_emoji}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate font-medium">{item.preview_text}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {item.username ? `@${item.username}` : 'Anonymous'} · {item.tool_slug.replace(/-/g,' ')}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm font-bold text-red-400 flex-shrink-0">
                    ♥ {item.likes.toLocaleString()}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
