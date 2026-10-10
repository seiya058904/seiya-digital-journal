import { registerHooks } from 'node:module'
import ts from 'typescript'
import { readFileSync, existsSync } from 'node:fs'
registerHooks({
 resolve(specifier,context,next){
  if (specifier.endsWith('/lib/api')) return {url:'journal:api',shortCircuit:true}
  if (specifier.endsWith('.css')) return {url:'journal:css',shortCircuit:true}
  if(specifier.startsWith('.')) for(const ext of ['.ts','.tsx']){const url=new URL(specifier+ext,context.parentURL);if(existsSync(url))return {url:url.href,shortCircuit:true}}
  return next(specifier,context)
 },
 load(url,context,next){
  const modules={
   api:`export function fetchLikeCount(...args){return globalThis.__likeHarnessApi().fetchLikeCount(...args)}\nexport function likeTarget(...args){return globalThis.__likeHarnessApi().likeTarget(...args)}\nexport function createComment(){throw new Error('not used')}`,
   css:``}
  if(url.startsWith('journal:'))return {format:'module',source:modules[url.slice(8)],shortCircuit:true}
  if(url.endsWith('.tsx')) return {format:'module',source:ts.transpileModule(readFileSync(new URL(url),'utf8'),{compilerOptions:{jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText,shortCircuit:true}
  if(url.endsWith('.ts')) return {format:'module',source:ts.transpileModule(readFileSync(new URL(url),'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText,shortCircuit:true}
  return next(url,context)
 }
})
