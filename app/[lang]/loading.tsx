// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — LOADING SKELETON
// app/[lang]/loading.tsx — shown during page navigation
// ═══════════════════════════════════════════════════════════

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 animate-pulse">
      {/* Page title skeleton */}
      <div className="mb-10">
        <div className="h-2 w-32 bg-gold/20 rounded mb-4" />
        <div className="h-10 w-64 bg-cream/10 rounded mb-3" />
        <div className="h-4 w-96 max-w-full bg-smoke/20 rounded" />
      </div>

      {/* Filter chips skeleton */}
      <div className="flex gap-2 mb-6 overflow-hidden">
        {[120, 90, 110, 80, 100].map((w, i) => (
          <div key={i} className="h-7 bg-gold/10 rounded-full flex-shrink-0" style={{ width: w }} />
        ))}
      </div>

      {/* Grid skeleton — 3 columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="border border-gold/10 bg-slate/30 p-5 rounded-sm min-h-[160px]">
            <div className="h-3 w-3/4 bg-cream/10 rounded mb-3" />
            <div className="h-2 w-1/2 bg-smoke/15 rounded mb-2" />
            <div className="h-2 w-2/3 bg-smoke/10 rounded mb-4" />
            <div className="h-2 w-1/3 bg-gold/10 rounded mt-auto" />
          </div>
        ))}
      </div>
    </div>
  )
}
