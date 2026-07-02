import './GlassIcons.css'

type GlassIconItem = {
  icon: React.ReactElement
  color: string
  label: string
  customClass?: string
}

type GlassIconsProps = {
  items: GlassIconItem[]
  className?: string
}

const gradientMapping: Record<string, string> = {
  blue: 'linear-gradient(hsl(223, 90%, 50%), hsl(208, 90%, 50%))',
  purple: 'linear-gradient(hsl(283, 90%, 50%), hsl(268, 90%, 50%))',
  red: 'linear-gradient(hsl(3, 90%, 50%), hsl(348, 90%, 50%))',
  indigo: 'linear-gradient(hsl(253, 90%, 50%), hsl(238, 90%, 50%))',
  orange: 'linear-gradient(hsl(43, 90%, 50%), hsl(28, 90%, 50%))',
  green: 'linear-gradient(hsl(123, 90%, 40%), hsl(108, 90%, 40%))',
}

export function GlassIcons({ items, className }: GlassIconsProps) {
  const getBackgroundStyle = (color: string) => {
    if (gradientMapping[color]) {
      return { background: gradientMapping[color] }
    }
    return { background: color }
  }

  return (
    <div className={`rb-glass-icons ${className || ''}`}>
      {items.map((item, index) => (
        <button
          key={index}
          className={`rb-glass-icon ${item.customClass || ''}`}
          aria-label={item.label}
          type="button"
        >
          <span className="rb-glass-icon__back" style={getBackgroundStyle(item.color)} />
          <span className="rb-glass-icon__front">
            <span className="rb-glass-icon__icon" aria-hidden="true">
              {item.icon}
            </span>
          </span>
          <span className="rb-glass-icon__label">{item.label}</span>
        </button>
      ))}
    </div>
  )
}
