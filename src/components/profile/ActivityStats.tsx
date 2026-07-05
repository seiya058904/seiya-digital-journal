import { motion, useReducedMotion } from 'framer-motion'

import { CountUp } from '../effects/react-bits/CountUp'

type ActivityStatsProps = {
  comments: number
  likes: number
}

const easeOut = [0.22, 1, 0.36, 1] as const

export function ActivityStats({ comments, likes }: ActivityStatsProps) {
  const reduceMotion = useReducedMotion() ?? false

  return (
    <motion.section
      className="profile-stats"
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.34, ease: easeOut, delay: reduceMotion ? 0 : 0.28 }}
      aria-label="Activity stats"
    >
      <StatBlock
        label="Comments"
        value={comments}
        reduceMotion={reduceMotion}
      />
      <div className="profile-stats__divider" aria-hidden="true" />
      <StatBlock
        label="Likes"
        value={likes}
        reduceMotion={reduceMotion}
      />
    </motion.section>
  )
}

function StatBlock({
  label,
  value,
  reduceMotion,
}: {
  label: string
  value: number
  reduceMotion: boolean
}) {
  return (
    <div className="profile-stat">
      {reduceMotion ? (
        <span className="profile-stat__value">{value}</span>
      ) : (
        <CountUp
          to={value}
          className="profile-stat__value"
          duration={0.6}
        />
      )}
      <span className="profile-stat__label">{label}</span>
    </div>
  )
}
