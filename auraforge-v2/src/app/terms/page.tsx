import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'Terms of Service | AuraForge' }
const S=[{t:'1. Acceptance',c:'By using AuraForge you agree to these terms.'},{t:'2. Use of Service',c:'Do not use for illegal activities, generating harmful content, or abusing free credits.'},{t:'3. Free Tier',c:'10 daily credits reset at midnight UTC. Non-transferable.'},{t:'4. Subscriptions',c:'Cancel anytime. 7-day refund window on first purchase.'},{t:'5. Content Guidelines',c:'No harmful, abusive, or illegal content. We may suspend violating accounts.'},{t:'6. Disclaimer',c:'AI output is for entertainment/information only. Not professional advice.'},{t:'7. Contact',c:'legal@auraforge.app'}]
export default function Page() {
  return (<><Navbar /><main className="pt-28 pb-20 px-4 max-w-3xl mx-auto"><h1 className="font-display text-4xl font-bold mb-2">Terms of Service</h1><p className="text-muted-foreground mb-10">Last updated: January 2025</p><div className="space-y-5">{S.map(s=><div key={s.t} className="p-6 rounded-2xl border border-border bg-card"><h2 className="font-display text-lg font-bold mb-3">{s.t}</h2><p className="text-muted-foreground text-sm leading-relaxed">{s.c}</p></div>)}</div></main><Footer /></>)
}
