type ChapterProps = {
  number: string
  title: string
}

export function Chapter({ number, title }: ChapterProps) {
  return (
    <div className="chapter" aria-hidden="true">
      <span>{number}</span>
      <i />
      <span>{title}</span>
    </div>
  )
}
