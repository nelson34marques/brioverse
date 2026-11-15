import { describe, expect, it } from 'vitest'
import { EMPTY_APP, formFromApp, slugify, validateApp } from './publish.js'

const validPwa = (over = {}) => ({
  ...EMPTY_APP,
  title: 'Bora Estudar',
  category: 'education',
  type: 'pwa',
  shortDescription: 'Uma app de estudo para estudantes.',
  fullDescription:
    'Uma aplicação completa para organizar apontamentos, criar planos de estudo e acompanhar o progresso ao longo do semestre.',
  appUrl: 'https://bora.example.com',
  iconUrl: 'https://cdn.example.com/icon.png',
  screenshots: ['https://cdn.example.com/1.png', 'https://cdn.example.com/2.png'],
  version: '1.2.0',
  confirm: true,
  ...over,
})

describe('slugify', () => {
  it('remove acentos e normaliza separadores', () => {
    expect(slugify('Educação & Código')).toBe('educacao-codigo')
    expect(slugify('  Olá, Mundo!  ')).toBe('ola-mundo')
  })

  it('limita o tamanho a 60 caracteres', () => {
    expect(slugify('a'.repeat(100))).toHaveLength(60)
  })
})

describe('validateApp', () => {
  it('aceita um PWA completo', () => {
    expect(validateApp(validPwa())).toEqual({})
  })

  it('exige descrições, links https e pelo menos 2 capturas', () => {
    const errors = validateApp(
      validPwa({
        shortDescription: 'curta',
        fullDescription: 'pequena',
        appUrl: 'http://inseguro.example.com',
        iconUrl: '',
        screenshots: [],
      }),
    )
    expect(errors.shortDescription).toBe('dev.err_short_desc')
    expect(errors.fullDescription).toBe('dev.err_full_desc')
    expect(errors.appUrl).toBe('dev.err_url')
    expect(errors.iconUrl).toBe('dev.err_icon')
    expect(errors.screenshots).toBe('dev.err_shots')
  })

  it('para APK exige um link que termine em .apk', () => {
    expect(
      validateApp(
        validPwa({
          type: 'apk',
          appUrl: '',
          apkUrl: 'https://github.com/user/repo/releases/download/v1/app.zip',
        }),
      ).apkUrl,
    ).toBe('dev.err_apk')

    expect(
      validateApp(
        validPwa({
          type: 'apk',
          appUrl: '',
          apkUrl: 'https://github.com/user/repo/releases/download/v1/app.apk',
        }),
      ).apkUrl,
    ).toBeUndefined()
  })

  it('em edição as novidades são obrigatórias', () => {
    expect(validateApp(validPwa(), { editing: true }).changelog).toBe('dev.err_changelog')
    expect(validateApp(validPwa({ changelog: 'Correcções e melhorias.' }), { editing: true })).toEqual({})
  })

  it('exige aceitar os termos', () => {
    expect(validateApp(validPwa({ confirm: false })).confirm).toBe('dev.err_confirm')
  })
})

describe('formFromApp', () => {
  it('reconstrói o formulário a partir de um app guardado', () => {
    const form = formFromApp({
      title: 'Bora',
      category: 'education',
      type: 'apk',
      keywords: ['estudo', 'escola'],
      apkUrl: 'https://cdn.example.com/bora.apk',
      webUrl: 'https://bora.example.com',
      screenshots: ['https://cdn.example.com/1.png', 'https://cdn.example.com/2.png'],
      version: '2.0.0',
    })
    expect(form.title).toBe('Bora')
    expect(form.apkUrl).toBe('https://cdn.example.com/bora.apk')
    expect(form.webUrl).toBe('https://bora.example.com')
    expect(form.keywords).toBe('estudo, escola')
    expect(form.confirm).toBe(true)
  })
})
