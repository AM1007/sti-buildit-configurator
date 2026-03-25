import { MobileNav } from './MobileNav'
import { DesktopNav } from './DesktopNav'

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="md:hidden">
        <MobileNav />
      </div>
      <div className="hidden md:block">
        <DesktopNav />
      </div>
    </header>
  )
}
