/*
 * Only allow redirects inside this app: "/library" is fine, but "https://evil.site"
 * or "//evil.site" would send the user to another website after logging in.
 * Browsers also treat "/\evil.site" like "//evil.site", so that is rejected too.
 */
export function safeRedirect(target, fallback = '/') {
  if (typeof target !== 'string' || !target.startsWith('/') || target.startsWith('//') || target.startsWith('/\\'))
    return fallback
  return target
}
