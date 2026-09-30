import { registerHooks } from 'node:module'
import { existsSync } from 'node:fs'
registerHooks({
  resolve(specifier, context, next) {
    if (specifier.startsWith('.')) {
      const url = new URL(specifier + '.ts', context.parentURL)
      if (existsSync(url)) return { url: url.href, shortCircuit: true }
    }
    return next(specifier, context)
  },
  load(url, context, next) {
    if (url.endsWith('/src/lib/env.ts')) return { format: 'module', shortCircuit: true,
      source: `export const readPublicEnv = () => ({supabaseUrl:'https://auth.example.invalid',supabasePublishableKey:'synthetic-public',apiBaseUrl:'https://api.example.invalid',isSupabaseConfigured:true,isApiConfigured:true})` }
    return next(url, context)
  },
})
