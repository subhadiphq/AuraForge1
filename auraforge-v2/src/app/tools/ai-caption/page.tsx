'use client'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { ToolPageWrapper } from '@/components/tools/ToolPageWrapper'
import { ResultCard } from '@/components/tools/ResultCard'
import { ExamplePills } from '@/components/tools/ExamplePills'
import { Button } from '@/components/ui/button'
import { Textarea, Label } from '@/components/ui/index'
import { useAuth } from '@/hooks/useAuth'
import { generateShareId } from '@/lib/utils'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

const EXAMPLES = ['Beach sunset with friends, golden hour','New outfit photo, feeling confident','Morning coffee before a big meeting','Travel photo from Tokyo streets']
const PLATFORMS = ['instagram','tiktok','twitter','linkedin']

export default function CaptionPage() {
  const [input, setInput] = useState('')
  const [platform, setPlatform] = useState('instagram')
  const [result, setResult] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(false)
  const [shareId] = useState(generateShareId)
  const { isPremium } = useAuth()

  const run = async () => {
    if (!input.trim()) { toast.error('Describe your post!'); return }
    setLoading(true); setResult(null)
    try {
      const res = await fetch('/api/ai', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ tool_slug: 'caption-generator', input: input.trim(), platform }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResult(data.result)
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : 'Failed') }
    finally { setLoading(false) }
  }

  const inputPanel = (
    <div className="space-y-5">
      <div>
        <Label className="mb-2 block font-semibold text-sm">Describe your photo or post</Label>
        <Textarea value={input} onChange={e => setInput(e.target.value)} maxLength={500}
          placeholder="E.g. 'Beach sunset with friends, golden hour, summer vibes, happy mood'"
          className="min-h-[140px] text-sm resize-none" />
      </div>
      <ExamplePills examples={EXAMPLES} onSelect={setInput} />
      <div>
        <Label className="mb-2 block text-sm">Platform</Label>
        <div className="flex gap-2 flex-wrap">
          {PLATFORMS.map(p => (
            <button key={p} onClick={() => setPlatform(p)}
              className={cn('px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all border',
                platform === p ? 'bg-primary/20 text-primary border-primary/40' : 'border-border text-muted-foreground hover:border-primary/20 hover:text-foreground')}>
              {p}
            </button>
          ))}
        </div>
      </div>
      <Button onClick={run} loading={loading} size="lg" className="w-full" disabled={!input.trim()}>
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Generating…</> : <>📸 Generate Captions</>}
      </Button>
    </div>
  )

  return (
    <>
      <Navbar />
      <ToolPageWrapper
        emoji="📸" name="Caption Generator"
        description="Describe your photo. Get 3 viral caption styles with hashtags for any platform."
        gradient={['#ec4899','#8b5cf6']}
        isPremiumUser={isPremium}
        inputPanel={inputPanel}
        resultPanel={result ? <ResultCard result={result} toolName="Caption Generator" toolEmoji="📸" gradient={['#ec4899','#8b5cf6']} shareId={shareId} isPremium={isPremium} /> : loading ? <div className="flex items-center justify-center min-h-[280px] rounded-2xl border border-pink-500/20 bg-pink-500/5"><div className="text-4xl animate-pulse">📸</div></div> : <></>}
        hasResult={!!result || loading}
        howItWorks={[{step:'1',title:'Describe your content',desc:'Tell us about your photo, mood, and occasion.'},{step:'2',title:'Pick your platform',desc:'Captions are optimized for Instagram, TikTok, Twitter, or LinkedIn.'},{step:'3',title:'3 captions + hashtags',desc:'Get funny, motivational, and trendy versions. Copy the best one.'}]}
        faqs={[{q:'How many hashtags do I get?',a:'You get a curated set of relevant trending hashtags with every caption — ready to copy-paste.'},{q:'Does it work for Reels and TikTok?',a:'Yes! Select TikTok or Instagram and the AI optimizes caption length and hook style accordingly.'}]}
        relatedTools={[{slug:'ai-title-generator',emoji:'🎯',label:'Title Generator'},{slug:'creator-toolkit',emoji:'🎨',label:'Creator Toolkit'},{slug:'ai-roast-me',emoji:'🔥',label:'AI Roast Me'}]}
      />
      <Footer />
    </>
  )
}
