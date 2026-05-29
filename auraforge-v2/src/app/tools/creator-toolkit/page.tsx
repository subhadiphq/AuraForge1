'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Loader2, Copy, Check, RefreshCw } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { ToolPageWrapper } from '@/components/tools/ToolPageWrapper'
import { ExamplePills } from '@/components/tools/ExamplePills'
import { Button } from '@/components/ui/button'
import { Textarea, Input, Label } from '@/components/ui/index'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

type SubTool = 'bio' | 'caption' | 'hashtag' | 'hook' | 'title'
const SUB_TOOLS: { id: SubTool; emoji: string; label: string; slug: string }[] = [
  { id: 'bio',     emoji: '👤', label: 'Bio Generator', slug: 'creator-bio'       },
  { id: 'caption', emoji: '📸', label: 'Captions',      slug: 'caption-generator' },
  { id: 'hashtag', emoji: '#',  label: 'Hashtags',      slug: 'caption-generator' },
  { id: 'hook',    emoji: '🎣', label: 'Hook Writer',   slug: 'hook-generator'    },
  { id: 'title',   emoji: '🎯', label: 'Titles',        slug: 'title-generator'   },
]

const EXAMPLES: Record<SubTool, string[]> = {
  bio:     ['Travel photographer, 40 countries visited','Finance bro turned crypto educator','Plant-based chef and wellness coach'],
  caption: ['Morning coffee before a big meeting','New outfit drop, feeling myself','Golden hour beach shot'],
  hashtag: ['Fitness and gym lifestyle','Travel and adventure photography','Tech startup and entrepreneurship'],
  hook:    ['Why most people fail at building habits','The truth about passive income','I quit my job and here is what happened'],
  title:   ['How I saved $10k in 6 months','Morning routine that doubled my productivity','I tried every AI tool for a month'],
}

function CopyableBlock({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => { await navigator.clipboard.writeText(value); setCopied(true); toast.success('Copied!'); setTimeout(() => setCopied(false), 2000) }
  return (
    <div className="border border-border rounded-xl p-4 bg-card group">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label.replace(/_/g,' ')}</span>
        <button onClick={copy} className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-xs text-muted-foreground hover:text-primary px-2 py-1 rounded transition-all">
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />} Copy
        </button>
      </div>
      <p className="text-sm leading-relaxed">{value}</p>
    </div>
  )
}

export default function CreatorToolkitPage() {
  const [activeTool, setActiveTool] = useState<SubTool>('bio')
  const [input, setInput] = useState('')
  const [platform, setPlatform] = useState('instagram')
  const [result, setResult] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(false)
  const { isPremium } = useAuth()

  const activeConfig = SUB_TOOLS.find(t => t.id === activeTool)!

  const run = async () => {
    if (!input.trim()) { toast.error('Add some input first!'); return }
    setLoading(true); setResult(null)
    try {
      const res = await fetch('/api/ai', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ tool_slug: activeConfig.slug, input: input.trim(), platform }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResult(data.result)
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : 'Failed') }
    finally { setLoading(false) }
  }

  const resultContent = result ? (
    <AnimatePresence mode="wait">
      <motion.div key="res" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold flex items-center gap-2 text-sm"><Sparkles className="w-4 h-4 text-primary" />Your Results</h3>
          <Button variant="outline" size="sm" onClick={run}><RefreshCw className="w-3.5 h-3.5" />Regenerate</Button>
        </div>
        {Object.entries(result).map(([k, v]) =>
          Array.isArray(v)
            ? v.map((item, i) => <CopyableBlock key={`${k}-${i}`} label={typeof item === 'object' && item !== null && 'platform' in item ? (item as any).platform : `${k} ${i + 1}`} value={typeof item === 'object' && item !== null && 'bio' in item ? (item as any).bio : typeof item === 'object' && item !== null && 'caption' in item ? (item as any).caption : typeof item === 'object' && item !== null && 'hook' in item ? (item as any).hook : String(item)} />)
            : <CopyableBlock key={k} label={k} value={String(v)} />
        )}
      </motion.div>
    </AnimatePresence>
  ) : loading ? (
    <div className="flex flex-col items-center justify-center min-h-[280px] rounded-2xl border border-pink-500/20 bg-pink-500/5">
      <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
      <p className="text-sm text-muted-foreground">Generating {activeConfig.label}…</p>
    </div>
  ) : null

  const inputPanel = (
    <div className="space-y-5">
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {SUB_TOOLS.map(t => (
          <button key={t.id} onClick={() => { setActiveTool(t.id); setResult(null); setInput('') }}
            className={cn('flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold whitespace-nowrap flex-shrink-0 transition-all border',
              activeTool === t.id ? 'bg-primary text-white border-primary shadow-glow-sm' : 'border-border text-muted-foreground hover:border-primary/30 hover:text-foreground')}>
            <span>{t.emoji}</span>{t.label}
          </button>
        ))}
      </div>
      <div>
        <Label className="mb-2 block font-semibold text-sm">
          {activeTool === 'bio' ? 'Describe yourself as a creator' : activeTool === 'caption' ? 'Describe your photo/post' : activeTool === 'hashtag' ? 'What is your content about?' : activeTool === 'hook' ? 'What is your content/video topic?' : 'What is your video or post about?'}
        </Label>
        <Textarea value={input} onChange={e => setInput(e.target.value)} maxLength={600}
          placeholder="Describe in a few words or sentences…"
          className="min-h-[140px] text-sm resize-none" />
      </div>
      <ExamplePills examples={EXAMPLES[activeTool]} onSelect={setInput} />
      {(activeTool === 'bio' || activeTool === 'caption') && (
        <div className="flex gap-2 flex-wrap">
          {['instagram','tiktok','twitter','linkedin'].map(p => (
            <button key={p} onClick={() => setPlatform(p)}
              className={cn('px-3 py-1.5 rounded-lg text-xs font-semibold capitalize border transition-all',
                platform === p ? 'bg-primary/20 text-primary border-primary/40' : 'border-border text-muted-foreground hover:border-primary/20')}>
              {p}
            </button>
          ))}
        </div>
      )}
      <Button onClick={run} loading={loading} size="lg" className="w-full" disabled={!input.trim()}>
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Generating…</> : <><Sparkles className="w-4 h-4" />Generate with AI</>}
      </Button>
    </div>
  )

  return (
    <>
      <Navbar />
      <ToolPageWrapper
        emoji="🎨" name="Creator Toolkit"
        description="Your full AI content team — bios, captions, hashtags, hooks, and titles all in one place."
        gradient={['#ec4899','#8b5cf6']}
        isPremiumUser={isPremium}
        inputPanel={inputPanel}
        resultPanel={resultContent ?? <></>}
        hasResult={!!result || loading}
        howItWorks={[{step:'1',title:'Pick your tool',desc:'Choose from Bio, Caption, Hashtag, Hook, or Title generator.'},{step:'2',title:'Add your topic',desc:'Describe your content, niche, or what you want to promote.'},{step:'3',title:'Copy & publish',desc:'Get platform-optimized content ready to paste and post.'}]}
        faqs={[{q:'Which platforms are supported?',a:'Instagram, TikTok, Twitter/X, and LinkedIn — each gets optimized character counts and styles.'},{q:'Can I use this daily?',a:'Free users get 10 generations/day. Pro users get unlimited across all 5 sub-tools.'}]}
        relatedTools={[{slug:'ai-caption',emoji:'📸',label:'Caption Generator'},{slug:'ai-title-generator',emoji:'🎯',label:'Title Generator'},{slug:'resume-helper',emoji:'💼',label:'Resume Helper'}]}
      />
      <Footer />
    </>
  )
}
