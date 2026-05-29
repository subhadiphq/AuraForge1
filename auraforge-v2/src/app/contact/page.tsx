import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'Contact | AuraForge' }
export default function Page() {
  return (<><Navbar /><main className="pt-28 pb-20 px-4 max-w-2xl mx-auto text-center"><div className="text-5xl mb-5">👋</div><h1 className="font-display text-4xl font-bold mb-4">Get in Touch</h1><p className="text-muted-foreground mb-10">We respond within 24 hours.</p><div className="grid grid-cols-1 sm:grid-cols-3 gap-4">{[{emoji:'💌',title:'General',email:'hello@auraforge.app'},{emoji:'🔐',title:'Privacy/Legal',email:'privacy@auraforge.app'},{emoji:'🤝',title:'Partnerships',email:'partners@auraforge.app'}].map(c=><a key={c.email} href={`mailto:${c.email}`} className="p-5 rounded-2xl border border-border bg-card hover:border-primary/30 transition-all group"><div className="text-3xl mb-2">{c.emoji}</div><div className="font-semibold text-sm mb-1">{c.title}</div><div className="text-xs text-primary group-hover:underline">{c.email}</div></a>)}</div></main><Footer /></>)
}
