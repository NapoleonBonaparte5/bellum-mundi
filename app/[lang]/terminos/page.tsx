// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — TERMS OF USE PAGE
// ═══════════════════════════════════════════════════════════

import type { Metadata } from 'next'
import type { Lang } from '@/lib/data/types'

interface PageProps {
  params: Promise<{ lang: Lang }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params
  return {
    title: lang === 'en' ? 'Terms of Use — Bellum Mundi' : 'Términos de Uso — Bellum Mundi',
    robots: { index: false },
  }
}

export default async function TermsPage({ params }: PageProps) {
  const { lang } = await params
  const isEN = lang === 'en'

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-16">
      <div className="eyebrow mb-4">Legal</div>
      <h1 className="font-playfair font-bold text-cream mb-8" style={{ fontSize: 'clamp(2rem,5vw,3rem)' }}>
        {isEN ? 'Terms of Use' : 'Términos de Uso'}
      </h1>
      <div className="font-crimson text-mist text-lg space-y-6 leading-relaxed">
        <p className="italic text-smoke">
          {isEN ? 'Last updated: January 2026' : 'Última actualización: enero de 2026'}
        </p>

        <h2 className="font-playfair font-bold text-cream text-2xl mt-8">
          {isEN ? '1. Acceptance of Terms' : '1. Aceptación de los términos'}
        </h2>
        <p>
          {isEN
            ? 'By accessing Bellum Mundi, you agree to these Terms of Use. If you do not agree, please do not use the service.'
            : 'Al acceder a Bellum Mundi, aceptas estos Términos de Uso. Si no estás de acuerdo, por favor no uses el servicio.'
          }
        </p>

        <h2 className="font-playfair font-bold text-cream text-2xl mt-8">
          {isEN ? '2. Use of Content' : '2. Uso del contenido'}
        </h2>
        <p>
          {isEN
            ? 'All content on Bellum Mundi is for personal, non-commercial use unless you hold an Educator or Institutional plan. Reproduction or redistribution without permission is prohibited.'
            : 'Todo el contenido de Bellum Mundi es para uso personal y no comercial, a menos que dispongas de un plan Educador o Institucional. La reproducción o redistribución sin permiso está prohibida.'
          }
        </p>

        <h2 className="font-playfair font-bold text-cream text-2xl mt-8">
          {isEN ? '3. Subscriptions & Payments' : '3. Suscripciones y pagos'}
        </h2>
        <p>
          {isEN
            ? 'Premium subscriptions are billed monthly or annually via Stripe. You may cancel at any time; access continues until the end of the billing period. Refunds are handled on a case-by-case basis — contact us at hola@bellummundi.com.'
            : 'Las suscripciones premium se facturan mensual o anualmente a través de Stripe. Puedes cancelar en cualquier momento; el acceso continúa hasta el final del período de facturación. Los reembolsos se gestionan caso por caso — contáctanos en hola@bellummundi.com.'
          }
        </p>

        <h2 className="font-playfair font-bold text-cream text-2xl mt-8">
          {isEN ? '4. Limitation of Liability' : '4. Limitación de responsabilidad'}
        </h2>
        <p>
          {isEN
            ? 'Bellum Mundi provides historical information for educational purposes. We do not guarantee the completeness or accuracy of all data. AI-generated content may contain errors.'
            : 'Bellum Mundi proporciona información histórica con fines educativos. No garantizamos la completitud ni exactitud de todos los datos. El contenido generado por IA puede contener errores.'
          }
        </p>

        <h2 className="font-playfair font-bold text-cream text-2xl mt-8">
          {isEN ? '5. Contact' : '5. Contacto'}
        </h2>
        <p>
          {isEN ? 'Questions about these terms? Contact us at ' : 'Preguntas sobre estos términos? Contáctanos en '}
          <a href="mailto:hola@bellummundi.com" className="text-gold hover:text-gold-light transition-colors">
            hola@bellummundi.com
          </a>.
        </p>
      </div>
    </div>
  )
}
