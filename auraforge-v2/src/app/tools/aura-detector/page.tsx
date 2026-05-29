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

const EXAMPLES = ['Calm but chaotic energy, always late but always prepared','Morning person who secretly loves midnight','Empath who needs 3 days to recover from social events','Manifesting millionaire, currently broke']

export default function AuraDetectorPage() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(false)
  const [shareId] = useState(generateShareId)
  const { isPremium } = useAuth()

  const run = async () => {
    if (!input.trim()) { toast.error('Describe your energy first!'); return }
    setLoading(true); setResult(null)
    try {
      const res = await fetch('/api/ai', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ tool_slug: 'aura-detector', input: input.trim() }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResult(data.result)
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : 'Failed') }
    finally { setLoading(false) }
  }

  const inputPanel = (
    <div className="space-y-5">
      <div>
        <Label className="mb-2 block font-semibold text-sm">Describe your personality or daily energy</Label>
        <Textarea value={input} onChange={e => setInput(e.target.value)} maxLength={1000}
          placeholder="Describe your vibe, energy, mood, how people perceive you, your daily feelings…"
          className="min-h-[160px] text-sm resize-none" />
      </div>
      <ExamplePills examples={EXAMPLES} onSelect={setInput} />
      <Button onClick={run} loading={loading} size="lg" className="w-full" disabled={!input.trim()}>
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Detecting…</> : <>✨ Detect My Aura</>}
      </Button>
    </div>
  )

  return (
    <>
      <Navbar />
      <ToolPageWrapper
        emoji="✨" name="Aura Detector"
        description="What color is your aura? What energy do you project? The AI sees all."
        gradient={['#06b6d4','#8b5cf6']}
        isPremiumUser={isPremium}
        inputPanel={inputPanel}
        resultPanel={result ? <ResultCard result={result} toolName="Aura Detector" toolEmoji="✨" gradient={['#06b6d4','#8b5cf6']} shareId={shareId} isPremium={isPremium} /> : loading ? <div className="flex items-center justify-center min-h-[280px] rounded-2xl border border-cyan-500/20 bg-cyan-500/5"><div className="text-4xl animate-pulse">✨</div></div> : <></>}
        hasResult={!!result || loading}
        howItWorks={[{step:'1',title:'Describe your energy',desc:'Tell us about your vibe, mood patterns, and how people see you.'},{step:'2',title:'AI reads your frequency',desc:'Our AI maps your description to aura colors and energy signatures.'},{step:'3',title:'Your aura revealed',desc:'Get your color, element, power, weakness, and energy level.'}]}
        faqs={[{q:'Are auras real?',a:'Whether you believe in auras or not, this is a fun way to understand your energy and how you project yourself — backed by personality science.'},{q:'Can my aura change?',a:'Absolutely! Your aura can shift with your mood, environment, and personal growth.'}]}
        relatedTools={[{slug:'personality-scanner',emoji:'🧠',label:'Personality Scanner'},{slug:'ai-roast-me',emoji:'🔥',label:'AI Roast Me'},{slug:'future-self',emoji:'🚀',label:'Future Self'}]}
      />
      <Footer />
    </>
  )
}
