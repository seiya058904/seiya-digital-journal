import { About } from '../components/sections/About'
import { Contact } from '../components/sections/Contact'
import { Gallery } from '../components/sections/Gallery'
import { Hero } from '../components/sections/Hero'
import { Interests } from '../components/sections/Interests'
import { Journey } from '../components/sections/Journey'
import { Thoughts } from '../components/sections/Thoughts'

export function HomePage() {
  return (
    <main>
      <Hero />
      <About />
      <Interests />
      <Gallery />
      <Thoughts />
      <Journey />
      <Contact />
    </main>
  )
}
