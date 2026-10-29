import { useCallback, useEffect, useState } from 'react'
import { detectDevice } from '../lib/device.js'
import {
  canPrompt,
  dismissInstall,
  isDismissed,
  isInstalled,
  promptInstall,
  subscribeInstall,
  waitForPrompt,
} from '../lib/installPrompt.js'

/**
 * Estado de instalação da Brioverse como app.
 *  - installed: já corre instalada (ecrã inicial / janela própria)
 *  - prompt:    o browser tem o pedido nativo pronto (um toque instala)
 *  - manual:    dá para instalar, mas é a pessoa que o faz pelo menu do browser
 *  - no:        o browser não suporta instalar apps web
 */
export function useInstallApp() {
  const [, bump] = useState(0)
  const [dismissed, setDismissed] = useState(isDismissed)
  const [guideOpen, setGuideOpen] = useState(false)

  useEffect(() => subscribeInstall(() => bump((n) => n + 1)), [])

  const detected = detectDevice()
  let status = 'manual'
  if (isInstalled()) status = 'installed'
  else if (canPrompt()) status = 'prompt'
  else if (detected.pwa === 'no') status = 'no'

  // browsers que instalam com o pedido nativo (Chrome, Edge, Samsung, Opera) fora do iOS
  const nativeCapable = detected.os !== 'ios' && detected.pwa === 'yes'

  /**
   * "Instalar": abre o diálogo nativo de instalação. Se o browser ainda não o tiver
   * preparado, espera até 3 s (a activação do toque dura ~5 s no Chrome).
   * Só sem pedido nativo (iPhone, Firefox…) é que mostra os passos manuais.
   */
  const install = useCallback(async () => {
    if (canPrompt() || (nativeCapable && (await waitForPrompt(3000)))) {
      const ok = await promptInstall()
      if (ok) setDismissed(true)
      return
    }
    setGuideOpen(true)
  }, [nativeCapable])

  const dismiss = useCallback(() => {
    dismissInstall()
    setDismissed(true)
  }, [])

  return {
    status,
    device: detected,
    dismissed,
    install,
    dismiss,
    guideOpen,
    closeGuide: () => setGuideOpen(false),
  }
}
