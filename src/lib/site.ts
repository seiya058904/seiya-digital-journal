export function buildSiteUrl(origin: string, basePath: string): string {
  const normalizedOrigin = origin.replace(/\/+$/, '')
  const normalizedBasePath = basePath === '/'
    ? '/'
    : `/${basePath.replace(/^\/+|\/+$/g, '')}/`

  return normalizedBasePath === '/'
    ? `${normalizedOrigin}/`
    : `${normalizedOrigin}${normalizedBasePath}`
}

export function buildBrowserSiteUrl(): string {
  if (typeof window === 'undefined') return '/'
  return buildSiteUrl(window.location.origin, import.meta.env.BASE_URL)
}
