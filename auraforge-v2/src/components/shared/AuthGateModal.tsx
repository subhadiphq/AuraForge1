'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { X, Sparkles, Chrome, Zap, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import toast from 'react-hot-toast'

interface Props {
  open: boolean
  onClose: () => void
  toolName?: string
}

// ── NEW REQ 1: Auth gate modal ────────────────────────────────
// Appears after anonymous user burns their 1 free generation
export function AuthGateModal({ open, onClose, toolName }: Props) {
  const [googleLoading, setGoogleLoading] = useState(false)
  const supabase = createClient()

  const handleGoogle = async () => {
    setGoogleLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/api/auth/callback?redirect=${window.location.pathname}` },
    })
    if (error) { toast.error(error.message); setGoogleLoading(false) }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', stiffness: 280, damping: 24 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="pointer-events-auto w-full max-w-md glass border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
              {/* Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-blue-500/5 pointer-events-none" />

              {/* Close */}
              <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                <X className="w-4 h-4" />
              </button>

              <div className="relative text-center">
                {/* Icon */}
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center mx-auto mb-5 shadow-glow-md">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>

                <h2 className="font-display text-2xl font-bold mb-2">
                  You loved it, didn't you?
                </h2>
                <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                  {toolName ? `Sign up free to keep using ${toolName}` : 'Sign up free'} and get{' '}
                  <span className="text-primary font-semibold">10 daily credits</span> — no credit card ever needed.
                </p>

                {/* Perks */}
                <div className="grid grid-cols-2 gap-2 mb-6 text-left">
                  {['10 free credits/day', 'Save all results', 'Share viral cards', 'Access all 8 tools'].map(p => (
                    <div key={p} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />{p}
                    </div>
                  ))}
                </div>

                {/* Google CTA */}
                <button
                  onClick={handleGoogle}
                  disabled={googleLoading}
                  className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl border border-border hover:border-primary/30 font-semibold text-sm transition-all hover:bg-card mb-3 disabled:opacity-60"
                >
                  {googleLoading
                    ? <div className="loader w-4 h-4 border-2" />
                    : <Chrome className="w-5 h-5 text-blue-500" />}
                  Continue with Google
                </button>

                <Link href="/signup" onClick={onClose}
                  className="btn-primary flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-sm font-semibold text-white">
                  <Zap className="w-4 h-4" />
                  Create Free Account
                </Link>

                <p className="text-xs text-muted-foreground mt-4">
                  Already have an account?{' '}
                  <Link href="/login" onClick={onClose} className="text-primary hover:underline">Sign in</Link>
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
