type ChapterProps = {
  number: string
  title: string
}

export function Chapter({ number, title }: ChapterProps) {
  return (
    <div className="chapter" aria-hidden="true">
      <span>{number}</span>
      <i />
      <ScrambledText as="span" radius={54} duration={0.7} speed={0.35}>
        {title}
      </ScrambledText>
    </div>
  )
}
import { ScrambledText } from '../effects/react-bits/ScrambledText'
