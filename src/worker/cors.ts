export function parseAllowedOrigins(value: string): string[] {
  return [...new Set(
    value
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
  )]
}

export function isOriginAllowed(origin: string | null, allowedOrigins: string[]): boolean {
  if (!origin) return false
  return allowedOrigins.includes(origin)
}
