'use client'
import { useState } from 'react'
import { Briefcase, Loader2, Upload } from 'lucide-react'
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
  'Managed a team and increased sales',
  'Responsible for social media content',
  'Helped customers with their problems',
  'Worked on software development projects',
]

export default function ResumeHelperPage() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(false)
  const [shareId] = useState(generateShareId)
  const { isPremium } = useAuth()

  const run = async () => {
    if (!input.trim()) { toast.error('Paste some resume content first!'); return }
    setLoading(true); setResult(null)
    try {
      const res = await fetch('/api/ai', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ tool_slug: 'resume-helper', input: input.trim() }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResult(data.result)
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : 'Failed') }
    finally { setLoading(false) }
  }

  const inputPanel = (
    <div className="space-y-5">
      <div>
        <Label className="mb-2 block font-semibold text-sm">Paste your resume bullets or job experience</Label>
        <Textarea value={input} onChange={e => setInput(e.target.value)} maxLength={3000}
          placeholder="Paste your existing resume bullets, LinkedIn summary, or describe your work experience in plain language…&#10;&#10;Example: 'Managed a team of 5 and worked on marketing campaigns'"
          className="min-h-[200px] text-sm font-mono resize-none" />
        <span className="text-xs text-muted-foreground mt-1 block">{input.length}/3000</span>
      </div>
      <ExamplePills examples={EXAMPLES} onSelect={v => setInput(p => p ? `${p}\n${v}` : v)} label="Add weak bullet to improve:" />
      <Button onClick={run} loading={loading} size="lg" className="w-full" disabled={!input.trim()}>
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Improving…</> : <><Briefcase className="w-4 h-4" />Improve My Resume</>}
      </Button>
      <p className="text-xs text-center text-muted-foreground">AI rewrites weak bullets with action verbs + quantifiable impact</p>
    </div>
  )

  return (
    <>
      <Navbar />
      <ToolPageWrapper
        emoji="💼" name="Resume Helper"
        description="AI rewrites your resume bullets with power words and quantifiable impact. Get more interviews."
        gradient={['#10b981','#059669']}
        isPremiumUser={isPremium}
        inputPanel={inputPanel}
        resultPanel={result ? <ResultCard result={result} toolName="Resume Helper" toolEmoji="💼" gradient={['#10b981','#059669']} shareId={shareId} isPremium={isPremium} /> : loading ? <div className="flex items-center justify-center min-h-[280px] rounded-2xl border border-emerald-500/20 bg-emerald-500/5"><div className="text-4xl animate-pulse">💼</div></div> : <></>}
        hasResult={!!result || loading}
        howItWorks={[{step:'1',title:'Paste your experience',desc:'Add your existing resume bullets or describe your work history.'},{step:'2',title:'AI applies power words',desc:'Transforms vague descriptions into impact-driven, ATS-friendly bullets.'},{step:'3',title:'Copy & paste',desc:'Get improved bullets, LinkedIn summary, and ATS score instantly.'}]}
        faqs={[{q:'Will it be ATS-friendly?',a:'Yes. AI uses industry-standard action verbs and formats bullets to pass Applicant Tracking Systems.'},{q:'Can I use this for LinkedIn?',a:'Absolutely — you also get an optimized LinkedIn summary.'}]}
        relatedTools={[{slug:'creator-toolkit',emoji:'🎨',label:'Creator Toolkit'},{slug:'personality-scanner',emoji:'🧠',label:'Personality Scanner'},{slug:'ai-title-generator',emoji:'🎯',label:'Title Generator'}]}
      />
      <Footer />
    </>
  )
}
