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

const EXAMPLES = ['25yo dev who games too much and has 3 side projects','Aspiring artist, currently in finance, saving to quit','College junior obsessed with startups and podcasts']

export default function FutureSelfPage() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(false)
  const [shareId] = useState(generateShareId)
  const { isPremium } = useAuth()

  const run = async () => {
    if (!input.trim()) { toast.error('Tell me about yourself!'); return }
    setLoading(true); setResult(null)
    try {
      const res = await fetch('/api/ai', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ tool_slug: 'future-self', input: input.trim() }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResult(data.result)
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : 'Failed') }
    finally { setLoading(false) }
  }

  const inputPanel = (
    <div className="space-y-5">
      <div>
        <Label className="mb-2 block font-semibold text-sm">Who are you right now?</Label>
        <Textarea value={input} onChange={e => setInput(e.target.value)} maxLength={1000}
          placeholder="Describe your current self — your job, goals, habits, dreams, personality, and where you are in life…"
          className="min-h-[180px] text-sm resize-none" />
      </div>
      <ExamplePills examples={EXAMPLES} onSelect={setInput} />
      <Button onClick={run} loading={loading} size="lg" className="w-full" disabled={!input.trim()}>
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Seeing your future…</> : <>🔮 Predict My Future</>}
      </Button>
    </div>
  )

  return (
    <>
      <Navbar />
      <ToolPageWrapper
        emoji="🚀" name="AI Future Self"
        description="AI predicts where you'll be in 10 years based on your current personality and trajectory."
        gradient={['#3d9bff','#6d28d9']}
        isPremiumUser={isPremium}
        inputPanel={inputPanel}
        resultPanel={result ? <ResultCard result={result} toolName="AI Future Self" toolEmoji="🚀" gradient={['#3d9bff','#6d28d9']} shareId={shareId} isPremium={isPremium} /> : loading ? <div className="flex items-center justify-center min-h-[280px] rounded-2xl border border-blue-500/20 bg-blue-500/5"><div className="text-4xl animate-pulse">🔮</div></div> : <></>}
        hasResult={!!result || loading}
        howItWorks={[{step:'1',title:'Describe your now',desc:'Share your current life, personality, and goals.'},{step:'2',title:'AI extrapolates your arc',desc:'Pattern-matches with thousands of life trajectories.'},{step:'3',title:'Your future revealed',desc:'Get your predicted job, achievement, plot twist, and life advice.'}]}
        faqs={[{q:'How accurate is this?',a:'It\'s an AI projection based on patterns — eerily accurate sometimes, hilariously wrong others. Either way, worth sharing.'},{q:'Can I change my future?',a:'That\'s the point! Use this as motivational fuel, not gospel.'}]}
        relatedTools={[{slug:'personality-scanner',emoji:'🧠',label:'Personality Scanner'},{slug:'aura-detector',emoji:'✨',label:'Aura Detector'},{slug:'ai-roast-me',emoji:'🔥',label:'AI Roast Me'}]}
      />
      <Footer />
    </>
  )
}
