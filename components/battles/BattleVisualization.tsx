'use client'
// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — 3D BATTLE VISUALIZATION  v2
// BATTLE_TACTICS dict · 5 unit types · 6 formations · 4-phase anim
// ═══════════════════════════════════════════════════════════

import { useEffect, useRef, useState, useCallback } from 'react'
import type { FlatBattle, EraId, Lang } from '@/lib/data/types'

interface BattleVisualizationProps {
  battle: FlatBattle
  lang:   Lang
}

type UnitType = 'infantry' | 'cavalry' | 'archer' | 'artillery' | 'tank'
type TacticId = 'envelopment' | 'wedge' | 'defense' | 'flanking' | 'pincer' | 'line'

interface BattleTacticConfig {
  troops1: number
  troops2: number
  tactic:  TacticId
  descES:  string
  descEN:  string
  units1:  UnitType[]
  units2:  UnitType[]
  color1:  number
  color2:  number
}

// ── Per-battle tactical configurations ───────────────────────
const BATTLE_TACTICS: Record<string, BattleTacticConfig> = {
  cannas: {
    troops1: 86000, troops2: 50000, tactic: 'envelopment',
    descES: 'La doble envolvente de Aníbal — las alas de caballería rodean la infantería romana',
    descEN: 'Hannibal\'s double envelopment — Carthaginian cavalry wings surround Roman infantry',
    units1: ['infantry', 'cavalry'], units2: ['infantry', 'archer'],
    color1: 0xC9A84C, color2: 0x1E4B8C,
  },
  marathon: {
    troops1: 25000, troops2: 10000, tactic: 'flanking',
    descES: 'Hoplitas griegos refuerzan los flancos para envolver a la infantería persa',
    descEN: 'Greek hoplites reinforce flanks to envelop the Persian infantry',
    units1: ['infantry', 'archer'], units2: ['infantry', 'infantry'],
    color1: 0x1E4B8C, color2: 0xD4A843,
  },
  gaugamela: {
    troops1: 250000, troops2: 47000, tactic: 'wedge',
    descES: 'Alejandro lanza la cuña de Compañeros por el flanco derecho persa',
    descEN: 'Alexander drives the Companion cavalry wedge through the Persian right flank',
    units1: ['cavalry', 'infantry'], units2: ['infantry', 'archer', 'cavalry'],
    color1: 0xD4A843, color2: 0x8B1A1A,
  },
  hastings: {
    troops1: 12000, troops2: 8000, tactic: 'line',
    descES: 'La línea de escudos sajona aguanta la embestida normanda en la colina',
    descEN: 'The Saxon shield-wall holds the Norman charge on the ridge',
    units1: ['infantry', 'archer'], units2: ['infantry', 'cavalry'],
    color1: 0xB8B8B8, color2: 0x8B6914,
  },
  agincourt: {
    troops1: 12000, troops2: 8000, tactic: 'defense',
    descES: 'Arqueros ingleses en posición defensiva diezman la caballería francesa',
    descEN: 'English longbowmen behind defensive stakes decimate French cavalry charges',
    units1: ['cavalry', 'infantry'], units2: ['archer', 'infantry'],
    color1: 0x8B6914, color2: 0x8B2020,
  },
  waterloo: {
    troops1: 68000, troops2: 73000, tactic: 'pincer',
    descES: 'Wellington aguanta en Mont-Saint-Jean mientras Blücher aplica la tenaza prusiana',
    descEN: 'Wellington holds at Mont-Saint-Jean while Blücher\'s Prussians apply the pincer',
    units1: ['infantry', 'cavalry', 'artillery'], units2: ['infantry', 'artillery', 'cavalry'],
    color1: 0x0A3FA8, color2: 0xCC2020,
  },
  austerlitz: {
    troops1: 73000, troops2: 89000, tactic: 'envelopment',
    descES: 'Napoleón debilita el centro aliado para envolver ambos flancos con la Guardia Imperial',
    descEN: 'Napoleon weakens the Allied center to envelop both flanks with the Imperial Guard',
    units1: ['infantry', 'cavalry', 'artillery'], units2: ['cavalry', 'infantry'],
    color1: 0x0A3FA8, color2: 0xCC2020,
  },
  verdun: {
    troops1: 150000, troops2: 200000, tactic: 'defense',
    descES: 'Guerra de trincheras — Francia resiste el asalto de desgaste alemán durante meses',
    descEN: 'Trench warfare — France holds against the German attrition assault for months',
    units1: ['infantry', 'artillery'], units2: ['infantry', 'artillery'],
    color1: 0x4A4A35, color2: 0x8B7355,
  },
  stalingrad: {
    troops1: 1000000, troops2: 800000, tactic: 'pincer',
    descES: 'Operación Urano — doble tenaza soviética rodea al 6.º Ejército alemán',
    descEN: 'Operation Uranus — Soviet double pincer encircles the German 6th Army',
    units1: ['tank', 'infantry', 'artillery'], units2: ['infantry', 'artillery', 'tank'],
    color1: 0x556B2F, color2: 0x5A5A5A,
  },
}

// ── Era fallback colors ───────────────────────────────────────
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

function getDefaultConfig(eraId: EraId): BattleTacticConfig {
  const eraUnits: Partial<Record<EraId, UnitType[]>> = {
    prehistoric:  ['infantry'],
    ancient:      ['infantry', 'archer'],
    classical:    ['infantry', 'cavalry', 'archer'],
    medieval:     ['infantry', 'cavalry', 'archer'],
    early_modern: ['infantry', 'cavalry', 'artillery'],
    napoleon:     ['infantry', 'cavalry', 'artillery'],
    ww1:          ['infantry', 'artillery'],
    ww2:          ['tank', 'infantry', 'artillery'],
    cold_war:     ['tank', 'infantry'],
    contemporary: ['tank', 'infantry'],
  }
  const [c1, c2] = ERA_COLORS[eraId] ?? [0xD4A843, 0x8B1A1A]
  const units = eraUnits[eraId] ?? ['infantry']
  return {
    troops1: 50000, troops2: 50000, tactic: 'line',
    descES: 'Formación en línea — las fuerzas se enfrentan en campo abierto',
    descEN: 'Line formation — forces face each other on open ground',
    units1: units, units2: units, color1: c1, color2: c2,
  }
}

// ── Unit geometry factory ─────────────────────────────────────
function createUnitGeometry(THREE: typeof import('three'), type: UnitType): import('three').BufferGeometry {
  switch (type) {
    case 'infantry':  return new THREE.BoxGeometry(0.9, 1.9, 0.6)
    case 'cavalry':   return new THREE.BoxGeometry(1.8, 1.4, 3.2)
    case 'archer':    return new THREE.CylinderGeometry(0.35, 0.4, 1.7, 6)
    case 'artillery': return new THREE.CylinderGeometry(0.4, 0.5, 0.9, 8)
    case 'tank':      return new THREE.BoxGeometry(2.8, 1.1, 4.2)
  }
}

function getUnitHeight(type: UnitType): number {
  switch (type) {
    case 'infantry':  return 0.95
    case 'cavalry':   return 0.70
    case 'archer':    return 0.85
    case 'artillery': return 0.45
    case 'tank':      return 0.55
  }
}

// ── Formation-aware positioning ───────────────────────────────
function getFormationOffset(
  tactic: TacticId,
  side: 1 | 2,
  typeIdx: number,
  totalTypes: number,
  unitIdx: number,
  count: number,
): { x: number; z: number } {
  const cols = Math.ceil(Math.sqrt(count * 1.5))
  const rows = Math.ceil(count / cols)
  const col  = unitIdx % cols
  const row  = Math.floor(unitIdx / cols)
  const SP   = 3.8
  const baseX = side === 1 ? -52 : 52
  const typeZ = (typeIdx - (totalTypes - 1) / 2) * (rows * SP + 4)

  switch (tactic) {
    case 'line':
      return { x: baseX + (col - cols / 2) * SP, z: (row - rows / 2) * SP + typeZ }

    case 'wedge': {
      const fwd = side === 1 ? row * 2.5 : -row * 2.5
      return { x: baseX + (col - cols / 2) * SP + fwd, z: (row - rows / 2) * SP + typeZ }
    }

    case 'envelopment':
      if (typeIdx === 0) {
        // Center mass
        return { x: baseX + (col - cols / 2) * SP, z: (row - rows / 2) * SP }
      } else {
        // Wings spread far out in Z
        const wing = typeIdx === 1 ? -42 : 42
        return { x: baseX + (col - cols / 2) * SP, z: (row - rows / 2) * SP + wing }
      }

    case 'defense': {
      const tighter = 0.65
      const back = side === 1 ? 10 : -10
      return {
        x: baseX + (col - cols / 2) * SP * tighter + back,
        z: (row - rows / 2) * SP * tighter + typeZ,
      }
    }

    case 'flanking':
      if (typeIdx === totalTypes - 1) {
        const flank = side === 1 ? -14 : 14
        return { x: baseX + (col - cols / 2) * SP + flank, z: (row - rows / 2) * SP + typeZ }
      }
      return { x: baseX + (col - cols / 2) * SP, z: (row - rows / 2) * SP + typeZ }

    case 'pincer': {
      const half = Math.floor(count / 2)
      const pincerZ = unitIdx < half ? -26 : 26
      return { x: baseX + (col - cols / 2) * SP, z: (row - rows / 2) * SP + pincerZ }
    }
  }
}

// ── Helpers ────────────────────────────────────────────────────
function parseSides(combatants: string): [string, string] {
  const parts = combatants.split(/\s+vs\.?\s+/i)
  const shorten = (s: string) => s.length > 22 ? s.slice(0, 20) + '…' : s
  return [shorten(parts[0]?.trim() ?? combatants), shorten(parts[1]?.trim() ?? '???')]
}

function formatTroops(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000)     return Math.round(n / 1_000) + 'k'
  return String(n)
}

function hexStr(n: number): string {
  return '#' + n.toString(16).padStart(6, '0')
}

// ══════════════════════════════════════════════════════════════
export function BattleVisualization({ battle, lang }: BattleVisualizationProps) {
  const isES = lang === 'es'

  const mountRef       = useRef<HTMLDivElement>(null)
  const rendererRef    = useRef<import('three').WebGLRenderer | null>(null)
  const cameraRef      = useRef<import('three').PerspectiveCamera | null>(null)
  const rafRef         = useRef<number | null>(null)
  const army1MeshesRef = useRef<import('three').InstancedMesh[]>([])
  const army2MeshesRef = useRef<import('three').InstancedMesh[]>([])
  const army1PosRef    = useRef<Float32Array[]>([])
  const army2PosRef    = useRef<Float32Array[]>([])

  const isDragging = useRef(false)
  const prevMouse  = useRef({ x: 0, y: 0 })
  const spherical  = useRef({ theta: Math.PI / 4, phi: Math.PI / 3.2, radius: 160 })

  const [phase, setPhase] = useState<'idle' | 'setup' | 'advance' | 'tactical' | 'clash'>('idle')
  const [animProgress, setAnimProgress] = useState(0)
  const phaseRef = useRef<'idle' | 'setup' | 'advance' | 'tactical' | 'clash'>('idle')
  const progRef  = useRef(0)

  const [sides] = useState(() => parseSides(battle.combatants))

  const config: BattleTacticConfig = (() => {
    const slug = (battle.slug ?? '').toLowerCase()
    for (const key of Object.keys(BATTLE_TACTICS)) {
      if (slug.includes(key)) return BATTLE_TACTICS[key]
    }
    return getDefaultConfig(battle.eraId)
  })()

  const { troops1, troops2, tactic, descES, descEN, units1, units2, color1, color2 } = config

  // Visual unit count per type (cap total at 80 per side)
  const TOTAL_CAP = 80
  const perType1 = Math.ceil(TOTAL_CAP / units1.length)
  const perType2 = Math.ceil(TOTAL_CAP / units2.length)

  // ── Three.js setup ──────────────────────────────────────────
  useEffect(() => {
    if (!mountRef.current) return
    let mounted = true

    import('three').then(THREE => {
      if (!mounted || !mountRef.current) return

      const W = mountRef.current.clientWidth
      const H = mountRef.current.clientHeight || 480

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
      renderer.setSize(W, H)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.shadowMap.enabled = true
      renderer.shadowMap.type = THREE.PCFSoftShadowMap
      renderer.setClearColor(0x0A0D12)
      mountRef.current.appendChild(renderer.domElement)
      rendererRef.current = renderer

      const scene = new THREE.Scene()
      scene.fog = new THREE.FogExp2(0x0A0D12, 0.004)

      const camera = new THREE.PerspectiveCamera(55, W / H, 0.5, 1000)
      cameraRef.current = camera

      // Lights
      scene.add(new THREE.AmbientLight(0x334466, 0.8))
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
      const fill = new THREE.DirectionalLight(0x4466AA, 0.4)
      fill.position.set(-50, 30, -80)
      scene.add(fill)

      // Terrain
      const gGeo = new THREE.PlaneGeometry(320, 320, 40, 40)
      gGeo.rotateX(-Math.PI / 2)
      const gPos = gGeo.attributes.position as import('three').BufferAttribute
      for (let i = 0; i < gPos.count; i++) {
        const gx = gPos.getX(i), gz = gPos.getZ(i)
        const d = Math.sqrt(gx * gx + gz * gz)
        gPos.setY(i, d > 40
          ? Math.sin(gx * 0.04 + 1.2) * Math.cos(gz * 0.035 + 0.8) * 6
          + Math.sin(gx * 0.08) * Math.sin(gz * 0.07) * 3
          : 0)
      }
      gGeo.computeVertexNormals()
      const ground = new THREE.Mesh(gGeo, new THREE.MeshStandardMaterial({ color: 0x2C3A1E, roughness: 0.95 }))
      ground.receiveShadow = true
      scene.add(ground)
      const grid = new THREE.GridHelper(280, 28, 0x3A4A2A, 0x2A3A1A)
      grid.position.y = 0.05
      scene.add(grid)

      // Center battle line
      const bLine = new THREE.PlaneGeometry(0.5, 140)
      bLine.rotateX(-Math.PI / 2)
      const lineMesh = new THREE.Mesh(bLine, new THREE.MeshBasicMaterial({ color: 0xDAA520, opacity: 0.2, transparent: true }))
      lineMesh.position.y = 0.1
      scene.add(lineMesh)

      // ── Build armies ──────────────────────────────────────
      function buildArmy(
        unitTypes: UnitType[],
        perType: number,
        color: number,
        side: 1 | 2,
      ): { meshes: import('three').InstancedMesh[]; positions: Float32Array[] } {
        const meshes: import('three').InstancedMesh[] = []
        const positions: Float32Array[] = []

        unitTypes.forEach((uType, typeIdx) => {
          const geo = createUnitGeometry(THREE, uType)
          const h   = getUnitHeight(uType)
          const hsl = { h: 0, s: 0, l: 0 }
          const baseCol = new THREE.Color(color)
          baseCol.getHSL(hsl)
          const varCol = new THREE.Color().setHSL(hsl.h, hsl.s, Math.min(1, hsl.l * (0.85 + typeIdx * 0.1)))
          const mat = new THREE.MeshStandardMaterial({
            color: varCol, roughness: 0.7, metalness: 0.2,
            emissive: varCol.clone().multiplyScalar(0.08),
          })
          const mesh = new THREE.InstancedMesh(geo, mat, perType)
          mesh.castShadow = true

          const dummy = new THREE.Object3D()
          const pos3  = new Float32Array(perType * 3)

          for (let i = 0; i < perType; i++) {
            const { x, z } = getFormationOffset(tactic, side, typeIdx, unitTypes.length, i, perType)
            const jx = (Math.random() - 0.5) * 0.5
            const jz = (Math.random() - 0.5) * 0.5
            pos3[i * 3]     = x + jx
            pos3[i * 3 + 1] = h
            pos3[i * 3 + 2] = z + jz
            dummy.position.set(pos3[i * 3], h, pos3[i * 3 + 2])
            dummy.rotation.y = side === 1 ? -Math.PI / 2 : Math.PI / 2
            dummy.updateMatrix()
            mesh.setMatrixAt(i, dummy.matrix)
          }
          mesh.instanceMatrix.needsUpdate = true
          scene.add(mesh)
          meshes.push(mesh)
          positions.push(pos3)
        })
        return { meshes, positions }
      }

      const { meshes: m1, positions: p1 } = buildArmy(units1, perType1, color1, 1)
      const { meshes: m2, positions: p2 } = buildArmy(units2, perType2, color2, 2)
      army1MeshesRef.current = m1
      army2MeshesRef.current = m2
      army1PosRef.current    = p1
      army2PosRef.current    = p2

      // ── RAF loop ──────────────────────────────────────────
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
        updateCamera()

        const p = phaseRef.current
        if (p !== 'idle') {
          progRef.current = Math.min(progRef.current + dt * 0.14, 1)
          setAnimProgress(progRef.current)

          if      (p === 'setup'    && progRef.current >= 1) { phaseRef.current = 'advance';  setPhase('advance');  progRef.current = 0 }
          else if (p === 'advance'  && progRef.current >= 1) { phaseRef.current = 'tactical'; setPhase('tactical'); progRef.current = 0 }
          else if (p === 'tactical' && progRef.current >= 1) { phaseRef.current = 'clash';    setPhase('clash');    progRef.current = 0 }

          if (p === 'advance' || p === 'tactical' || p === 'clash') {
            const factor = p === 'advance'
              ? progRef.current * 0.55
              : p === 'tactical'
                ? 0.55 + progRef.current * 0.25
                : 0.80 + progRef.current * 0.15

            const dummy = new THREE.Object3D()
            const allMeshes  = [...m1, ...m2]
            const allPos     = [...p1, ...p2]

            allMeshes.forEach((mesh, mi) => {
              const pos = allPos[mi]
              for (let i = 0; i < mesh.count; i++) {
                mesh.getMatrixAt(i, dummy.matrix)
                dummy.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale)
                dummy.position.x = pos[i * 3] * (1 - factor)
                dummy.updateMatrix()
                mesh.setMatrixAt(i, dummy.matrix)
              }
              mesh.instanceMatrix.needsUpdate = true
            })
          }
        }

        renderer.render(scene, camera)
      }
      rafRef.current = requestAnimationFrame(animate)

      const onResize = () => {
        if (!mountRef.current) return
        const W2 = mountRef.current.clientWidth
        const H2 = mountRef.current.clientHeight || 480
        renderer.setSize(W2, H2)
        camera.aspect = W2 / H2
        camera.updateProjectionMatrix()
      }
      window.addEventListener('resize', onResize)

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
  }, [battle.eraId, battle.combatants, battle.slug])

  // ── Orbit mouse ────────────────────────────────────────────
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

  // ── Start / reset ──────────────────────────────────────────
  const startAnimation = useCallback(() => {
    if (phaseRef.current !== 'idle' && phaseRef.current !== 'clash') return
    phaseRef.current = 'setup'
    progRef.current = 0
    setPhase('setup')
    setAnimProgress(0)
  }, [])

  const resetAnimation = useCallback(() => {
    phaseRef.current = 'idle'
    progRef.current = 0
    setPhase('idle')
    setAnimProgress(0)
    import('three').then(THREE => {
      const dummy = new THREE.Object3D()
      const allMeshes = [...army1MeshesRef.current, ...army2MeshesRef.current]
      const allPos    = [...army1PosRef.current,    ...army2PosRef.current]
      allMeshes.forEach((mesh, mi) => {
        const pos = allPos[mi]
        for (let i = 0; i < mesh.count; i++) {
          dummy.position.set(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2])
          dummy.updateMatrix()
          mesh.setMatrixAt(i, dummy.matrix)
        }
        mesh.instanceMatrix.needsUpdate = true
      })
    })
  }, [])

  // Phase labels
  const PHASE_LABELS: Record<string, [string, string]> = {
    idle:     ['Posición inicial — Ejércitos listos', 'Opening positions — Armies ready'],
    setup:    ['Despliegue táctico — Formaciones tomando posición', 'Tactical deployment — Formations taking position'],
    advance:  ['Avance — Las formaciones se aproximan', 'Advance — Formations closing in'],
    tactical: [`Maniobra — ${descES.split('—')[0].trim()}`, `Maneuver — ${descEN.split('—')[0].trim()}`],
    clash:    ['⚔ Choque — Combate cuerpo a cuerpo', '⚔ Clash — Close combat'],
  }
  const [labelES, labelEN] = PHASE_LABELS[phase]

  const totalUnits = perType1 * units1.length + perType2 * units2.length

  return (
    <div className="mb-12">
      {/* Info bar */}
      <div className="flex items-start justify-between gap-4 mb-3 flex-wrap">
        <div className="flex-1 min-w-0">
          <p className="eyebrow mb-1">{isES ? 'Visualización Táctica 3D' : '3D Tactical Visualization'}</p>
          <p className="font-crimson text-smoke text-sm">{isES ? labelES : labelEN}</p>
          {(phase === 'tactical' || phase === 'clash') && (
            <p className="font-crimson text-gold/70 text-xs mt-1 italic">{isES ? descES : descEN}</p>
          )}
        </div>

        {/* Troop counts */}
        <div className="flex items-center gap-5 shrink-0">
          <div className="text-right">
            <div className="font-cinzel text-[0.5rem] tracking-widest uppercase" style={{ color: hexStr(color1) }}>
              {sides[0]}
            </div>
            <div className="font-crimson text-lg font-bold text-smoke">{formatTroops(troops1)}</div>
          </div>
          <div className="font-cinzel text-smoke/30 text-xs">vs</div>
          <div className="text-left">
            <div className="font-cinzel text-[0.5rem] tracking-widest uppercase" style={{ color: hexStr(color2) }}>
              {sides[1]}
            </div>
            <div className="font-crimson text-lg font-bold text-smoke">{formatTroops(troops2)}</div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {(phase === 'setup' || phase === 'advance' || phase === 'tactical') && (
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-24 h-1.5 bg-steel overflow-hidden">
                <div className="h-full bg-gold transition-all" style={{ width: `${animProgress * 100}%` }} />
              </div>
            </div>
          )}
          <button
            onClick={startAnimation}
            disabled={phase === 'setup' || phase === 'advance' || phase === 'tactical'}
            className="btn-primary text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {phase === 'clash'
              ? (isES ? '↺ Repetir' : '↺ Replay')
              : (isES ? '⚔ Iniciar Batalla' : '⚔ Start Battle')}
          </button>
          {phase !== 'idle' && (
            <button
              onClick={resetAnimation}
              className="font-cinzel text-[0.55rem] tracking-widest uppercase border border-gold/25 text-smoke hover:text-gold px-3 py-2 transition-all"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Tactic badge */}
      <div className="mb-2 flex items-center gap-2 flex-wrap">
        <span className="font-cinzel text-[0.5rem] tracking-widest uppercase text-smoke/50">
          {isES ? 'Táctica' : 'Tactic'}:
        </span>
        <span className="font-cinzel text-[0.55rem] tracking-widest uppercase px-2 py-0.5 border border-gold/30 text-gold/80">
          {tactic}
        </span>
        <span className="font-cinzel text-[0.5rem] tracking-widest uppercase text-smoke/40">
          {units1.join(' · ')} vs {units2.join(' · ')}
        </span>
      </div>

      {/* Canvas */}
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
            style={{ color: hexStr(color1), borderColor: hexStr(color1) + '50' }}>
            ◀ {sides[0]}
          </div>
        </div>
        <div className="absolute top-4 right-4 pointer-events-none">
          <div className="font-cinzel text-[0.55rem] tracking-[0.15em] uppercase px-2 py-1 border"
            style={{ color: hexStr(color2), borderColor: hexStr(color2) + '50' }}>
            {sides[1]} ▶
          </div>
        </div>

        {/* Unit count hint */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 pointer-events-none">
          <div className="font-cinzel text-[0.5rem] tracking-[0.2em] text-smoke/60 uppercase whitespace-nowrap">
            {totalUnits} {isES
              ? 'unidades · Arrastra para rotar · Rueda para zoom'
              : 'units · Drag to rotate · Scroll to zoom'}
          </div>
        </div>
      </div>

      {/* Era note */}
      <div className="mt-2 font-cinzel text-[0.5rem] tracking-wider text-smoke/50 uppercase text-right">
        {isES
          ? `Representación táctica — Era ${battle.eraName}`
          : `Tactical representation — ${battle.eraName} era`}
      </div>
    </div>
  )
}
