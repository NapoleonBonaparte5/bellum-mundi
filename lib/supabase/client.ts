// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — SUPABASE CLIENT
// ═══════════════════════════════════════════════════════════

import { createClient } from '@supabase/supabase-js'

// Fallbacks prevent crashes during SSG when env vars are absent at build time.
// Auth calls only run client-side (inside useEffect), so this is safe.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder-anon-key'
)

// ── DATABASE TYPES (expandable as we migrate to real DB) ───
export type PlanType = 'free' | 'premium' | 'educator' | 'institutional'

export interface DbProfile {
  id: string
  name: string
  plan: PlanType
  created_at: string
}

/** Returns true for any paid plan. Use instead of `plan === 'premium'` checks. */
export function isPremiumPlan(plan: string): boolean {
  return plan === 'premium' || plan === 'educator' || plan === 'institutional'
}

export interface DbNewsletterSubscriber {
  id: string
  email: string
  created_at: string
}

// ── AUTH HELPERS ───────────────────────────────────────────
export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export async function getUserProfile(userId: string): Promise<DbProfile | null> {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  return data
}

export async function signIn(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password })
}

export async function signUp(email: string, password: string) {
  return supabase.auth.signUp({ email, password })
}

export async function signOut() {
  return supabase.auth.signOut()
}

export async function subscribeToNewsletter(email: string) {
  return supabase.from('newsletter_subscribers').insert({ email })
}

