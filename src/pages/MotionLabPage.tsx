import { ArrowLeft } from 'lucide-react'
import { effects, effectCategories } from '../data/effects'
import { EffectCard } from '../components/lab/EffectCard'
import { ReactBitsDemo } from '../components/lab/ReactBitsDemo'
import '../components/lab/EffectCard.css'
import '../components/lab/HeavyEffectGate.css'
import './MotionLabPage.css'

export function MotionLabPage() {
  return (
    <main className="motion-lab">
      <div className="motion-lab__header">
        <a href="#/" className="motion-lab__back">
          <ArrowLeft aria-hidden="true" size={16} strokeWidth={1.5} />
          <span>Back to Journal</span>
        </a>
        <h1 className="motion-lab__title">Motion Lab</h1>
        <p className="motion-lab__subtitle">
          An experimental collection of interactive effects — curated from React Bits,
          adapted for this journal.
        </p>
      </div>

      <div className="motion-lab__grid">
        {effectCategories.map((category) => {
          const categoryEffects = effects.filter((e) => e.category === category)
          if (categoryEffects.length === 0) return null
          return (
            <section key={category} className="motion-lab__section">
              <h2 className="motion-lab__category">{category}</h2>
              <div className="motion-lab__cards">
                {categoryEffects.map((effect) => (
                  <EffectCard key={effect.id} {...effect}>
                    {effect.integrationStatus === 'real-demo' ? (
                      <ReactBitsDemo effectId={effect.id} />
                    ) : null}
                  </EffectCard>
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </main>
  )
}
