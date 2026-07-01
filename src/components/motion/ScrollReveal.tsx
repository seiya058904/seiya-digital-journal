import { motion } from 'framer-motion'
import type { PropsWithChildren } from 'react'

type ScrollRevealProps = PropsWithChildren<{
  className?: string
  delay?: number
  amount?: number
}>

export function ScrollReveal({
  children,
  className,
  delay = 0,
  amount = 0.2,
}: ScrollRevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 34 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
