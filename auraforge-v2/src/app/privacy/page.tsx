import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'Privacy Policy | AuraForge' }
const S=[{t:'Information We Collect',c:'Email, name via OAuth, usage data, IP for rate limiting. We do not sell your data.'},{t:'How We Use It',c:'To provide services, manage credits, process payments via Stripe, and prevent API abuse.'},{t:'Data Storage',c:'Stored in Supabase. Delete your account anytime from Settings.'},{t:'Third-Party Services',c:'Supabase, Stripe, OpenRouter, Groq, Vercel, Google Analytics.'},{t:'Your Rights',c:'Access, correct, or delete your data. Email privacy@auraforge.app'},{t:'Contact',c:'privacy@auraforge.app — Last updated: January 2025'}]
export default function Page() {
  return (<><Navbar /><main className="pt-28 pb-20 px-4 max-w-3xl mx-auto"><h1 className="font-display text-4xl font-bold mb-2">Privacy Policy</h1><p className="text-muted-foreground mb-10">Last updated: January 2025</p><div className="space-y-5">{S.map(s=><div key={s.t} className="p-6 rounded-2xl border border-border bg-card"><h2 className="font-display text-lg font-bold mb-3">{s.t}</h2><p className="text-muted-foreground text-sm leading-relaxed">{s.c}</p></div>)}</div></main><Footer /></>)
}
