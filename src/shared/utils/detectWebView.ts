export function isIOSInAppBrowser(): boolean {
  if (typeof navigator === 'undefined' || typeof window === 'undefined') return false

  const ua = navigator.userAgent
  const isIOS = /iPhone|iPad|iPod/.test(ua)
  if (!isIOS) return false

  if ((navigator as { standalone?: boolean }).standalone === true) return false

  const webkit = (window as { webkit?: { messageHandlers?: unknown } }).webkit
  if (
    webkit &&
    typeof webkit.messageHandlers === 'object' &&
    webkit.messageHandlers !== null
  ) {
    return true
  }

  return false
}
