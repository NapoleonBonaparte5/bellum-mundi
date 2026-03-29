// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — COOKIE POLICY PAGE
// ═══════════════════════════════════════════════════════════

import type { Metadata } from 'next'
import type { Lang } from '@/lib/data/types'

interface PageProps {
  params: Promise<{ lang: Lang }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params
  return {
    title: lang === 'en' ? 'Cookie Policy — Bellum Mundi' : 'Política de Cookies — Bellum Mundi',
    robots: { index: false },
  }
}

export default async function CookiesPage({ params }: PageProps) {
  const { lang } = await params
  const isEN = lang === 'en'

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-16">
      <div className="eyebrow mb-4">Legal</div>
      <h1 className="font-playfair font-bold text-cream mb-8" style={{ fontSize: 'clamp(2rem,5vw,3rem)' }}>
        {isEN ? 'Cookie Policy' : 'Política de Cookies'}
      </h1>
      <div className="font-crimson text-mist text-lg space-y-6 leading-relaxed">
        <p className="italic text-smoke">
          {isEN ? 'Last updated: January 2026' : 'Última actualización: enero de 2026'}
        </p>

        <h2 className="font-playfair font-bold text-cream text-2xl mt-8">
          {isEN ? '1. What are cookies?' : '1. ¿Qué son las cookies?'}
        </h2>
        <p>
          {isEN
            ? 'Cookies are small text files stored in your browser that help us remember your preferences and improve your experience on Bellum Mundi.'
            : 'Las cookies son pequeños archivos de texto almacenados en tu navegador que nos ayudan a recordar tus preferencias y mejorar tu experiencia en Bellum Mundi.'
          }
        </p>

        <h2 className="font-playfair font-bold text-cream text-2xl mt-8">
          {isEN ? '2. Cookies we use' : '2. Cookies que usamos'}
        </h2>
        <p>
          {isEN
            ? 'We use essential cookies for authentication (Supabase session), functional cookies to remember your language preference, and analytics cookies via Vercel Analytics (anonymous, no personal data).'
            : 'Usamos cookies esenciales para autenticación (sesión de Supabase), cookies funcionales para recordar tu preferencia de idioma, y cookies de analíticas a través de Vercel Analytics (anónimas, sin datos personales).'
          }
        </p>

        <h2 className="font-playfair font-bold text-cream text-2xl mt-8">
          {isEN ? '3. Third-party cookies' : '3. Cookies de terceros'}
        </h2>
        <p>
          {isEN
            ? 'Stripe may set cookies when you interact with the payment flow. These are strictly necessary for processing payments securely.'
            : 'Stripe puede establecer cookies cuando interactúas con el flujo de pago. Estas son estrictamente necesarias para procesar pagos de forma segura.'
          }
        </p>

        <h2 className="font-playfair font-bold text-cream text-2xl mt-8">
          {isEN ? '4. Managing cookies' : '4. Gestión de cookies'}
        </h2>
        <p>
          {isEN
            ? 'You can control or delete cookies through your browser settings. Note that disabling essential cookies may affect site functionality.'
            : 'Puedes controlar o eliminar las cookies a través de la configuración de tu navegador. Ten en cuenta que deshabilitar las cookies esenciales puede afectar la funcionalidad del sitio.'
          }
        </p>

        <p>
          {isEN ? 'Questions? Contact us at ' : 'Preguntas? Contáctanos en '}
          <a href="mailto:hola@bellummundi.com" className="text-gold hover:text-gold-light transition-colors">
            hola@bellummundi.com
          </a>.
        </p>
      </div>
    </div>
  )
}
