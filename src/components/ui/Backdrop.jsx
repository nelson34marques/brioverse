import { useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { useTheme } from '../../hooks/useTheme.js'

/**
 * Fundo em canvas, leve (~20 formas, ~30 fps, pára com a aba escondida,
 * estático com "reduzir movimento").
 *  variant="apps"  → silhuetas de ícones de app (quadrados arredondados)
 *  variant="games" → símbolos de jogo (círculo, triângulo, quadrado, cruz) com um toque laranja
 *  variant="dev"   → hexágonos e chevrons de código (</>), em azul e verde (modo desenvolvedor)
 */
const ACCENT = [42, 157, 143]
const BLUE = [38, 120, 160]
const ORANGE = [255, 159, 10]
const SHAPES = ['circle', 'triangle', 'square', 'cross']
const DEV_SHAPES = ['hex', 'code', 'code', 'tile']

export default function Backdrop({ variant = 'apps' }) {
  const ref = useRef(null)
  const { isDark } = useTheme()

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return undefined
    const ctx = canvas.getContext('2d')
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
    const games = variant === 'games'
    const dev = variant === 'dev'

    let w = 0
    let h = 0
    let tiles = []
    let raf = 0
    let last = 0
    let running = true

    const rand = (a, b) => a + Math.random() * (b - a)

    function spawn(anywhere) {
      const size = games ? rand(28, 110) : dev ? rand(30, 120) : rand(36, 150)
      const r = Math.random()
      return {
        x: rand(-size, w),
        y: anywhere ? rand(-size, h) : h + size,
        size,
        speed: rand(0.08, 0.22) * (size / 90),
        sway: rand(0.0004, 0.0009),
        phase: rand(0, Math.PI * 2),
        rot: rand(-0.25, 0.25),
        spin: rand(-0.0003, 0.0003),
        color: games ? (r < 0.55 ? ACCENT : r < 0.8 ? ORANGE : BLUE) : dev ? (r < 0.55 ? BLUE : ACCENT) : r < 0.7 ? ACCENT : BLUE,
        alpha: rand(0.035, 0.09) * (isDark ? 2.1 : 1),
        shape: games ? SHAPES[Math.floor(Math.random() * SHAPES.length)] : dev ? DEV_SHAPES[Math.floor(Math.random() * DEV_SHAPES.length)] : 'tile',
      }
    }

    function makeTiles() {
      const count = Math.max(10, Math.min(24, Math.round((w * h) / 70000)))
      tiles = Array.from({ length: count }, () => spawn(true))
    }

    function resize() {
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      makeTiles()
    }

    function roundedRect(x, y, s, r) {
      ctx.beginPath()
      ctx.moveTo(x + r, y)
      ctx.arcTo(x + s, y, x + s, y + s, r)
      ctx.arcTo(x + s, y + s, x, y + s, r)
      ctx.arcTo(x, y + s, x, y, r)
      ctx.arcTo(x, y, x + s, y, r)
      ctx.closePath()
    }

    // Símbolos de jogo, desenhados centrados na origem, só com contorno grosso.
    function symbol(shape, s) {
      const half = s / 2
      ctx.beginPath()
      if (shape === 'circle') {
        ctx.arc(0, 0, half, 0, Math.PI * 2)
      } else if (shape === 'triangle') {
        ctx.moveTo(0, -half)
        ctx.lineTo(half, half * 0.8)
        ctx.lineTo(-half, half * 0.8)
        ctx.closePath()
      } else if (shape === 'square') {
        roundedRect(-half, -half, s, s * 0.18)
      } else if (shape === 'hex') {
        for (let i = 0; i < 6; i++) {
          const a = (Math.PI / 3) * i - Math.PI / 6
          const px = Math.cos(a) * half
          const py = Math.sin(a) * half
          if (i === 0) ctx.moveTo(px, py)
          else ctx.lineTo(px, py)
        }
        ctx.closePath()
      } else if (shape === 'code') {
        // < >
        const k = half * 0.55
        ctx.moveTo(-k * 0.6, -half * 0.7)
        ctx.lineTo(-half, 0)
        ctx.lineTo(-k * 0.6, half * 0.7)
        ctx.moveTo(k * 0.6, -half * 0.7)
        ctx.lineTo(half, 0)
        ctx.lineTo(k * 0.6, half * 0.7)
      } else {
        ctx.moveTo(-half, -half)
        ctx.lineTo(half, half)
        ctx.moveTo(half, -half)
        ctx.lineTo(-half, half)
      }
    }

    function drawGlow() {
      const col = games ? ORANGE : dev ? BLUE : ACCENT
      const g = ctx.createRadialGradient(w * 0.5, -h * 0.1, 0, w * 0.5, -h * 0.1, Math.max(w, h) * 0.6)
      g.addColorStop(0, `rgba(${col}, ${isDark ? 0.22 : 0.08})`)
      g.addColorStop(1, `rgba(${col}, 0)`)
      ctx.fillStyle = g
      ctx.fillRect(0, 0, w, h)
    }

    function frame(t, animate) {
      ctx.clearRect(0, 0, w, h)
      drawGlow()
      for (let i = 0; i < tiles.length; i++) {
        const tile = tiles[i]
        if (animate) {
          tile.y -= tile.speed
          tile.rot += tile.spin
          if (tile.y + tile.size < -20) tiles[i] = spawn(false)
        }
        const sx = tile.x + Math.sin(t * tile.sway + tile.phase) * 14
        ctx.save()
        ctx.translate(sx + tile.size / 2, tile.y + tile.size / 2)
        ctx.rotate(tile.rot)
        if (tile.shape === 'tile') {
          roundedRect(-tile.size / 2, -tile.size / 2, tile.size, tile.size * 0.22)
          ctx.fillStyle = `rgba(${tile.color}, ${tile.alpha})`
          ctx.fill()
          ctx.lineWidth = 1
          ctx.strokeStyle = `rgba(${tile.color}, ${tile.alpha * 1.6})`
          ctx.stroke()
        } else {
          symbol(tile.shape, tile.size)
          ctx.lineWidth = dev ? Math.max(2, tile.size * 0.07) : Math.max(3, tile.size * 0.12)
          ctx.lineCap = 'round'
          ctx.lineJoin = 'round'
          ctx.strokeStyle = `rgba(${tile.color}, ${tile.alpha * 2})`
          ctx.stroke()
        }
        ctx.restore()
      }
    }

    function loop(now) {
      if (!running) return
      raf = requestAnimationFrame(loop)
      if (now - last < 33) return
      last = now
      frame(now, true)
    }

    function onVisibility() {
      if (document.hidden) {
        running = false
        cancelAnimationFrame(raf)
      } else if (!reduce) {
        running = true
        raf = requestAnimationFrame(loop)
      }
    }

    let resizeTimer = 0
    function onResize() {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => {
        resize()
        if (reduce) frame(0, false)
      }, 120)
    }

    resize()
    window.addEventListener('resize', onResize)
    document.addEventListener('visibilitychange', onVisibility)
    if (reduce) frame(0, false)
    else raf = requestAnimationFrame(loop)

    return () => {
      running = false
      cancelAnimationFrame(raf)
      clearTimeout(resizeTimer)
      window.removeEventListener('resize', onResize)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [isDark, variant])

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}
    />
  )
}

Backdrop.propTypes = {
  variant: PropTypes.oneOf(['apps', 'games', 'dev']),
}
