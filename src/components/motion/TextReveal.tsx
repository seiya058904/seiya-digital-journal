import { motion } from 'framer-motion'
import type { PropsWithChildren } from 'react'

type TextRevealProps = PropsWithChildren<{
  className?: string
  delay?: number
}>

export function TextReveal({ children, className, delay = 0 }: TextRevealProps) {
  return (
    <span className={`text-reveal ${className ?? ''}`}>
      <motion.span
        initial={{ y: '108%' }}
        animate={{ y: 0 }}
        transition={{ duration: 0.82, delay, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.span>
    </span>
  )
}
