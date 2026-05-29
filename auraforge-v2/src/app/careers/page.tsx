import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'Careers | AuraForge' }
export default function Page() {
  return (<><Navbar /><main className="pt-28 pb-20 px-4 max-w-2xl mx-auto text-center"><div className="text-5xl mb-5">🚀</div><h1 className="font-display text-4xl font-bold mb-4">Join AuraForge</h1><p className="text-muted-foreground mb-10 max-w-md mx-auto">Small team, big ambitions. We hire for talent and curiosity.</p><div className="p-8 rounded-2xl border border-dashed border-border bg-card/50"><p className="text-muted-foreground text-sm mb-4">No open roles right now — but always interested in exceptional people.</p><a href="mailto:careers@auraforge.app" className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white">Send us your story →</a></div></main><Footer /></>)
}
