'use client'

import { useState } from 'react'
import { Flame, Loader2 } from 'lucide-react'
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

const EXAMPLES = [
  'Introvert coder who talks to plants',
  'Gym bro obsessed with protein shakes',
  'Coffee addict who still hasn\'t started their novel',
  'CEO of my own vibes, unemployed',
  'Dog mom who does mercury retrograde therapy',
]

const HOW_IT_WORKS = [
  { step: '1', title: 'Describe yourself', desc: 'Paste your bio, dating profile, or just describe your personality.' },
  { step: '2', title: 'AI analyses your vibe', desc: 'Our AI reads between the lines to craft a perfectly targeted roast.' },
  { step: '3', title: 'Share the carnage', desc: 'Download a beautiful result card and post it everywhere.' },
]

const FAQS = [
  { q: 'Is the roast actually mean?', a: 'Never. Our AI is trained to be hilariously accurate without being hurtful. Think Comedy Central, not cyberbullying.' },
  { q: 'How many roasts can I get?', a: 'Free users get 10 per day. Pro users get unlimited — because sometimes one roast isn\'t enough.' },
  { q: 'Can I roast a friend\'s profile?', a: 'Yes! Paste anyone\'s bio or description. Perfect for group chats and social content.' },
]

const RELATED = [
  { slug: 'personality-scanner', emoji: '🧠', label: 'Personality Scanner' },
  { slug: 'aura-detector', emoji: '✨', label: 'Aura Detector' },
  { slug: 'future-self', emoji: '🚀', label: 'Future Self' },
]

export default function AIRoastMePage() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(false)
  const [shareId] = useState(generateShareId)
  const { isPremium } = useAuth()

  const handleSubmit = async () => {
    if (input.trim().length < 10) { toast.error('Give me more to work with — at least 10 chars!'); return }
    setLoading(true); setResult(null)
    try {
      const res  = await fetch('/api/ai', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tool_slug: 'ai-roast-me', input: input.trim() }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Generation failed')
      setResult(data.result)
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Something went wrong')
    } finally { setLoading(false) }
  }

  const inputPanel = (
    <div className="space-y-5">
      <div>
        <Label className="mb-2 block text-sm font-semibold">Your bio or description</Label>
        <Textarea value={input} onChange={e => setInput(e.target.value)} maxLength={1000}
          placeholder="Paste your dating profile, Insta bio, Twitter bio, or just describe yourself… 😈"
          className="min-h-[160px] text-sm resize-none" />
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-xs text-muted-foreground">{input.length}/1000</span>
          {input && <button onClick={() => setInput('')} className="text-xs text-muted-foreground hover:text-foreground">Clear</button>}
        </div>
      </div>
      <ExamplePills examples={EXAMPLES} onSelect={setInput} label="Try an example:" />
      <Button onClick={handleSubmit} loading={loading} size="lg" className="w-full" disabled={input.trim().length < 5}>
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Roasting you…</> : <><Flame className="w-4 h-4" /> Roast Me 🔥</>}
      </Button>
      {!isPremium && <p className="text-xs text-center text-muted-foreground">Free: 10 roasts/day · <a href="/pricing" className="text-primary hover:underline">Upgrade for unlimited →</a></p>}
    </div>
  )

  const resultPanel = result ? (
    <ResultCard result={result} toolName="AI Roast Me" toolEmoji="🔥" gradient={['#f97316','#ef4444']} shareId={shareId} isPremium={isPremium} />
  ) : (
    loading ? (
      <div className="flex flex-col items-center justify-center min-h-[280px] rounded-2xl border border-orange-500/20 bg-orange-500/5 text-center px-6">
        <div className="text-4xl mb-3 animate-bounce">🔥</div>
        <p className="text-sm text-muted-foreground">Crafting your roast…</p>
      </div>
    ) : <></>
  )

  return (
    <>
      <Navbar />
      <ToolPageWrapper
        emoji="🔥" name="AI Roast Me"
        description="Paste your bio and get destroyed — lovingly. Shareable results guaranteed."
        gradient={['#f97316','#ef4444']}
        isPremiumUser={isPremium}
        inputPanel={inputPanel}
        resultPanel={resultPanel}
        hasResult={!!result || loading}
        howItWorks={HOW_IT_WORKS} faqs={FAQS} relatedTools={RELATED}
      />
      <Footer />
    </>
  )
}
