'use client'
// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — VIRTUAL 3D MUSEUM
// Three.js museum with era rooms, weapon pedestals, AI analysis
// ═══════════════════════════════════════════════════════════

import { useEffect, useRef, useState, useCallback } from 'react'
import type { Lang } from '@/lib/data/types'
import type { Weapon } from '@/lib/data/types'
import { processContent } from '@/lib/utils/processContent'

// ── Types ─────────────────────────────────────────────────
interface EraRoomData {
  id: string
  name: string
  years: string
  weapons: Weapon[]
}

interface VirtualMuseumProps {
  lang: Lang
  eraData: EraRoomData[]
}

interface SelectedWeapon {
  weapon: Weapon
  eraId: string
  eraName: string
}

// ── Era color palettes ────────────────────────────────────
const ERA_PALETTE: Record<string, { floor: number; wall: number; pedestal: number; light: number }> = {
  prehistoric:   { floor: 0x3D2B1F, wall: 0x2A1F15, pedestal: 0x5C4033, light: 0xFF8C42 },
  ancient:       { floor: 0x3B3018, wall: 0x2A2210, pedestal: 0x6B5A2A, light: 0xFFD700 },
  classical:     { floor: 0x2C3040, wall: 0x1E2230, pedestal: 0x4A5068, light: 0x9BB5E0 },
  medieval:      { floor: 0x252525, wall: 0x181818, pedestal: 0x404040, light: 0xB8A060 },
  renaissance:   { floor: 0x2E2820, wall: 0x1E1A14, pedestal: 0x5A4A38, light: 0xE8C87A },
  earlymodern:   { floor: 0x1A2030, wall: 0x111520, pedestal: 0x2E3848, light: 0x7090D0 },
  napoleon:      { floor: 0x1E1A28, wall: 0x141018, pedestal: 0x3A3048, light: 0xAA88DD },
  industrial:    { floor: 0x1A1A1A, wall: 0x101010, pedestal: 0x2A2A2A, light: 0xFF6B35 },
  ww1:           { floor: 0x252018, wall: 0x181510, pedestal: 0x403830, light: 0xC8AA70 },
  ww2:           { floor: 0x101818, wall: 0x080F0F, pedestal: 0x1A2828, light: 0x40B040 },
  coldwar:       { floor: 0x0A1020, wall: 0x060A14, pedestal: 0x142030, light: 0x4080FF },
  modern:        { floor: 0x0C0C10, wall: 0x080808, pedestal: 0x181820, light: 0x00CFFF },
}

const DEFAULT_PALETTE = { floor: 0x1A1A1A, wall: 0x111111, pedestal: 0x2A2A2A, light: 0xFFD700 }

// ── Weapon geometry by icon ───────────────────────────────
function getWeaponGeomType(icon: string): 'sword' | 'shield' | 'bow' | 'cannon' | 'gun' | 'bomb' | 'rocket' | 'default' {
  if (['⚔', '🗡️', '🪃'].some(i => icon.includes(i.replace(/️/g,'')))) return 'sword'
  if (icon.includes('🛡')) return 'shield'
  if (['🏹', '🪃'].some(i => icon.includes(i))) return 'bow'
  if (icon.includes('💣')) return 'bomb'
  if (icon.includes('🚀') || icon.includes('✈')) return 'rocket'
  if (['🔫', '🪖'].some(i => icon.includes(i))) return 'gun'
  if (icon.includes('💥') || icon.includes('🎯')) return 'cannon'
  return 'default'
}

// ── Component ─────────────────────────────────────────────
export function VirtualMuseum({ lang, eraData }: VirtualMuseumProps) {
  const isES = lang === 'es'
  const canvasRef = useRef<HTMLDivElement>(null)
  const rendererRef = useRef<unknown>(null)
  const sceneRef = useRef<unknown>(null)
  const cameraRef = useRef<unknown>(null)
  const frameRef = useRef<number>(0)
  const orbitRef = useRef({ theta: 0, phi: 0.6, radius: 14, dragging: false, lastX: 0, lastY: 0 })
  const autoRotRef = useRef(true)
  const autoRotTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [activeEraIdx, setActiveEraIdx] = useState(0)
  const [selected, setSelected] = useState<SelectedWeapon | null>(null)
  const [aiContent, setAiContent] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [tooltip, setTooltip] = useState<{ name: string; x: number; y: number } | null>(null)

  const activeEra = eraData[activeEraIdx]
  const palette = ERA_PALETTE[activeEra?.id ?? ''] ?? DEFAULT_PALETTE

  // ── Build Three.js scene ──────────────────────────────
  useEffect(() => {
    if (!canvasRef.current) return
    const container = canvasRef.current
    let THREE: typeof import('three')
    let cleanup: (() => void) | null = null

    import('three').then(mod => {
      THREE = mod

      // Renderer
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.setSize(container.clientWidth, container.clientHeight)
      renderer.shadowMap.enabled = true
      renderer.shadowMap.type = THREE.PCFSoftShadowMap
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 0.9
      container.appendChild(renderer.domElement)
      rendererRef.current = renderer

      // Scene
      const scene = new THREE.Scene()
      scene.background = new THREE.Color(0x080810)
      scene.fog = new THREE.Fog(0x080810, 18, 40)
      sceneRef.current = scene

      // Camera
      const camera = new THREE.PerspectiveCamera(55, container.clientWidth / container.clientHeight, 0.1, 100)
      camera.position.set(0, 5, 14)
      camera.lookAt(0, 1, 0)
      cameraRef.current = camera

      // ── Floor ──
      const floorGeo = new THREE.CircleGeometry(12, 64)
      const floorMat = new THREE.MeshStandardMaterial({
        color: palette.floor,
        roughness: 0.8,
        metalness: 0.2,
      })
      const floor = new THREE.Mesh(floorGeo, floorMat)
      floor.rotation.x = -Math.PI / 2
      floor.receiveShadow = true
      scene.add(floor)

      // ── Circular wall ──
      const wallGeo = new THREE.CylinderGeometry(11.5, 11.5, 6, 64, 1, true)
      const wallMat = new THREE.MeshStandardMaterial({
        color: palette.wall,
        roughness: 1,
        side: THREE.BackSide,
      })
      const wall = new THREE.Mesh(wallGeo, wallMat)
      wall.position.y = 3
      scene.add(wall)

      // ── Ceiling ring ──
      const ceilGeo = new THREE.RingGeometry(0, 11.5, 64)
      const ceilMat = new THREE.MeshStandardMaterial({ color: 0x050508, roughness: 1 })
      const ceiling = new THREE.Mesh(ceilGeo, ceilMat)
      ceiling.rotation.x = Math.PI / 2
      ceiling.position.y = 6
      scene.add(ceiling)

      // ── Ambient light ──
      const ambient = new THREE.AmbientLight(0x222233, 0.8)
      scene.add(ambient)

      // ── Central chandelier ──
      const centerLight = new THREE.PointLight(palette.light, 1.2, 20, 2)
      centerLight.position.set(0, 5.5, 0)
      centerLight.castShadow = true
      scene.add(centerLight)

      // ── Weapons on pedestals ──
      const weapons = activeEra.weapons
      const count = weapons.length
      const radius = 7
      const pedestalMeshes: Array<{ mesh: import('three').Mesh; weaponIdx: number }> = []

      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2
        const x = Math.sin(angle) * radius
        const z = Math.cos(angle) * radius

        // Pedestal
        const pedGeo = new THREE.CylinderGeometry(0.5, 0.6, 1.2, 16)
        const pedMat = new THREE.MeshStandardMaterial({
          color: palette.pedestal,
          roughness: 0.6,
          metalness: 0.4,
        })
        const pedestal = new THREE.Mesh(pedGeo, pedMat)
        pedestal.position.set(x, 0.6, z)
        pedestal.castShadow = true
        pedestal.receiveShadow = true
        pedestal.userData = { weaponIdx: i }
        scene.add(pedestal)
        pedestalMeshes.push({ mesh: pedestal, weaponIdx: i })

        // Pedestal top plate
        const plateGeo = new THREE.CylinderGeometry(0.52, 0.52, 0.08, 16)
        const plateMat = new THREE.MeshStandardMaterial({ color: 0xB8A060, roughness: 0.3, metalness: 0.8 })
        const plate = new THREE.Mesh(plateGeo, plateMat)
        plate.position.set(x, 1.24, z)
        scene.add(plate)

        // Weapon display object
        const geomType = getWeaponGeomType(weapons[i].icon)
        let wGeo: import('three').BufferGeometry
        let wMat: import('three').MeshStandardMaterial

        if (geomType === 'sword') {
          wGeo = new THREE.BoxGeometry(0.08, 0.9, 0.08)
        } else if (geomType === 'shield') {
          wGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.08, 20)
        } else if (geomType === 'bow') {
          wGeo = new THREE.TorusGeometry(0.3, 0.05, 8, 20, Math.PI)
        } else if (geomType === 'bomb') {
          wGeo = new THREE.SphereGeometry(0.25, 16, 16)
        } else if (geomType === 'rocket') {
          wGeo = new THREE.ConeGeometry(0.15, 0.7, 8)
        } else if (geomType === 'cannon') {
          wGeo = new THREE.CylinderGeometry(0.12, 0.16, 0.7, 12)
        } else if (geomType === 'gun') {
          wGeo = new THREE.BoxGeometry(0.12, 0.5, 0.1)
        } else {
          wGeo = new THREE.OctahedronGeometry(0.28)
        }

        wMat = new THREE.MeshStandardMaterial({
          color: 0xC8A840,
          roughness: 0.3,
          metalness: 0.85,
        })
        const wMesh = new THREE.Mesh(wGeo, wMat)
        wMesh.position.set(x, 1.9, z)
        wMesh.castShadow = true
        wMesh.userData = { weaponIdx: i }
        scene.add(wMesh)

        // Spotlight for each weapon
        const spot = new THREE.SpotLight(palette.light, 1.5, 8, Math.PI / 8, 0.4)
        spot.position.set(x * 0.6, 5.8, z * 0.6)
        spot.target.position.set(x, 1.5, z)
        spot.castShadow = false
        scene.add(spot)
        scene.add(spot.target)

        // Name label plane (decorative gold ring on floor)
        const ringGeo = new THREE.RingGeometry(0.62, 0.7, 32)
        const ringMat = new THREE.MeshStandardMaterial({ color: 0xB8A060, roughness: 0.4, metalness: 0.6 })
        const ring = new THREE.Mesh(ringGeo, ringMat)
        ring.rotation.x = -Math.PI / 2
        ring.position.set(x, 0.01, z)
        scene.add(ring)
      }

      // ── Era name arch sign ──
      // (Decorative central column)
      const colGeo = new THREE.CylinderGeometry(0.3, 0.35, 4, 12)
      const colMat = new THREE.MeshStandardMaterial({ color: palette.pedestal, roughness: 0.5, metalness: 0.5 })
      const col = new THREE.Mesh(colGeo, colMat)
      col.position.set(0, 2, 0)
      col.castShadow = true
      scene.add(col)

      // ── Raycaster for click/hover ──
      const raycaster = new THREE.Raycaster()
      const mouse = new THREE.Vector2()

      const getClickObjects = () => {
        const objs: import('three').Object3D[] = []
        scene.traverse(obj => {
          if (obj.userData?.weaponIdx !== undefined) objs.push(obj)
        })
        return objs
      }

      // Pointer move → tooltip
      const onMouseMove = (e: MouseEvent) => {
        const rect = renderer.domElement.getBoundingClientRect()
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
        raycaster.setFromCamera(mouse, camera)
        const hits = raycaster.intersectObjects(getClickObjects())
        if (hits.length > 0) {
          const idx = hits[0].object.userData.weaponIdx as number
          setTooltip({ name: weapons[idx]?.name ?? '', x: e.clientX - rect.left, y: e.clientY - rect.top })
          renderer.domElement.style.cursor = 'pointer'
        } else {
          setTooltip(null)
          renderer.domElement.style.cursor = 'grab'
        }
      }

      // Click → select weapon
      const onClick = (e: MouseEvent) => {
        const rect = renderer.domElement.getBoundingClientRect()
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
        raycaster.setFromCamera(mouse, camera)
        const hits = raycaster.intersectObjects(getClickObjects())
        if (hits.length > 0) {
          const idx = hits[0].object.userData.weaponIdx as number
          setSelected({ weapon: weapons[idx], eraId: activeEra.id, eraName: activeEra.name })
          setAiContent('')
        }
      }

      // ── Orbit controls ──
      const onMouseDown = (e: MouseEvent) => {
        if (e.button === 0) {
          orbitRef.current.dragging = true
          orbitRef.current.lastX = e.clientX
          orbitRef.current.lastY = e.clientY
          autoRotRef.current = false
          if (autoRotTimerRef.current) clearTimeout(autoRotTimerRef.current)
          renderer.domElement.style.cursor = 'grabbing'
        }
      }
      const onMouseUp = () => {
        orbitRef.current.dragging = false
        renderer.domElement.style.cursor = 'grab'
        // Resume auto-rotate after 3s
        if (autoRotTimerRef.current) clearTimeout(autoRotTimerRef.current)
        autoRotTimerRef.current = setTimeout(() => { autoRotRef.current = true }, 3000)
      }
      const onMouseDrag = (e: MouseEvent) => {
        if (!orbitRef.current.dragging) return
        const dx = e.clientX - orbitRef.current.lastX
        const dy = e.clientY - orbitRef.current.lastY
        orbitRef.current.theta -= dx * 0.008
        orbitRef.current.phi = Math.max(0.1, Math.min(1.4, orbitRef.current.phi + dy * 0.006))
        orbitRef.current.lastX = e.clientX
        orbitRef.current.lastY = e.clientY
      }
      const onWheel = (e: WheelEvent) => {
        e.preventDefault()
        orbitRef.current.radius = Math.max(5, Math.min(22, orbitRef.current.radius + e.deltaY * 0.02))
        autoRotRef.current = false
        if (autoRotTimerRef.current) clearTimeout(autoRotTimerRef.current)
        autoRotTimerRef.current = setTimeout(() => { autoRotRef.current = true }, 3000)
      }

      renderer.domElement.addEventListener('mousedown', onMouseDown)
      renderer.domElement.addEventListener('mouseup', onMouseUp)
      renderer.domElement.addEventListener('mousemove', onMouseDrag)
      renderer.domElement.addEventListener('mousemove', onMouseMove)
      renderer.domElement.addEventListener('wheel', onWheel, { passive: false })
      renderer.domElement.addEventListener('click', onClick)
      renderer.domElement.style.cursor = 'grab'

      // ── Animation floating for weapon meshes ──
      let t = 0

      // ── RAF loop ──
      const animate = () => {
        frameRef.current = requestAnimationFrame(animate)
        t += 0.016

        // Auto rotate
        if (autoRotRef.current) {
          orbitRef.current.theta += 0.003
        }

        // Update camera from spherical
        const { theta, phi, radius } = orbitRef.current
        camera.position.x = radius * Math.sin(phi) * Math.sin(theta)
        camera.position.y = radius * Math.cos(phi)
        camera.position.z = radius * Math.sin(phi) * Math.cos(theta)
        camera.lookAt(0, 1.5, 0)

        // Float weapon meshes gently
        scene.traverse(obj => {
          if (obj.userData?.weaponIdx !== undefined && (obj as import('three').Mesh).geometry) {
            const idx = obj.userData.weaponIdx as number
            const base = 1.9
            ;(obj as import('three').Mesh).position.y = base + Math.sin(t * 0.8 + idx * 0.9) * 0.06
            ;(obj as import('three').Mesh).rotation.y += 0.01
          }
        })

        // Pulse center light
        centerLight.intensity = 1.0 + Math.sin(t * 1.2) * 0.2

        renderer.render(scene, camera)
      }
      animate()

      // ── Resize ──
      const onResize = () => {
        if (!container) return
        camera.aspect = container.clientWidth / container.clientHeight
        camera.updateProjectionMatrix()
        renderer.setSize(container.clientWidth, container.clientHeight)
      }
      window.addEventListener('resize', onResize)

      cleanup = () => {
        cancelAnimationFrame(frameRef.current)
        window.removeEventListener('resize', onResize)
        renderer.domElement.removeEventListener('mousedown', onMouseDown)
        renderer.domElement.removeEventListener('mouseup', onMouseUp)
        renderer.domElement.removeEventListener('mousemove', onMouseDrag)
        renderer.domElement.removeEventListener('mousemove', onMouseMove)
        renderer.domElement.removeEventListener('wheel', onWheel)
        renderer.domElement.removeEventListener('click', onClick)
        renderer.dispose()
        if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement)
        if (autoRotTimerRef.current) clearTimeout(autoRotTimerRef.current)
      }
    })

    return () => { cleanup?.() }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeEraIdx])

  // ── AI Analysis for selected weapon ──
  const runAI = useCallback(async (weapon: Weapon, eraName: string) => {
    if (aiLoading) return
    setAiLoading(true)
    setAiContent('')

    const prompt = isES
      ? `Eres un curador de museo militar experto. Analiza este artefacto histórico:\n\nArma: "${weapon.name}"\nEra: ${eraName}\nIcono: ${weapon.icon}\n\nProporciona:\n1. Historia y origen\n2. Materiales y fabricación\n3. Uso en combate e impacto táctico\n4. Importancia histórica y legado\n\nSé detallado y apasionado como un curador de museo.`
      : `You are an expert military museum curator. Analyze this historical artifact:\n\nWeapon: "${weapon.name}"\nEra: ${eraName}\nIcon: ${weapon.icon}\n\nProvide:\n1. History and origin\n2. Materials and craftsmanship\n3. Combat use and tactical impact\n4. Historical significance and legacy\n\nBe detailed and passionate like a museum curator.`

    try {
      const res = await fetch('/api/ai-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: prompt, lang }),
      })
      if (!res.ok || !res.body) { setAiLoading(false); return }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let raw = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        raw += decoder.decode(value, { stream: true })
        setAiContent(processContent(raw))
      }
    } catch { /* silent */ } finally {
      setAiLoading(false)
    }
  }, [lang, isES, aiLoading])

  const handleSelectWeapon = (weapon: Weapon) => {
    setSelected({ weapon, eraId: activeEra.id, eraName: activeEra.name })
    setAiContent('')
  }

  return (
    <div className="min-h-screen bg-ink flex flex-col">

      {/* ── Header ── */}
      <div className="border-b border-gold/20 px-6 py-4 flex items-center justify-between">
        <div>
          <p className="font-cinzel text-[0.5rem] tracking-[0.3em] text-gold/60 uppercase mb-0.5">
            {isES ? 'Bellum Mundi — Museo Virtual' : 'Bellum Mundi — Virtual Museum'}
          </p>
          <h1 className="font-cinzel text-gold font-bold text-lg tracking-widest">
            {isES ? '🏛️ Museo Militar 3D' : '🏛️ 3D Military Museum'}
          </h1>
        </div>
        <p className="font-crimson text-smoke text-sm hidden md:block max-w-xs text-right">
          {isES
            ? 'Explora armas históricas en salas 3D. Haz clic en cualquier artefacto para análisis con IA.'
            : 'Explore historical weapons in 3D rooms. Click any artifact for AI analysis.'}
        </p>
      </div>

      {/* ── Era tabs ── */}
      <div className="border-b border-gold/15 px-4 overflow-x-auto">
        <div className="flex gap-0 min-w-max">
          {eraData.map((era, i) => (
            <button
              key={era.id}
              onClick={() => { setActiveEraIdx(i); setSelected(null); setAiContent('') }}
              className={`font-cinzel text-[0.55rem] tracking-[0.15em] uppercase px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                i === activeEraIdx
                  ? 'border-gold text-gold'
                  : 'border-transparent text-smoke hover:text-mist hover:border-gold/30'
              }`}
            >
              {era.name}
            </button>
          ))}
        </div>
      </div>

      {/* ── Main layout ── */}
      <div className="flex flex-1 overflow-hidden" style={{ minHeight: 0 }}>

        {/* ── 3D Canvas ── */}
        <div className="relative flex-1" style={{ minHeight: 520 }}>
          <div ref={canvasRef} className="absolute inset-0" />

          {/* Era overlay info */}
          <div className="absolute top-4 left-4 pointer-events-none">
            <div className="bg-ink/80 border border-gold/20 px-3 py-2 backdrop-blur-sm">
              <p className="font-cinzel text-gold text-xs tracking-widest">{activeEra.name}</p>
              <p className="font-crimson text-smoke text-xs">{activeEra.years}</p>
              <p className="font-crimson text-smoke/60 text-xs mt-0.5">
                {activeEra.weapons.length} {isES ? 'artefactos' : 'artifacts'}
              </p>
            </div>
          </div>

          {/* Controls hint */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none">
            <p className="font-cinzel text-[0.45rem] tracking-[0.2em] text-smoke/40 uppercase">
              {isES
                ? '← arrastra para rotar · rueda para zoom · clic en artefacto →'
                : '← drag to rotate · scroll to zoom · click artifact →'}
            </p>
          </div>

          {/* Tooltip */}
          {tooltip && (
            <div
              className="absolute pointer-events-none z-10 bg-ink/95 border border-gold/40 px-3 py-1.5 backdrop-blur-sm"
              style={{ left: tooltip.x + 12, top: tooltip.y - 10 }}
            >
              <p className="font-cinzel text-gold text-[0.6rem] tracking-wider">{tooltip.name}</p>
              <p className="font-crimson text-smoke/70 text-[0.65rem]">
                {isES ? 'Clic para analizar' : 'Click to analyze'}
              </p>
            </div>
          )}
        </div>

        {/* ── Side panel ── */}
        <div className="w-80 flex-shrink-0 border-l border-gold/15 flex flex-col overflow-hidden bg-slate">

          {/* Weapon list */}
          <div className="flex-shrink-0 border-b border-gold/15 overflow-y-auto" style={{ maxHeight: 280 }}>
            <div className="px-4 py-3 border-b border-gold/10">
              <p className="font-cinzel text-[0.5rem] tracking-[0.25em] text-gold/60 uppercase">
                {isES ? 'Artefactos en esta sala' : 'Artifacts in this room'}
              </p>
            </div>
            {activeEra.weapons.map((w, i) => (
              <button
                key={i}
                onClick={() => handleSelectWeapon(w)}
                className={`w-full text-left px-4 py-2.5 border-b border-gold/5 last:border-0 transition-colors flex items-center gap-3 ${
                  selected?.weapon.name === w.name
                    ? 'bg-gold/10 border-l-2 border-l-gold'
                    : 'hover:bg-gold/5'
                }`}
              >
                <span className="text-lg flex-shrink-0">{w.icon}</span>
                <div className="min-w-0">
                  <p className="font-cinzel text-[0.6rem] tracking-wider text-mist uppercase truncate">{w.name}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Analysis panel */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {selected ? (
              <>
                <div className="px-4 py-3 border-b border-gold/10 flex items-start gap-3 flex-shrink-0">
                  <span className="text-2xl flex-shrink-0 mt-0.5">{selected.weapon.icon}</span>
                  <div className="min-w-0">
                    <p className="font-cinzel text-gold text-xs tracking-wider font-bold">{selected.weapon.name}</p>
                    <p className="font-crimson text-smoke/70 text-xs">{selected.eraName}</p>
                  </div>
                </div>

                {!aiContent && !aiLoading && (
                  <div className="px-4 py-4 flex-shrink-0">
                    <button
                      onClick={() => runAI(selected.weapon, selected.eraName)}
                      className="w-full border border-gold/30 text-gold font-cinzel text-[0.55rem] tracking-[0.2em] uppercase px-4 py-3 hover:bg-gold/10 transition-colors"
                    >
                      {isES ? '✦ Analizar con IA' : '✦ Analyze with AI'}
                    </button>
                  </div>
                )}

                {aiLoading && (
                  <div className="px-4 py-6 flex items-center gap-3 flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-gold animate-bounce" />
                    <div className="w-2 h-2 rounded-full bg-gold animate-bounce [animation-delay:0.15s]" />
                    <div className="w-2 h-2 rounded-full bg-gold animate-bounce [animation-delay:0.3s]" />
                    <span className="font-cinzel text-[0.5rem] tracking-widest text-smoke/60 uppercase ml-1">
                      {isES ? 'Analizando artefacto...' : 'Analyzing artifact...'}
                    </span>
                  </div>
                )}

                {aiContent && (
                  <div className="flex-1 overflow-y-auto px-4 py-3">
                    <div
                      className="ai-content font-crimson text-smoke text-sm leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: aiContent }}
                    />
                    <button
                      onClick={() => { setAiContent(''); runAI(selected.weapon, selected.eraName) }}
                      className="mt-4 font-cinzel text-[0.45rem] tracking-[0.2em] text-smoke/40 hover:text-gold uppercase transition-colors"
                    >
                      {isES ? '↻ Regenerar' : '↻ Regenerate'}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
                <span className="text-4xl mb-4 opacity-30">🏛️</span>
                <p className="font-cinzel text-[0.55rem] tracking-[0.2em] text-smoke/40 uppercase">
                  {isES
                    ? 'Haz clic en un artefacto en la galería 3D o selecciona uno de la lista'
                    : 'Click an artifact in the 3D gallery or select one from the list'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
