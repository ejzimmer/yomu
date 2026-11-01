// Android Chrome can keep the layout viewport full height while the keyboard covers the bottom of it,
// and scrolls the page to keep the focused input in view. Sizing the page to the visual viewport keeps it all on screen.
export function fitPageToVisibleViewport() {
  const { visualViewport } = window
  if (!visualViewport) return

  const root = document.querySelector<HTMLElement>('#root')!

  function resizePage() {
    document.documentElement.style.setProperty('--visible-height', `${visualViewport!.height}px`)
    if (root.scrollHeight <= visualViewport!.height) window.scrollTo(0, 0)
  }

  resizePage()
  visualViewport.addEventListener('resize', resizePage)
}
