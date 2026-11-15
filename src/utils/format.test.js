import { describe, expect, it } from 'vitest'
import { compactNumber, rating1, shortDate, sizeMb } from './format.js'

describe('format', () => {
  it('rating1 arredonda a uma casa decimal', () => {
    expect(rating1(4.26)).toBe('4.3')
    expect(rating1(0)).toBe('–')
  })

  it('sizeMb mostra MB com uma casa e nada quando é 0', () => {
    expect(sizeMb(12.34)).toBe('12.3 MB')
    expect(sizeMb(0)).toBeNull()
    expect(sizeMb(null)).toBeNull()
  })

  it('compactNumber devolve um traço sem valor', () => {
    expect(compactNumber(null)).toBe('–')
    expect(typeof compactNumber(1500, 'pt')).toBe('string')
  })

  it('shortDate devolve vazio sem data', () => {
    expect(shortDate(0)).toBe('')
    expect(shortDate(Date.UTC(2026, 0, 15), 'pt')).toContain('2026')
  })
})
