// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — NEWSLETTER SECTION
// Beehiiv embed iframe
// ═══════════════════════════════════════════════════════════

import type { Lang } from '@/lib/data/types'

interface NewsletterSectionProps {
  lang: Lang
}

export function NewsletterSection({ lang }: NewsletterSectionProps) {
  const isES = lang === 'es'

  return (
    <section
      id="newsletter"
      className="py-16 px-4 border-t border-b border-gold/10"
    >
      <div className="max-w-2xl mx-auto text-center">
        <div className="font-cinzel text-[0.6rem] tracking-[0.3em] text-gold uppercase mb-4">
          📜 {isES ? 'Newsletter Semanal · Gratis' : 'Weekly Newsletter · Free'}
        </div>
        <h2 className="font-playfair font-bold text-cream text-3xl md:text-4xl mb-4">
          {isES ? 'La Batalla de la Semana' : 'Battle of the Week'}
        </h2>
        <p className="font-crimson italic text-smoke text-lg mb-8 max-w-xl mx-auto">
          {isES
            ? 'Cada martes: una batalla analizada en profundidad, un comandante olvidado, una táctica que cambió la historia. Lo que no te enseñaron en el colegio.'
            : 'Every Tuesday: one battle analyzed in depth, one forgotten commander, one tactic that changed history. What they never taught you in school.'
          }
        </p>

        {/* Beehiiv embed */}
        <iframe
          src="https://subscribe-forms.beehiiv.com/8e5fd67b-15de-4f68-a334-5c5717b166a6"
          data-test-id="beehiiv-embed"
          width="100%"
          height="291"
          frameBorder={0}
          scrolling="no"
          style={{
            maxWidth: 560,
            margin: '0 auto 1rem',
            display: 'block',
            background: 'transparent',
            boxShadow: 'none',
          }}
        />

        <p className="font-cinzel text-[0.55rem] tracking-[0.2em] text-smoke uppercase">
          {isES ? 'Sin spam · Cada martes · Baja cuando quieras' : 'No spam · Every Tuesday · Unsubscribe anytime'}
        </p>
      </div>
    </section>
  )
}
