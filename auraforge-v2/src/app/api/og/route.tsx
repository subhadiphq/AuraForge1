import { ImageResponse } from '@vercel/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const tool    = searchParams.get('tool')    || 'AI Result'
  const emoji   = searchParams.get('emoji')   || '✨'
  const result  = searchParams.get('result')  || 'Your AI result is ready!'
  const username = searchParams.get('user')   || null
  const g1      = searchParams.get('g1')      || '#8b5cf6'
  const g2      = searchParams.get('g2')      || '#3d9bff'

  // Truncate result text for the card
  const displayResult = result.length > 160 ? result.slice(0, 157) + '…' : result

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px', height: '630px',
          background: 'linear-gradient(135deg, #0a0a0f 0%, #0f0f1a 100%)',
          display: 'flex', flexDirection: 'column',
          fontFamily: 'system-ui, sans-serif',
          position: 'relative', overflow: 'hidden',
        }}
      >
        {/* Grid pattern bg */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `linear-gradient(rgba(139,92,246,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.06) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }} />

        {/* Gradient glow */}
        <div style={{
          position: 'absolute', top: '-100px', left: '50%', transform: 'translateX(-50%)',
          width: '600px', height: '400px', borderRadius: '50%',
          background: `radial-gradient(ellipse, ${g1}30 0%, transparent 70%)`,
        }} />

        {/* Main card */}
        <div style={{
          position: 'relative', zIndex: 1,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          flex: 1, padding: '60px',
        }}>
          {/* Tool badge */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            background: `linear-gradient(135deg, ${g1}25, ${g2}15)`,
            border: `1px solid ${g1}40`,
            borderRadius: '100px', padding: '10px 24px',
            marginBottom: '32px',
          }}>
            <span style={{ fontSize: '28px' }}>{emoji}</span>
            <span style={{ color: '#ffffff', fontSize: '18px', fontWeight: 700, letterSpacing: '0.03em' }}>{tool}</span>
          </div>

          {/* Result text */}
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '20px', padding: '40px 50px',
            maxWidth: '900px', textAlign: 'center', marginBottom: '40px',
          }}>
            <p style={{
              color: '#f0f0f8', fontSize: '28px', lineHeight: 1.5,
              fontWeight: 500, margin: 0,
            }}>
              "{displayResult}"
            </p>
          </div>

          {/* Username + CTA */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
            {username && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '50%',
                  background: `linear-gradient(135deg, ${g1}, ${g2})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontSize: '18px', fontWeight: 700,
                }}>
                  {username.charAt(0).toUpperCase()}
                </div>
                <span style={{ color: '#9999bb', fontSize: '16px' }}>@{username}</span>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '8px',
                background: `linear-gradient(135deg, ${g1}, ${g2})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: '18px' }}>✨</span>
              </div>
              <span style={{ color: '#ffffff', fontSize: '18px', fontWeight: 700 }}>AuraForge</span>
              <span style={{ color: '#6666aa', fontSize: '16px' }}>· auraforge.app</span>
            </div>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  )
}
