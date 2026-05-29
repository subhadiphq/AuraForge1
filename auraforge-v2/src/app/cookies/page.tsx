import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'Cookie Policy | AuraForge' }
export default function Page() {
  return (<><Navbar /><main className="pt-28 pb-20 px-4 max-w-3xl mx-auto"><h1 className="font-display text-4xl font-bold mb-8">Cookie Policy</h1><div className="space-y-4">{[{t:'Essential Cookies',d:'Authentication sessions (Supabase). Cannot be disabled.',b:'Required'},{t:'Analytics Cookies',d:'Google Analytics and PostHog. Can be opted out.',b:'Optional'},{t:'Performance Cookies',d:'Microsoft Clarity heatmaps. Can be opted out.',b:'Optional'}].map(c=><div key={c.t} className="p-6 rounded-2xl border border-border bg-card"><div className="flex items-center gap-2 mb-2"><h2 className="font-bold">{c.t}</h2><span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${c.b==='Required'?'bg-primary/20 text-primary':'bg-border text-muted-foreground'}`}>{c.b}</span></div><p className="text-sm text-muted-foreground">{c.d}</p></div>)}<p className="text-sm text-muted-foreground">Opt out: privacy@auraforge.app</p></div></main><Footer /></>)
}
