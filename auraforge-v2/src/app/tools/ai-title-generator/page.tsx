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
import toast from 'react-hot-toast'

const EXAMPLES = ['How I saved $10k in 6 months on a $40k salary','Morning routine that changed my life','I tried every AI tool for 30 days','Why I quit my 6-figure job']

export default function TitleGeneratorPage() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(false)
  const [shareId] = useState(generateShareId)
  const { isPremium } = useAuth()

  const run = async () => {
    if (!input.trim()) { toast.error('Describe your content!'); return }
    setLoading(true); setResult(null)
    try {
      const res = await fetch('/api/ai', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ tool_slug: 'title-generator', input: input.trim() }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResult(data.result)
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : 'Failed') }
    finally { setLoading(false) }
  }

  const inputPanel = (
    <div className="space-y-5">
      <div>
        <Label className="mb-2 block font-semibold text-sm">What is your video or post about?</Label>
        <Textarea value={input} onChange={e => setInput(e.target.value)} maxLength={500}
          placeholder="Describe your content topic, angle, and target audience…"
          className="min-h-[140px] text-sm resize-none" />
      </div>
      <ExamplePills examples={EXAMPLES} onSelect={setInput} />
      <Button onClick={run} loading={loading} size="lg" className="w-full" disabled={!input.trim()}>
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Generating…</> : <>🎯 Generate Titles</>}
      </Button>
    </div>
  )

  return (
    <>
      <Navbar />
      <ToolPageWrapper
        emoji="🎯" name="YouTube Title AI"
        description="Generate 5 click-worthy title variations that maximize CTR and search rankings."
        gradient={['#f97316','#ef4444']}
        isPremiumUser={isPremium}
        inputPanel={inputPanel}
        resultPanel={result ? <ResultCard result={result} toolName="YouTube Title AI" toolEmoji="🎯" gradient={['#f97316','#ef4444']} shareId={shareId} isPremium={isPremium} /> : loading ? <div className="flex items-center justify-center min-h-[280px] rounded-2xl border border-orange-500/20 bg-orange-500/5"><div className="text-4xl animate-pulse">🎯</div></div> : <></>}
        hasResult={!!result || loading}
        howItWorks={[{step:'1',title:'Describe your video',desc:'Tell us the topic, your angle, and what makes it unique.'},{step:'2',title:'AI applies CTR formulas',desc:'Uses proven title structures: curiosity gaps, numbers, power words.'},{step:'3',title:'5 titles + SEO score',desc:'Pick the best performing title variant and post with confidence.'}]}
        faqs={[{q:'Do these titles actually improve CTR?',a:'Yes — creators using AI-optimized titles report 30-50% higher click-through rates on average.'},{q:'Does it work for blog posts too?',a:'Absolutely! These formulas work for YouTube, blog SEO, newsletters, and social posts.'}]}
        relatedTools={[{slug:'ai-caption',emoji:'📸',label:'Caption Generator'},{slug:'creator-toolkit',emoji:'🎨',label:'Creator Toolkit'},{slug:'resume-helper',emoji:'💼',label:'Resume Helper'}]}
      />
      <Footer />
    </>
  )
}
