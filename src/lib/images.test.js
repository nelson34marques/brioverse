import { describe, expect, it } from 'vitest'
import { directImageUrl } from './images.js'

describe('directImageUrl', () => {
  it('converte links de partilha do Google Drive', () => {
    expect(directImageUrl('https://drive.google.com/file/d/abc123456789/view?usp=sharing')).toBe(
      'https://lh3.googleusercontent.com/d/abc123456789',
    )
    expect(directImageUrl('https://drive.google.com/open?id=abc123456789')).toBe(
      'https://lh3.googleusercontent.com/d/abc123456789',
    )
  })

  it('converte GitHub blob para raw', () => {
    expect(directImageUrl('https://github.com/user/repo/blob/main/img/logo.png')).toBe(
      'https://raw.githubusercontent.com/user/repo/main/img/logo.png',
    )
  })

  it('converte a página do Imgur para o ficheiro directo', () => {
    expect(directImageUrl('https://imgur.com/aBcD123')).toBe('https://i.imgur.com/aBcD123.png')
  })

  it('converte Dropbox para raw', () => {
    expect(directImageUrl('https://www.dropbox.com/s/abc/logo.png?dl=0')).toBe(
      'https://dl.dropboxusercontent.com/s/abc/logo.png?raw=1',
    )
  })

  it('deixa passar links desconhecidos (limpos)', () => {
    expect(directImageUrl('  https://cdn.example.com/a.png  ')).toBe('https://cdn.example.com/a.png')
    expect(directImageUrl(null)).toBe('')
  })
})
