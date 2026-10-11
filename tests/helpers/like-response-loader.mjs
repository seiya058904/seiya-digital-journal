import { registerHooks } from 'node:module'
import ts from 'typescript'
import { existsSync, readFileSync } from 'node:fs'

// Load the real API and component; only public environment and CSS are fixtures.
// No local .env values or backend credentials are read.
registerHooks({
  resolve(specifier, context, next) {
    if (specifier.endsWith('.css')) return { url: 'journal-response:css', shortCircuit: true }
    if (specifier.startsWith('.')) {
      for (const extension of ['.ts', '.tsx']) {
        const url = new URL(specifier + extension, context.parentURL)
        if (existsSync(url)) return { url: url.href, shortCircuit: true }
      }
    }
    return next(specifier, context)
  },
  load(url, context, next) {
    if (url === 'journal-response:css') return { format: 'module', source: '', shortCircuit: true }
    if (url.endsWith('/src/lib/env.ts')) {
      return { format: 'module', source: `export function readPublicEnv() {
        return { apiBaseUrl: 'https://journal-fixture.invalid', isApiConfigured: true, isSupabaseConfigured: false }
      }`, shortCircuit: true }
    }
    if (/\.tsx?$/.test(url)) {
      return { format: 'module', source: ts.transpileModule(readFileSync(new URL(url), 'utf8'), {
        compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
      }).outputText, shortCircuit: true }
    }
    return next(url, context)
  },
})
