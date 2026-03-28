'use client'
// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — VIRTUAL 3D MUSEUM (v2 — full-screen)
// Full-screen Three.js museum with collapsible left sidebar,
// floating right panel, immersive mode, touch controls
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
  const canvasRef  = useRef<HTMLDivElement>(null)
  const rendererRef = useRef<unknown>(null)
  const sceneRef   = useRef<unknown>(null)
  const cameraRef  = useRef<unknown>(null)
  const frameRef   = useRef<number>(0)
  const orbitRef   = useRef({ theta: 0, phi: 0.6, radius: 14, dragging: false, lastX: 0, lastY: 0 })
  const autoRotRef = useRef(true)
  const autoRotTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Touch refs
  const touchRef   = useRef({ touches: 0, lastDist: 0, lastX: 0, lastY: 0 })

  const [activeEraIdx, setActiveEraIdx] = useState(0)
  const [selected, setSelected]         = useState<SelectedWeapon | null>(null)
  const [aiContent, setAiContent]       = useState('')
  const [aiLoading, setAiLoading]       = useState(false)
  const [tooltip, setTooltip]           = useState<{ name: string; x: number; y: number } | null>(null)
  // New BLOQUE 3 state
  const [leftOpen, setLeftOpen]         = useState(true)
  const [immersive, setImmersive]       = useState(false)

  const activeEra = eraData[activeEraIdx]
  const palette   = ERA_PALETTE[activeEra?.id ?? ''] ?? DEFAULT_PALETTE

  // ── Build Three.js scene ──────────────────────────────
  useEffect(() => {
    if (!canvasRef.current) return
    const container = canvasRef.current
    let cleanup: (() => void) | null = null

    import('three').then(mod => {
      const THREE = mod

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
      const floorMat = new THREE.MeshStandardMaterial({ color: palette.floor, roughness: 0.8, metalness: 0.2 })
      const floor = new THREE.Mesh(floorGeo, floorMat)
      floor.rotation.x = -Math.PI / 2
      floor.receiveShadow = true
      scene.add(floor)

      // ── Circular wall ──
      const wallGeo = new THREE.CylinderGeometry(11.5, 11.5, 6, 64, 1, true)
      const wallMat = new THREE.MeshStandardMaterial({ color: palette.wall, roughness: 1, side: THREE.BackSide })
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

      // ── Lights ──
      const ambient = new THREE.AmbientLight(0x222233, 0.8)
      scene.add(ambient)
      const centerLight = new THREE.PointLight(palette.light, 1.2, 20, 2)
      centerLight.position.set(0, 5.5, 0)
      centerLight.castShadow = true
      scene.add(centerLight)

      // ── Weapons on pedestals ──
      const weapons = activeEra.weapons
      const count = weapons.length
      const radius = 7

      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2
        const x = Math.sin(angle) * radius
        const z = Math.cos(angle) * radius

        const pedGeo = new THREE.CylinderGeometry(0.5, 0.6, 1.2, 16)
        const pedMat = new THREE.MeshStandardMaterial({ color: palette.pedestal, roughness: 0.6, metalness: 0.4 })
        const pedestal = new THREE.Mesh(pedGeo, pedMat)
        pedestal.position.set(x, 0.6, z)
        pedestal.castShadow = true
        pedestal.receiveShadow = true
        pedestal.userData = { weaponIdx: i }
        scene.add(pedestal)

        const plateGeo = new THREE.CylinderGeometry(0.52, 0.52, 0.08, 16)
        const plateMat = new THREE.MeshStandardMaterial({ color: 0xB8A060, roughness: 0.3, metalness: 0.8 })
        const plate = new THREE.Mesh(plateGeo, plateMat)
        plate.position.set(x, 1.24, z)
        scene.add(plate)

        const geomType = getWeaponGeomType(weapons[i].icon)
        let wGeo: import('three').BufferGeometry
        if      (geomType === 'sword')  wGeo = new THREE.BoxGeometry(0.08, 0.9, 0.08)
        else if (geomType === 'shield') wGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.08, 20)
        else if (geomType === 'bow')    wGeo = new THREE.TorusGeometry(0.3, 0.05, 8, 20, Math.PI)
        else if (geomType === 'bomb')   wGeo = new THREE.SphereGeometry(0.25, 16, 16)
        else if (geomType === 'rocket') wGeo = new THREE.ConeGeometry(0.15, 0.7, 8)
        else if (geomType === 'cannon') wGeo = new THREE.CylinderGeometry(0.12, 0.16, 0.7, 12)
        else if (geomType === 'gun')    wGeo = new THREE.BoxGeometry(0.12, 0.5, 0.1)
        else                            wGeo = new THREE.OctahedronGeometry(0.28)

        const wMat = new THREE.MeshStandardMaterial({ color: 0xC8A840, roughness: 0.3, metalness: 0.85 })
        const wMesh = new THREE.Mesh(wGeo, wMat)
        wMesh.position.set(x, 1.9, z)
        wMesh.castShadow = true
        wMesh.userData = { weaponIdx: i }
        scene.add(wMesh)

        const spot = new THREE.SpotLight(palette.light, 1.5, 8, Math.PI / 8, 0.4)
        spot.position.set(x * 0.6, 5.8, z * 0.6)
        spot.target.position.set(x, 1.5, z)
        spot.castShadow = false
        scene.add(spot)
        scene.add(spot.target)

        const ringGeo = new THREE.RingGeometry(0.62, 0.7, 32)
        const ringMat = new THREE.MeshStandardMaterial({ color: 0xB8A060, roughness: 0.4, metalness: 0.6 })
        const ring = new THREE.Mesh(ringGeo, ringMat)
        ring.rotation.x = -Math.PI / 2
        ring.position.set(x, 0.01, z)
        scene.add(ring)
      }

      // Central column
      const colGeo = new THREE.CylinderGeometry(0.3, 0.35, 4, 12)
      const colMat = new THREE.MeshStandardMaterial({ color: palette.pedestal, roughness: 0.5, metalness: 0.5 })
      const col = new THREE.Mesh(colGeo, colMat)
      col.position.set(0, 2, 0)
      col.castShadow = true
      scene.add(col)

      // ── Raycaster ──
      const raycaster = new THREE.Raycaster()
      const mouse = new THREE.Vector2()
      const getClickObjects = () => {
        const objs: import('three').Object3D[] = []
        scene.traverse(obj => { if (obj.userData?.weaponIdx !== undefined) objs.push(obj) })
        return objs
      }

      // Mouse events
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

      // ── Touch controls ──
      const onTouchStart = (e: TouchEvent) => {
        e.preventDefault()
        autoRotRef.current = false
        if (autoRotTimerRef.current) clearTimeout(autoRotTimerRef.current)
        touchRef.current.touches = e.touches.length
        if (e.touches.length === 1) {
          touchRef.current.lastX = e.touches[0].clientX
          touchRef.current.lastY = e.touches[0].clientY
          orbitRef.current.dragging = true
        } else if (e.touches.length === 2) {
          orbitRef.current.dragging = false
          touchRef.current.lastDist = Math.hypot(
            e.touches[1].clientX - e.touches[0].clientX,
            e.touches[1].clientY - e.touches[0].clientY,
          )
        }
      }
      const onTouchMove = (e: TouchEvent) => {
        e.preventDefault()
        if (e.touches.length === 1 && orbitRef.current.dragging) {
          const dx = e.touches[0].clientX - touchRef.current.lastX
          const dy = e.touches[0].clientY - touchRef.current.lastY
          orbitRef.current.theta -= dx * 0.008
          orbitRef.current.phi = Math.max(0.1, Math.min(1.4, orbitRef.current.phi + dy * 0.006))
          touchRef.current.lastX = e.touches[0].clientX
          touchRef.current.lastY = e.touches[0].clientY
        } else if (e.touches.length === 2) {
          const dist = Math.hypot(
            e.touches[1].clientX - e.touches[0].clientX,
            e.touches[1].clientY - e.touches[0].clientY,
          )
          const delta = touchRef.current.lastDist - dist
          orbitRef.current.radius = Math.max(5, Math.min(22, orbitRef.current.radius + delta * 0.04))
          touchRef.current.lastDist = dist
        }
      }
      const onTouchEnd = (e: TouchEvent) => {
        e.preventDefault()
        orbitRef.current.dragging = false
        touchRef.current.touches = e.touches.length
        autoRotTimerRef.current = setTimeout(() => { autoRotRef.current = true }, 3000)
      }

      renderer.domElement.addEventListener('mousedown', onMouseDown)
      renderer.domElement.addEventListener('mouseup', onMouseUp)
      renderer.domElement.addEventListener('mousemove', onMouseDrag)
      renderer.domElement.addEventListener('mousemove', onMouseMove)
      renderer.domElement.addEventListener('wheel', onWheel, { passive: false })
      renderer.domElement.addEventListener('click', onClick)
      renderer.domElement.addEventListener('touchstart', onTouchStart, { passive: false })
      renderer.domElement.addEventListener('touchmove', onTouchMove, { passive: false })
      renderer.domElement.addEventListener('touchend', onTouchEnd, { passive: false })
      renderer.domElement.style.cursor = 'grab'

      // ── RAF loop ──
      let t = 0
      const animate = () => {
        frameRef.current = requestAnimationFrame(animate)
        t += 0.016
        if (autoRotRef.current) orbitRef.current.theta += 0.003
        const { theta, phi, radius } = orbitRef.current
        camera.position.x = radius * Math.sin(phi) * Math.sin(theta)
        camera.position.y = radius * Math.cos(phi)
        camera.position.z = radius * Math.sin(phi) * Math.cos(theta)
        camera.lookAt(0, 1.5, 0)
        scene.traverse(obj => {
          if (obj.userData?.weaponIdx !== undefined && (obj as import('three').Mesh).geometry) {
            const idx = obj.userData.weaponIdx as number
            ;(obj as import('three').Mesh).position.y = 1.9 + Math.sin(t * 0.8 + idx * 0.9) * 0.06
            ;(obj as import('three').Mesh).rotation.y += 0.01
          }
        })
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
        renderer.domElement.removeEventListener('touchstart', onTouchStart)
        renderer.domElement.removeEventListener('touchmove', onTouchMove)
        renderer.domElement.removeEventListener('touchend', onTouchEnd)
        renderer.dispose()
        if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement)
        if (autoRotTimerRef.current) clearTimeout(autoRotTimerRef.current)
      }
    })

    return () => { cleanup?.() }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeEraIdx])

  // ── AI Analysis ──
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

  // ── Full-screen layout ──────────────────────────────────
  return (
    <div
      style={{
        height: 'calc(100dvh - 64px)',
        display: 'flex',
        flexDirection: 'column',
        background: '#080810',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* ── Era tabs (top strip, hidden in immersive mode) ── */}
      {!immersive && (
        <div
          style={{
            flexShrink: 0,
            borderBottom: '1px solid rgba(201,168,76,0.15)',
            overflowX: 'auto',
            background: 'rgba(10,8,6,0.8)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <div style={{ display: 'flex', minWidth: 'max-content' }}>
            {eraData.map((era, i) => (
              <button
                key={era.id}
                onClick={() => { setActiveEraIdx(i); setSelected(null); setAiContent('') }}
                style={{
                  fontFamily: 'var(--font-cinzel), serif',
                  fontSize: '0.52rem',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  padding: '0.7rem 1rem',
                  borderTop: 'none',
                  borderLeft: 'none',
                  borderRight: 'none',
                  borderBottom: `2px solid ${i === activeEraIdx ? '#C9A84C' : 'transparent'}`,
                  color: i === activeEraIdx ? 'var(--gold)' : 'var(--smoke)',
                  background: 'none',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'color 0.2s, border-color 0.2s',
                }}
                onMouseEnter={e => { if (i !== activeEraIdx) (e.currentTarget as HTMLElement).style.color = 'var(--mist)' }}
                onMouseLeave={e => { if (i !== activeEraIdx) (e.currentTarget as HTMLElement).style.color = 'var(--smoke)' }}
              >
                {era.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Main area (left sidebar + canvas + right panel) ── */}
      <div style={{ flex: 1, display: 'flex', position: 'relative', minHeight: 0 }}>

        {/* ── Left collapsible sidebar ── */}
        {!immersive && (
          <div
            style={{
              width: leftOpen ? '220px' : '0',
              flexShrink: 0,
              overflow: 'hidden',
              transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1)',
              background: 'rgba(10,8,6,0.9)',
              borderRight: leftOpen ? '1px solid rgba(201,168,76,0.15)' : 'none',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ width: '220px', display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
              {/* Sidebar header */}
              <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(201,168,76,0.1)', flexShrink: 0 }}>
                <div style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.46rem', letterSpacing: '0.28em', color: 'rgba(201,168,76,0.6)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                  {activeEra.name}
                </div>
                <div style={{ fontFamily: 'var(--font-crimson)', fontSize: '0.78rem', color: 'var(--smoke)' }}>
                  {activeEra.years}
                </div>
              </div>
              {/* Artifact list */}
              <div style={{ flex: 1, overflowY: 'auto' }}>
                {activeEra.weapons.map((w, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelectWeapon(w)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '0.6rem 1rem',
                      borderBottom: '1px solid rgba(201,168,76,0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      background: selected?.weapon.name === w.name ? 'rgba(201,168,76,0.1)' : 'transparent',
                      borderLeft: selected?.weapon.name === w.name ? '2px solid var(--gold)' : '2px solid transparent',
                      cursor: 'pointer',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={e => { if (selected?.weapon.name !== w.name) (e.currentTarget as HTMLElement).style.background = 'rgba(201,168,76,0.05)' }}
                    onMouseLeave={e => { if (selected?.weapon.name !== w.name) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                  >
                    <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{w.icon}</span>
                    <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.5rem', letterSpacing: '0.1em', color: 'var(--mist)', textTransform: 'uppercase', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {w.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Sidebar toggle button ── */}
        {!immersive && (
          <button
            onClick={() => setLeftOpen(o => !o)}
            style={{
              position: 'absolute',
              left: leftOpen ? '220px' : '0',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 20,
              width: '20px',
              height: '48px',
              background: 'rgba(10,8,6,0.9)',
              border: '1px solid rgba(201,168,76,0.25)',
              borderLeft: leftOpen ? 'none' : '1px solid rgba(201,168,76,0.25)',
              color: 'var(--gold)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.65rem',
              transition: 'left 0.3s cubic-bezier(0.4,0,0.2,1)',
            }}
            title={leftOpen ? (isES ? 'Cerrar panel' : 'Close panel') : (isES ? 'Abrir panel' : 'Open panel')}
          >
            {leftOpen ? '‹' : '›'}
          </button>
        )}

        {/* ── 3D Canvas ── */}
        <div style={{ flex: 1, position: 'relative', minWidth: 0 }}>
          <div ref={canvasRef} style={{ position: 'absolute', inset: 0 }} />

          {/* Era overlay info */}
          {!immersive && (
            <div style={{ position: 'absolute', top: '1rem', left: '1.5rem', pointerEvents: 'none', zIndex: 5 }}>
              <div style={{ background: 'rgba(10,8,6,0.8)', border: '1px solid rgba(201,168,76,0.2)', padding: '0.5rem 0.85rem', backdropFilter: 'blur(8px)' }}>
                <div style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.55rem', letterSpacing: '0.2em', color: 'var(--gold)', textTransform: 'uppercase' }}>{activeEra.name}</div>
                <div style={{ fontFamily: 'var(--font-crimson)', fontSize: '0.8rem', color: 'var(--smoke)' }}>{activeEra.years}</div>
                <div style={{ fontFamily: 'var(--font-crimson)', fontSize: '0.75rem', color: 'rgba(107,101,96,0.7)', marginTop: '0.15rem' }}>
                  {activeEra.weapons.length} {isES ? 'artefactos' : 'artifacts'}
                </div>
              </div>
            </div>
          )}

          {/* Controls hint */}
          <div style={{ position: 'absolute', bottom: '4rem', left: '50%', transform: 'translateX(-50%)', pointerEvents: 'none', zIndex: 5 }}>
            <div style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.42rem', letterSpacing: '0.18em', color: 'rgba(107,101,96,0.45)', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
              {isES
                ? '← arrastra · pellizca para zoom · toca artefacto →'
                : '← drag · pinch to zoom · tap artifact →'}
            </div>
          </div>

          {/* Hover tooltip */}
          {tooltip && (
            <div
              style={{
                position: 'absolute',
                left: tooltip.x + 12,
                top: tooltip.y - 10,
                background: 'rgba(10,8,6,0.95)',
                border: '1px solid rgba(201,168,76,0.4)',
                padding: '0.35rem 0.75rem',
                pointerEvents: 'none',
                zIndex: 10,
                backdropFilter: 'blur(8px)',
              }}
            >
              <div style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.58rem', letterSpacing: '0.15em', color: 'var(--gold)', textTransform: 'uppercase' }}>{tooltip.name}</div>
              <div style={{ fontFamily: 'var(--font-crimson)', fontSize: '0.72rem', color: 'rgba(155,149,144,0.7)' }}>
                {isES ? 'Clic para analizar' : 'Click to analyze'}
              </div>
            </div>
          )}
        </div>

        {/* ── Floating right panel for selected artifact ── */}
        {selected && (
          <div
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              width: '300px',
              maxHeight: 'calc(100% - 2rem)',
              background: 'rgba(10,8,6,0.92)',
              border: '1px solid rgba(201,168,76,0.25)',
              borderTop: '2px solid var(--gold)',
              backdropFilter: 'blur(12px)',
              zIndex: 30,
              display: 'flex',
              flexDirection: 'column',
              animation: 'slideInRight 0.3s cubic-bezier(0.4,0,0.2,1) both',
              boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
            }}
          >
            {/* Panel header */}
            <div style={{ padding: '0.85rem 1rem', borderBottom: '1px solid rgba(201,168,76,0.12)', display: 'flex', alignItems: 'start', gap: '0.7rem', flexShrink: 0 }}>
              <span style={{ fontSize: '1.6rem', lineHeight: 1, flexShrink: 0 }}>{selected.weapon.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.6rem', letterSpacing: '0.15em', color: 'var(--gold)', textTransform: 'uppercase', fontWeight: 700 }}>{selected.weapon.name}</div>
                <div style={{ fontFamily: 'var(--font-crimson)', fontSize: '0.78rem', color: 'var(--smoke)', marginTop: '0.1rem' }}>{selected.eraName}</div>
              </div>
              <button
                onClick={() => { setSelected(null); setAiContent('') }}
                style={{ background: 'none', border: 'none', color: 'var(--smoke)', cursor: 'pointer', fontSize: '1rem', lineHeight: 1, flexShrink: 0, padding: '0.1rem' }}
                title={isES ? 'Cerrar' : 'Close'}
              >
                ×
              </button>
            </div>

            {/* AI trigger / content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0.85rem 1rem' }}>
              {!aiContent && !aiLoading && (
                <button
                  onClick={() => runAI(selected.weapon, selected.eraName)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid rgba(201,168,76,0.3)',
                    background: 'rgba(201,168,76,0.06)',
                    color: 'var(--gold)',
                    fontFamily: 'var(--font-cinzel)',
                    fontSize: '0.52rem',
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(201,168,76,0.12)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(201,168,76,0.06)' }}
                >
                  {isES ? '✦ Analizar con IA' : '✦ Analyze with AI'}
                </button>
              )}
              {aiLoading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0' }}>
                  {[0, 1, 2].map(d => (
                    <div key={d} style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--gold)', animation: `dot 1.2s ease-in-out ${d * 0.15}s infinite` }} />
                  ))}
                  <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.48rem', letterSpacing: '0.2em', color: 'var(--smoke)', textTransform: 'uppercase' }}>
                    {isES ? 'Analizando...' : 'Analyzing...'}
                  </span>
                </div>
              )}
              {aiContent && (
                <>
                  <div className="ai-content" style={{ fontSize: '0.85rem', lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: aiContent }} />
                  <button
                    onClick={() => { setAiContent(''); runAI(selected.weapon, selected.eraName) }}
                    style={{ marginTop: '0.75rem', background: 'none', border: 'none', fontFamily: 'var(--font-cinzel)', fontSize: '0.44rem', letterSpacing: '0.18em', color: 'var(--smoke)', cursor: 'pointer', textTransform: 'uppercase' }}
                  >
                    {isES ? '↻ Regenerar' : '↻ Regenerate'}
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom bar ── */}
      <div
        style={{
          flexShrink: 0,
          borderTop: '1px solid rgba(201,168,76,0.12)',
          background: 'rgba(10,8,6,0.85)',
          backdropFilter: 'blur(8px)',
          padding: '0.5rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        <div style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.44rem', letterSpacing: '0.2em', color: 'rgba(107,101,96,0.5)', textTransform: 'uppercase' }}>
          {isES ? 'Museo Militar 3D — Bellum Mundi' : '3D Military Museum — Bellum Mundi'}
        </div>
        <button
          onClick={() => setImmersive(v => !v)}
          style={{
            fontFamily: 'var(--font-cinzel)',
            fontSize: '0.48rem',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            padding: '0.4rem 0.9rem',
            border: `1px solid ${immersive ? 'rgba(201,168,76,0.6)' : 'rgba(201,168,76,0.25)'}`,
            background: immersive ? 'rgba(201,168,76,0.12)' : 'transparent',
            color: immersive ? 'var(--gold)' : 'var(--smoke)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          {immersive
            ? (isES ? '⊞ Salir modo inmersivo' : '⊞ Exit immersive')
            : (isES ? '⊡ Modo inmersivo' : '⊡ Immersive mode')}
        </button>
      </div>
    </div>
  )
}
