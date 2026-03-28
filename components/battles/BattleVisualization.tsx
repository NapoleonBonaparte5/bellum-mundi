'use client'
// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — 3D BATTLE VISUALIZATION
// Three.js canvas · Two armies · Orbit · Animated charge
// ═══════════════════════════════════════════════════════════

import { useEffect, useRef, useState, useCallback } from 'react'
import type { FlatBattle, EraId, Lang } from '@/lib/data/types'

interface BattleVisualizationProps {
  battle: FlatBattle
  lang:   Lang
}

// ── Era army colors [side1, side2] ──────────────────────────
const ERA_COLORS: Record<string, [number, number]> = {
  prehistoric:  [0x8B7355, 0x5C4033],
  ancient:      [0xD4A843, 0x8B1A1A],
  classical:    [0x1E4B8C, 0x8B1A1A],
  medieval:     [0xB8B8B8, 0x8B6914],
  early_modern: [0xCC2020, 0x1A3F8B],
  napoleon:     [0x0A3FA8, 0xCC2020],
  ww1:          [0x8B7355, 0x4A4A35],
  ww2:          [0x556B2F, 0x5A5A5A],
  cold_war:     [0x4B7B4B, 0x8B1A1A],
  contemporary: [0x4B7B4B, 0xA08B6A],
}

// Unit counts by era (per side)
const ERA_UNIT_COUNT: Partial<Record<EraId, number>> = {
  prehistoric:  25,
  ancient:      60,
  classical:    80,
  medieval:     55,
  early_modern: 70,
  napoleon:     90,
  ww1:          75,
  ww2:          85,
  cold_war:     30,
  contemporary: 20,
}

// Unit shape by era: 'soldier' | 'tank' | 'archer'
const ERA_UNIT_SHAPE: Partial<Record<EraId, 'tall' | 'wide' | 'low'>> = {
  prehistoric:  'tall',
  ancient:      'tall',
  classical:    'tall',
  medieval:     'tall',
  early_modern: 'tall',
  napoleon:     'tall',
  ww1:          'wide',
  ww2:          'low',
  cold_war:     'low',
  contemporary: 'low',
}

// ── Parse two sides from combatants string ───────────────────
function parseSides(combatants: string): [string, string] {
  const parts = combatants.split(/\s+vs\.?\s+/i)
  const s1 = parts[0]?.trim() ?? combatants
  const s2 = parts[1]?.trim() ?? '???'
  const shorten = (s: string) => s.length > 22 ? s.slice(0, 20) + '…' : s
  return [shorten(s1), shorten(s2)]
}

// ══════════════════════════════════════════════════════════════
export function BattleVisualization({ battle, lang }: BattleVisualizationProps) {
  const isES = lang === 'es'
  const mountRef    = useRef<HTMLDivElement>(null)
  const rendererRef = useRef<import('three').WebGLRenderer | null>(null)
  const sceneRef    = useRef<import('three').Scene | null>(null)
  const cameraRef   = useRef<import('three').PerspectiveCamera | null>(null)
  const rafRef      = useRef<number | null>(null)
  const army1Ref    = useRef<import('three').InstancedMesh | null>(null)
  const army2Ref    = useRef<import('three').InstancedMesh | null>(null)
  const arrowsRef   = useRef<import('three').Group | null>(null)

  // Orbit state
  const isDragging  = useRef(false)
  const prevMouse   = useRef({ x: 0, y: 0 })
  const spherical   = useRef({ theta: Math.PI / 4, phi: Math.PI / 3.2, radius: 160 })

  // Animation state
  const [phase, setPhase]         = useState<'idle' | 'advance' | 'clash' | 'done'>('idle')
  const [animProgress, setAnimProgress] = useState(0)
  const phaseRef  = useRef<'idle' | 'advance' | 'clash' | 'done'>('idle')
  const progRef   = useRef(0)

  const [sides] = useState(() => parseSides(battle.combatants))
  const eraColors = ERA_COLORS[battle.eraId] ?? ERA_COLORS.ancient
  const unitCount = ERA_UNIT_COUNT[battle.eraId] ?? 60
  const unitShape = ERA_UNIT_SHAPE[battle.eraId] ?? 'tall'

  // ── Three.js setup ─────────────────────────────────────────
  useEffect(() => {
    if (!mountRef.current) return
    let mounted = true

    // Dynamic import to avoid SSR issues
    import('three').then(THREE => {
      if (!mounted || !mountRef.current) return

      const W = mountRef.current.clientWidth
      const H = mountRef.current.clientHeight || 480

      // Renderer
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
      renderer.setSize(W, H)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.shadowMap.enabled = true
      renderer.shadowMap.type = THREE.PCFSoftShadowMap
      renderer.setClearColor(0x0A0D12)
      mountRef.current.appendChild(renderer.domElement)
      rendererRef.current = renderer

      // Scene
      const scene = new THREE.Scene()
      scene.fog = new THREE.FogExp2(0x0A0D12, 0.004)
      sceneRef.current = scene

      // Camera
      const camera = new THREE.PerspectiveCamera(55, W / H, 0.5, 1000)
      cameraRef.current = camera

      // ── Lights ────────────────────────────────────────────
      const ambient = new THREE.AmbientLight(0x334466, 0.8)
      scene.add(ambient)

      const sun = new THREE.DirectionalLight(0xFFDDAA, 1.8)
      sun.position.set(80, 120, 60)
      sun.castShadow = true
      sun.shadow.mapSize.set(1024, 1024)
      sun.shadow.camera.near = 1
      sun.shadow.camera.far = 500
      sun.shadow.camera.left = -150
      sun.shadow.camera.right = 150
      sun.shadow.camera.top = 150
      sun.shadow.camera.bottom = -150
      scene.add(sun)

      const fillLight = new THREE.DirectionalLight(0x4466AA, 0.4)
      fillLight.position.set(-50, 30, -80)
      scene.add(fillLight)

      // ── Terrain ────────────────────────────────────────────
      const groundGeo = new THREE.PlaneGeometry(320, 320, 40, 40)
      groundGeo.rotateX(-Math.PI / 2)
      const pos = groundGeo.attributes.position as import('three').BufferAttribute
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i), z = pos.getZ(i)
        const d = Math.sqrt(x * x + z * z)
        // Gentle hills away from battle center
        const height = d > 40
          ? (Math.sin(x * 0.04 + 1.2) * Math.cos(z * 0.035 + 0.8) * 6
          +  Math.sin(x * 0.08) * Math.sin(z * 0.07) * 3)
          : 0
        pos.setY(i, height)
      }
      groundGeo.computeVertexNormals()

      const groundMat = new THREE.MeshStandardMaterial({
        color: 0x2C3A1E,
        roughness: 0.95,
        metalness: 0.0,
      })
      const ground = new THREE.Mesh(groundGeo, groundMat)
      ground.receiveShadow = true
      scene.add(ground)

      // Grid overlay
      const gridHelper = new THREE.GridHelper(280, 28, 0x3A4A2A, 0x2A3A1A)
      gridHelper.position.y = 0.05
      scene.add(gridHelper)

      // ── Army helper ────────────────────────────────────────
      function buildArmy(
        count: number,
        color: number,
        startX: number,
      ): import('three').InstancedMesh {
        const [bw, bh, bd] = unitShape === 'tall' ? [1.0, 2.0, 0.7]
                           : unitShape === 'low'  ? [2.0, 1.0, 3.0]
                           :                        [1.2, 1.8, 0.8]

        const geo = new THREE.BoxGeometry(bw, bh, bd)
        const mat = new THREE.MeshStandardMaterial({
          color,
          roughness: 0.7,
          metalness: 0.2,
          emissive: new THREE.Color(color).multiplyScalar(0.08),
        })
        const mesh = new THREE.InstancedMesh(geo, mat, count)
        mesh.castShadow = true

        const cols = Math.ceil(Math.sqrt(count * 1.6))
        const rows = Math.ceil(count / cols)
        const dummy = new THREE.Object3D()
        const SPREAD = 3.5

        for (let i = 0; i < count; i++) {
          const col = i % cols
          const row = Math.floor(i / cols)
          // Small jitter for organic look
          const jx = (Math.random() - 0.5) * 0.6
          const jz = (Math.random() - 0.5) * 0.6
          dummy.position.set(
            startX + (col - cols / 2) * SPREAD + jx,
            bh / 2,
            (row - rows / 2) * SPREAD + jz,
          )
          dummy.rotation.y = startX < 0 ? -Math.PI / 2 : Math.PI / 2
          dummy.updateMatrix()
          mesh.setMatrixAt(i, dummy.matrix)
        }
        mesh.instanceMatrix.needsUpdate = true
        return mesh
      }

      const a1 = buildArmy(unitCount, eraColors[0], -55)
      const a2 = buildArmy(unitCount, eraColors[1],  55)
      scene.add(a1, a2)
      army1Ref.current = a1
      army2Ref.current = a2

      // ── Battle-line marker ─────────────────────────────────
      const lineGeo = new THREE.PlaneGeometry(0.5, 140)
      lineGeo.rotateX(-Math.PI / 2)
      const lineMat = new THREE.MeshBasicMaterial({ color: 0xDAA520, opacity: 0.2, transparent: true })
      const line = new THREE.Mesh(lineGeo, lineMat)
      line.position.y = 0.1
      scene.add(line)

      // ── Charge arrows (hidden until animation) ─────────────
      const arrowGroup = new THREE.Group()
      for (let z = -30; z <= 30; z += 15) {
        // Arrow body
        const arrowGeo = new THREE.CylinderGeometry(0.2, 0.2, 18, 6)
        const arrowMat1 = new THREE.MeshBasicMaterial({ color: eraColors[0], opacity: 0.6, transparent: true })
        const arrowMat2 = new THREE.MeshBasicMaterial({ color: eraColors[1], opacity: 0.6, transparent: true })

        const arrow1 = new THREE.Mesh(arrowGeo, arrowMat1)
        arrow1.rotation.z = Math.PI / 2
        arrow1.position.set(-37, 0.3, z)
        arrowGroup.add(arrow1)

        const arrow2 = new THREE.Mesh(arrowGeo, arrowMat2)
        arrow2.rotation.z = -Math.PI / 2
        arrow2.position.set(37, 0.3, z)
        arrowGroup.add(arrow2)
      }
      arrowGroup.visible = false
      scene.add(arrowGroup)
      arrowsRef.current = arrowGroup

      // ── RAF loop ───────────────────────────────────────────
      function updateCamera() {
        const { theta, phi, radius } = spherical.current
        camera.position.set(
          radius * Math.sin(phi) * Math.sin(theta),
          radius * Math.cos(phi),
          radius * Math.sin(phi) * Math.cos(theta),
        )
        camera.lookAt(0, 5, 0)
      }
      updateCamera()

      let lastTime = 0
      function animate(time: number) {
        rafRef.current = requestAnimationFrame(animate)
        const dt = Math.min((time - lastTime) / 1000, 0.05)
        lastTime = time

        // Phase-driven army movement
        const p = phaseRef.current
        if (p === 'advance' || p === 'clash') {
          progRef.current = Math.min(progRef.current + dt * 0.18, 1)
          setAnimProgress(progRef.current)

          if (p === 'advance' && progRef.current >= 1) {
            phaseRef.current = 'clash'
            setPhase('clash')
            progRef.current = 0
          }
          if (p === 'clash' && progRef.current >= 1) {
            phaseRef.current = 'done'
            setPhase('done')
          }

          const THREE_ = THREE
          const dummy = new THREE_.Object3D()

          if (army1Ref.current && army2Ref.current) {
            const a1m = army1Ref.current
            const a2m = army2Ref.current
            const count = a1m.count

            // Lerp offset toward center
            const advanceOffset = p === 'advance'
              ? progRef.current * 38
              : 38 + progRef.current * 12  // clash: mix in center

            for (let i = 0; i < count; i++) {
              a1m.getMatrixAt(i, dummy.matrix)
              dummy.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale)
              dummy.position.x = -55 + advanceOffset + dummy.position.x - (-55 + (p === 'advance' ? (progRef.current - dt * 0.18) * 38 : 38))
              dummy.updateMatrix()
              a1m.setMatrixAt(i, dummy.matrix)

              a2m.getMatrixAt(i, dummy.matrix)
              dummy.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale)
              dummy.position.x = 55 - advanceOffset + dummy.position.x - (55 - (p === 'advance' ? (progRef.current - dt * 0.18) * 38 : 38))
              dummy.updateMatrix()
              a2m.setMatrixAt(i, dummy.matrix)
            }

            a1m.instanceMatrix.needsUpdate = true
            a2m.instanceMatrix.needsUpdate = true
          }
        }

        renderer.render(scene, camera)
      }
      rafRef.current = requestAnimationFrame(animate)

      // ── Resize handler ─────────────────────────────────────
      const onResize = () => {
        if (!mountRef.current) return
        const W = mountRef.current.clientWidth
        const H = mountRef.current.clientHeight || 480
        renderer.setSize(W, H)
        camera.aspect = W / H
        camera.updateProjectionMatrix()
      }
      window.addEventListener('resize', onResize)

      // ── Cleanup ────────────────────────────────────────────
      return () => {
        mounted = false
        window.removeEventListener('resize', onResize)
        if (rafRef.current) cancelAnimationFrame(rafRef.current)
        renderer.dispose()
        if (mountRef.current?.contains(renderer.domElement)) {
          mountRef.current.removeChild(renderer.domElement)
        }
      }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [battle.eraId, battle.combatants])

  // ── Orbit: mouse ───────────────────────────────────────────
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    isDragging.current = true
    prevMouse.current = { x: e.clientX, y: e.clientY }
  }, [])

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current) return
    const dx = e.clientX - prevMouse.current.x
    const dy = e.clientY - prevMouse.current.y
    prevMouse.current = { x: e.clientX, y: e.clientY }
    spherical.current.theta -= dx * 0.006
    spherical.current.phi = Math.max(0.2, Math.min(Math.PI / 2.1, spherical.current.phi + dy * 0.005))
  }, [])

  const onMouseUp = useCallback(() => { isDragging.current = false }, [])

  const onWheel = useCallback((e: React.WheelEvent) => {
    spherical.current.radius = Math.max(60, Math.min(280, spherical.current.radius + e.deltaY * 0.2))
  }, [])

  // ── Start animation ────────────────────────────────────────
  const startAnimation = useCallback(() => {
    if (phaseRef.current !== 'idle' && phaseRef.current !== 'done') return
    phaseRef.current = 'advance'
    progRef.current = 0
    setPhase('advance')
    setAnimProgress(0)
    if (arrowsRef.current) arrowsRef.current.visible = true
  }, [])

  const resetAnimation = useCallback(() => {
    phaseRef.current = 'idle'
    progRef.current = 0
    setPhase('idle')
    setAnimProgress(0)
    if (arrowsRef.current) arrowsRef.current.visible = false
  }, [])

  // Phase labels
  const phaseLabel = {
    idle:    isES ? 'Posición inicial — Ejércitos listos' : 'Opening positions — Armies ready',
    advance: isES ? 'Avance — Las formaciones se aproximan' : 'Advance — Formations closing in',
    clash:   isES ? '⚔ Choque — Combate cuerpo a cuerpo' : '⚔ Clash — Close combat',
    done:    isES ? 'Batalla concluida' : 'Battle concluded',
  }

  return (
    <div className="mb-12">
      {/* Info bar */}
      <div className="flex items-center justify-between gap-4 mb-3 flex-wrap">
        <div>
          <p className="eyebrow mb-1">{isES ? 'Visualización Táctica 3D' : '3D Tactical Visualization'}</p>
          <p className="font-crimson text-smoke text-sm">{phaseLabel[phase]}</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Phase progress */}
          {(phase === 'advance' || phase === 'clash') && (
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-24 h-1.5 bg-steel overflow-hidden">
                <div
                  className="h-full bg-gold transition-all"
                  style={{ width: `${animProgress * 100}%` }}
                />
              </div>
            </div>
          )}
          <button
            onClick={startAnimation}
            disabled={phase === 'advance' || phase === 'clash'}
            className="btn-primary text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {phase === 'done'
              ? (isES ? '↺ Repetir' : '↺ Replay')
              : (isES ? '⚔ Iniciar Batalla' : '⚔ Start Battle')}
          </button>
          {phase !== 'idle' && (
            <button
              onClick={resetAnimation}
              className="font-cinzel text-[0.55rem] tracking-widest uppercase border border-gold/25 text-smoke hover:text-gold px-3 py-2 transition-all"
            >
              {isES ? 'Reset' : 'Reset'}
            </button>
          )}
        </div>
      </div>

      {/* Canvas container */}
      <div className="relative border border-gold/20 overflow-hidden" style={{ height: 480 }}>
        <div
          ref={mountRef}
          className="w-full h-full"
          style={{ cursor: isDragging.current ? 'grabbing' : 'grab' }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onWheel={onWheel}
        />

        {/* Army labels */}
        <div className="absolute top-4 left-4 pointer-events-none">
          <div className="font-cinzel text-[0.55rem] tracking-[0.15em] uppercase px-2 py-1 border"
            style={{ color: `#${eraColors[0].toString(16).padStart(6, '0')}`, borderColor: `#${eraColors[0].toString(16).padStart(6, '0')}50` }}>
            ◀ {sides[0]}
          </div>
        </div>
        <div className="absolute top-4 right-4 pointer-events-none">
          <div className="font-cinzel text-[0.55rem] tracking-[0.15em] uppercase px-2 py-1 border"
            style={{ color: `#${eraColors[1].toString(16).padStart(6, '0')}`, borderColor: `#${eraColors[1].toString(16).padStart(6, '0')}50` }}>
            {sides[1]} ▶
          </div>
        </div>

        {/* Unit count */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 pointer-events-none">
          <div className="font-cinzel text-[0.5rem] tracking-[0.2em] text-smoke/60 uppercase">
            {unitCount} {isES ? 'unidades por bando' : 'units per side'} · {isES ? 'Arrastra para rotar · Rueda para zoom' : 'Drag to rotate · Scroll to zoom'}
          </div>
        </div>
      </div>

      {/* Era note */}
      <div className="mt-2 font-cinzel text-[0.5rem] tracking-wider text-smoke/50 uppercase text-right">
        {isES ? `Representación táctica — Era ${battle.eraName}` : `Tactical representation — ${battle.eraName} era`}
      </div>
    </div>
  )
}
