// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — PRIVACY POLICY PAGE
// ═══════════════════════════════════════════════════════════

import type { Metadata } from 'next'
import type { Lang } from '@/lib/data/types'

interface PageProps {
  params: Promise<{ lang: Lang }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params
  return {
    title: lang === 'en' ? 'Privacy Policy — Bellum Mundi' : 'Política de Privacidad — Bellum Mundi',
    robots: { index: false },
  }
}

export default async function PrivacyPage({ params }: PageProps) {
  const { lang } = await params
  const isEN = lang === 'en'

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-16">
      <div className="eyebrow mb-4">Legal</div>
      <h1 className="font-playfair font-bold text-cream mb-8" style={{ fontSize: 'clamp(2rem,5vw,3rem)' }}>
        {isEN ? 'Privacy Policy' : 'Política de Privacidad'}
      </h1>
      <div className="font-crimson text-mist text-lg space-y-6 leading-relaxed">
        <p className="italic text-smoke">
          {isEN ? 'Last updated: January 2026' : 'Última actualización: enero de 2026'}
        </p>

        <h2 className="font-playfair font-bold text-cream text-2xl mt-8">
          {isEN ? '1. Data We Collect' : '1. Datos que recopilamos'}
        </h2>
        <p>
          {isEN
            ? 'Bellum Mundi collects email addresses for account creation and newsletter subscriptions, anonymous usage data for analytics (via Vercel Analytics), and payment information processed exclusively by Stripe — we never store card details.'
            : 'Bellum Mundi recopila direcciones de email para la creación de cuentas y suscripciones al newsletter, datos de uso anónimos para analíticas (a través de Vercel Analytics), e información de pago procesada exclusivamente por Stripe — nunca almacenamos datos de tarjetas.'
          }
        </p>

        <h2 className="font-playfair font-bold text-cream text-2xl mt-8">
          {isEN ? '2. How We Use Your Data' : '2. Cómo usamos tus datos'}
        </h2>
        <p>
          {isEN
            ? 'Your data is used solely to provide and improve the Bellum Mundi service. We do not sell or share personal data with third parties for marketing purposes.'
            : 'Tus datos se usan exclusivamente para proporcionar y mejorar el servicio de Bellum Mundi. No vendemos ni compartimos datos personales con terceros con fines de marketing.'
          }
        </p>

        <h2 className="font-playfair font-bold text-cream text-2xl mt-8">
          {isEN ? '3. Third-Party Services' : '3. Servicios de terceros'}
        </h2>
        <p>
          {isEN
            ? 'We use Supabase for authentication and data storage, Stripe for payments, and Anthropic\'s API for AI features. Each service is governed by its own privacy policy.'
            : 'Usamos Supabase para autenticación y almacenamiento de datos, Stripe para pagos y la API de Anthropic para las funciones de IA. Cada servicio se rige por su propia política de privacidad.'
          }
        </p>

        <h2 className="font-playfair font-bold text-cream text-2xl mt-8">
          {isEN ? '4. Your Rights' : '4. Tus derechos'}
        </h2>
        <p>
          {isEN
            ? 'You may request access, correction, or deletion of your personal data at any time by contacting us at '
            : 'Puedes solicitar acceso, corrección o eliminación de tus datos personales en cualquier momento contactándonos en '
          }
          <a href="mailto:hola@bellummundi.com" className="text-gold hover:text-gold-light transition-colors">
            hola@bellummundi.com
          </a>.
        </p>
      </div>
    </div>
  )
}
