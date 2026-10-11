import { registerHooks } from 'node:module'
import ts from 'typescript'
import { readFileSync, existsSync } from 'node:fs'
registerHooks({
 resolve(specifier,context,next){
  if (specifier==='framer-motion') return {url:'journal:motion',shortCircuit:true}
  if (specifier==='lucide-react') return {url:'journal:icons',shortCircuit:true}
  if (specifier.endsWith('/auth/AuthContext')) return {url:'journal:auth',shortCircuit:true}
  if (specifier.endsWith('.css')) return {url:'journal:css',shortCircuit:true}
  if(specifier.startsWith('.')) for(const ext of ['.ts','.tsx']){const url=new URL(specifier+ext,context.parentURL);if(existsSync(url))return {url:url.href,shortCircuit:true}}
  return next(specifier,context)
 },
 load(url,context,next){
  const modules={
   motion:`import React from '${new URL('../../node_modules/react/index.js', import.meta.url).href}'; export const motion=new Proxy({}, {get:(_,key)=>key}); export const AnimatePresence=({children})=>children;export const useReducedMotion=()=>false`,
   icons:`import React from '${new URL('../../node_modules/react/index.js', import.meta.url).href}'; const Icon=()=>React.createElement('noscript');export const ArrowLeft=Icon;export const Eye=Icon;export const EyeOff=Icon;export const LoaderCircle=Icon;export const Mail=Icon`,
   auth:`export const useAuth=()=>globalThis.__authPageHarnessAuth()`,
   css:``}
  if(url.startsWith('journal:'))return {format:'module',source:modules[url.slice(8)],shortCircuit:true}
  if(url.endsWith('.tsx')) return {format:'module',source:ts.transpileModule(readFileSync(new URL(url),'utf8'),{compilerOptions:{jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText,shortCircuit:true}
  if(url.endsWith('.ts')) return {format:'module',source:ts.transpileModule(readFileSync(new URL(url),'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText,shortCircuit:true}
  return next(url,context)
 }
})
