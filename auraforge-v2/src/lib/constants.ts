export const APP_NAME        = 'AuraForge'
export const APP_URL         = process.env.NEXT_PUBLIC_APP_URL || 'https://auraforge.app'
export const APP_DESCRIPTION = 'Free viral AI identity and creator tools for everyone'

// ── Credit limits ────────────────────────────────────────────
export const FREE_DAILY_CREDITS  = 10   // logged-in free users
export const ANON_FREE_CREDITS   = 1    // anonymous (no account) — NEW REQ 1
export const REFERRAL_BONUS      = 5    // credits gifted to referrer — NEW REQ 2
export const AD_WATCH_BONUS      = 2    // credits for watching rewarded ad — NEW REQ 2
export const CREDITS_RESET_HOUR  = 0    // midnight UTC

export const TOOL_SLUGS = [
  'ai-roast-me',
  'personality-scanner',
  'aura-detector',
  'future-self',
  'creator-toolkit',
  'ai-caption',
  'ai-title-generator',
  'resume-helper',
] as const

export const TOOL_META: Record<string, { name: string; emoji: string; description: string }> = {
  'ai-roast-me':        { name: 'AI Roast Me',          emoji: '🔥', description: 'Get brutally (but lovingly) roasted by AI' },
  'personality-scanner':{ name: 'Personality Scanner',  emoji: '🧠', description: 'Discover your internet personality type' },
  'aura-detector':      { name: 'Aura Detector',        emoji: '✨', description: 'Find your aura color & energy' },
  'future-self':        { name: 'AI Future Self',        emoji: '🚀', description: 'AI predicts your future' },
  'creator-toolkit':    { name: 'Creator Toolkit',       emoji: '🎨', description: 'Bios, captions, hooks, hashtags' },
  'ai-caption':         { name: 'Caption Generator',     emoji: '📸', description: 'Viral captions for any platform' },
  'ai-title-generator': { name: 'YouTube Title AI',      emoji: '🎯', description: 'Click-worthy content titles' },
  'resume-helper':      { name: 'Resume Helper',         emoji: '💼', description: 'AI-powered resume enhancement' },
}
