'use client'

import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

interface Props {
  examples: string[]
  onSelect: (value: string) => void
  label?: string
}

export function ExamplePills({ examples, onSelect, label = 'Quick start:' }: Props) {
  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
        <Sparkles className="w-3 h-3 text-primary" /> {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {examples.map((ex, i) => (
          <motion.button
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04 }}
            onClick={() => onSelect(ex)}
            className="text-xs px-3 py-1.5 rounded-full border border-border hover:border-primary/50 hover:bg-primary/8 hover:text-primary transition-all bg-card/50 font-medium"
          >
            {ex}
          </motion.button>
        ))}
      </div>
    </div>
  )
}
