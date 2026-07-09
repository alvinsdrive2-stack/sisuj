/**
 * Smooth scroll ke elemen form pertama yang error.
 * Fallback: scroll ke form container kalo selector ga ketemu.
 */
export function scrollToError(containerSelector?: string) {
  const selector = containerSelector || '[data-error]'
  const el = document.querySelector(selector) as HTMLElement | null

  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    el.focus({ preventScroll: true })
    // Brief highlight
    el.classList.add('ring-2', 'ring-red-400', 'rounded')
    setTimeout(() => el.classList.remove('ring-2', 'ring-red-400', 'rounded'), 2000)
    return
  }

  // Fallback: scroll ke form parent
  const form = document.querySelector('form')
  if (form) {
    form.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}
