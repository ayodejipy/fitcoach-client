
const HERO_IMAGE =
  "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=2070&q=85"

const HERO_STYLE = {
  background: `
    linear-gradient(180deg, rgba(15,36,24,.30) 0%, rgba(15,36,24,.55) 50%, rgba(15,36,24,.85) 100%),
    url('${HERO_IMAGE}') center 35% / cover no-repeat
  `,
} as const

export function LoginHeroPanel() {
  return (
    <div
      className="relative flex h-full min-h-[280px] flex-col justify-between p-8 text-white lg:p-14 xl:p-16"
      style={HERO_STYLE}
    >
      {/* Wordmark */}
      <div className="relative z-10 flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white/15 font-display text-[16px] font-bold leading-none ring-1 ring-white/15 backdrop-blur-sm">
          F
        </div>
        <div className="text-[14px] font-extrabold tracking-[0.08em]">
          FitCoach
        </div>
      </div>

      {/* Desktop headline (lg+) */}
      <div className="relative z-10 hidden max-w-[640px] lg:block">
        <h1
          className="font-display text-[56px] font-light leading-[1.02] tracking-[-0.015em] xl:text-[72px] 2xl:text-[80px]"
          style={{ fontVariationSettings: "'opsz' 100, 'SOFT' 50" }}
        >
          Show up.
          <br />
          Every week.
          <br />
          <em
            className="not-italic"
            style={{
              fontVariationSettings: "'opsz' 108, 'SOFT' 100",
              fontWeight: 400,
            }}
          >
            Together.
          </em>
        </h1>
        <div className="mt-8 inline-flex items-center gap-2.5 rounded-full bg-white/10 px-3 py-1.5 text-[12.5px] font-medium tracking-[0.02em] ring-1 ring-white/15 backdrop-blur-md">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[color:var(--green-pale)] text-[10px] font-bold leading-none text-[color:var(--green-deep)]">
            ★
          </span>
          Weekly accountability with your coach
        </div>
      </div>

      {/* Mobile + tablet headline (<lg) */}
      <div className="relative z-10 lg:hidden">
        <h1
          className="font-display text-[36px] font-light leading-[1.05] tracking-[-0.015em] sm:text-[44px] md:text-[52px]"
          style={{ fontVariationSettings: "'opsz' 84, 'SOFT' 50" }}
        >
          Show up. Every week.
        </h1>
        <div className="mt-4 inline-flex items-center gap-2.5 rounded-full bg-white/10 px-3 py-1.5 text-[12px] font-medium tracking-[0.02em] ring-1 ring-white/15 backdrop-blur-md">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[color:var(--green-pale)] text-[10px] font-bold leading-none text-[color:var(--green-deep)]">
            ★
          </span>
          Weekly accountability with your coach
        </div>
      </div>

      {/* Bottom note (desktop only) */}
      <div className="relative z-10 hidden items-center justify-between text-[11px] uppercase tracking-[0.18em] text-white/45 lg:flex">
        <span>© FitCoach 2026</span>
        <span>Weekly accountability</span>
      </div>
    </div>
  )
}
