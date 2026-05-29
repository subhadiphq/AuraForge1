'use client'

import { useState } from 'react'
import { Brain, Loader2 } from 'lucide-react'
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

const EXAMPLES = ['Overthinker who loves true crime podcasts','Serial entrepreneur with 0 exits','Introvert who is somehow very online','Philosophy grad working at Starbucks','Fitness influencer who eats pizza secretly']

export default function PersonalityScannerPage() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(false)
  const [shareId] = useState(generateShareId)
  const { isPremium } = useAuth()

  const run = async () => {
    if (input.trim().length < 15) { toast.error('Add more text for a better scan!'); return }
    setLoading(true); setResult(null)
    try {
      const res = await fetch('/api/ai', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ tool_slug: 'personality-scanner', input: input.trim() }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Scan failed')
      setResult(data.result)
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : 'Scan failed') }
    finally { setLoading(false) }
  }

  const inputPanel = (
    <div className="space-y-5">
      <div>
        <Label className="mb-2 block font-semibold text-sm">Describe yourself or paste your bio</Label>
        <Textarea value={input} onChange={e => setInput(e.target.value)} maxLength={2000}
          placeholder="Paste your Twitter bio, a few tweets, a journal entry, or just describe how you think and feel…"
          className="min-h-[180px] text-sm resize-none" />
        <span className="text-xs text-muted-foreground mt-1 block">{input.length}/2000 · More text = better results</span>
      </div>
      <ExamplePills examples={EXAMPLES} onSelect={setInput} />
      <Button onClick={run} loading={loading} size="lg" className="w-full" disabled={input.trim().length < 10}>
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Scanning…</> : <><Brain className="w-4 h-4" />Scan My Personality</>}
      </Button>
    </div>
  )

  return (
    <>
      <Navbar />
      <ToolPageWrapper
        emoji="🧠" name="Personality Scanner"
        description="AI detects your internet personality type, creator archetype, and viral potential."
        gradient={['#8b5cf6','#3d9bff']}
        isPremiumUser={isPremium}
        inputPanel={inputPanel}
        resultPanel={result ? <ResultCard result={result} toolName="Personality Scanner" toolEmoji="🧠" gradient={['#8b5cf6','#3d9bff']} shareId={shareId} isPremium={isPremium} /> : loading ? <div className="flex items-center justify-center min-h-[280px] rounded-2xl border border-violet-500/20 bg-violet-500/5"><div className="text-4xl animate-pulse">🧠</div></div> : <></>}
        hasResult={!!result || loading}
        howItWorks={[{step:'1',title:'Share your words',desc:'Paste any text that reflects how you write and think.'},{step:'2',title:'Deep AI analysis',desc:'AI cross-references personality frameworks and creator archetypes.'},{step:'3',title:'Your full profile',desc:'Get your type, spirit animal, life motto, and viral score.'}]}
        faqs={[{q:'Is this like Myers-Briggs?',a:'It\'s inspired by MBTI but focuses on your online personality and creator identity — way more fun.'},{q:'How accurate is it?',a:'Surprisingly accurate. Our AI is trained on thousands of creator profiles to detect genuine patterns.'}]}
        relatedTools={[{slug:'ai-roast-me',emoji:'🔥',label:'AI Roast Me'},{slug:'aura-detector',emoji:'✨',label:'Aura Detector'},{slug:'future-self',emoji:'🚀',label:'Future Self'}]}
      />
      <Footer />
    </>
  )
}
