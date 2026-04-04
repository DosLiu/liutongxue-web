import Aurora from './components/Aurora';

const navItems = [
  { label: 'Work', href: '#' },
  { label: 'Process', href: '#' },
  { label: 'Capability', href: '#' },
  { label: 'Contact', href: 'mailto:hello@liutongxue.com' }
];

const proofPoints = ['首屏信息架构', '氛围动效', '可信视觉', '高转化 CTA'];

const statCards = [
  { value: '01', label: '聚焦 only first screen' },
  { value: 'React 19', label: '首屏实现基线' },
  { value: 'Tailwind 4', label: '快速审阅可迭代' }
];

export default function App() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050816] text-white selection:bg-cyan-300/30">
      <div className="absolute inset-0 opacity-80">
        <Aurora colorStops={['#52b6ff', '#7c5cff', '#14f1d9']} amplitude={1.1} blend={0.4} speed={1.1} />
      </div>
      <div className="hero-grid absolute inset-0 opacity-70" />
      <div className="hero-vignette absolute inset-0" />
      <div className="hero-haze absolute left-1/2 top-[18%] h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-cyan-400/15 blur-[140px]" />

      <header className="relative z-20 mx-auto flex w-full max-w-7xl items-center justify-between px-6 pt-6 md:px-10 lg:px-12">
        <a
          href="#"
          className="inline-flex items-center gap-3 rounded-full border border-white/12 bg-white/8 px-4 py-2 text-sm font-medium tracking-[0.24em] text-white/88 backdrop-blur-xl"
        >
          <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-300 shadow-[0_0_16px_rgba(52,211,153,0.95)]" />
          LIUTONGXUE
        </a>

        <nav className="hidden items-center gap-2 rounded-full border border-white/12 bg-black/25 p-1 text-sm text-white/78 backdrop-blur-xl md:flex">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="rounded-full px-4 py-2 transition duration-300 hover:bg-white hover:text-slate-950"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <a
          href="https://github.com/DosLiu/liutongxue-web"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-cyan-300/40 bg-cyan-300/10 px-4 py-2 text-sm font-medium text-cyan-100 transition duration-300 hover:border-cyan-200 hover:bg-cyan-200 hover:text-slate-950"
        >
          GitHub
          <span aria-hidden="true">↗</span>
        </a>
      </header>

      <main className="relative z-10 mx-auto flex min-h-[calc(100vh-88px)] max-w-7xl items-center px-6 pb-10 pt-10 md:px-10 lg:px-12">
        <div className="grid w-full items-center gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:gap-8">
          <section className="max-w-3xl">
            <div className="inline-flex items-center gap-3 rounded-full border border-white/12 bg-white/7 px-4 py-2 text-xs font-medium uppercase tracking-[0.28em] text-white/75 backdrop-blur-md">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/12 text-sm">✦</span>
              Review-ready first screen
            </div>

            <h1 className="mt-6 max-w-4xl text-5xl font-semibold leading-[1.02] tracking-[-0.06em] text-white md:text-7xl">
              把 AI 产品首页，
              <span className="hero-shine block bg-gradient-to-r from-cyan-200 via-white to-violet-200 bg-clip-text text-transparent">
                做成值得停留的第一眼。
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-white/68 md:text-lg">
              这次只做首屏：顶部导航、标题层级、主视觉、CTA 与背景氛围动效。先把“第一眼的信任感与辨识度”做到可审，首屏以下内容本轮全部留白。
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              {proofPoints.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/12 bg-white/7 px-4 py-2 text-sm text-white/72 backdrop-blur-md"
                >
                  {item}
                </span>
              ))}
            </div>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <a
                href="https://github.com/DosLiu/liutongxue-web"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition duration-300 hover:translate-y-[-1px] hover:bg-cyan-200"
              >
                查看项目仓库
                <span aria-hidden="true">→</span>
              </a>
              <a
                href="mailto:hello@liutongxue.com?subject=Homepage%20First%20Screen%20Review"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/14 bg-white/6 px-6 py-3 text-sm font-semibold text-white/88 backdrop-blur-md transition duration-300 hover:border-white/28 hover:bg-white/12"
              >
                发起首屏审阅
                <span aria-hidden="true">↗</span>
              </a>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {statCards.map((card) => (
                <div
                  key={card.label}
                  className="rounded-[1.5rem] border border-white/12 bg-white/7 p-4 backdrop-blur-xl shadow-[0_20px_80px_rgba(4,12,32,0.35)]"
                >
                  <div className="text-lg font-semibold text-cyan-200">{card.value}</div>
                  <div className="mt-1 text-sm leading-6 text-white/62">{card.label}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="relative flex items-center justify-center lg:justify-end">
            <div className="hero-float relative w-full max-w-[34rem] overflow-hidden rounded-[2rem] border border-white/12 bg-white/8 p-4 shadow-[0_40px_140px_rgba(0,0,0,0.55)] backdrop-blur-2xl md:p-5">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.16),transparent_52%)]" />
              <div className="absolute inset-x-6 top-6 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
              <div className="relative rounded-[1.6rem] border border-white/10 bg-[#07101f]/88 p-6">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.24em] text-white/45">
                  <span>first screen system</span>
                  <span>v0.1 review</span>
                </div>

                <div className="relative mt-6 overflow-hidden rounded-[1.8rem] border border-cyan-300/16 bg-[#081427] px-6 pb-8 pt-10">
                  <div className="hero-rings absolute inset-0 opacity-80" />
                  <div className="absolute left-1/2 top-20 h-48 w-48 -translate-x-1/2 rounded-full bg-gradient-to-br from-cyan-300/55 via-violet-400/38 to-transparent blur-3xl" />
                  <div className="absolute inset-x-10 top-10 h-24 rounded-full border border-white/10 bg-white/5 blur-2xl" />

                  <div className="relative mx-auto flex h-[19rem] max-w-[19rem] items-center justify-center">
                    <div className="absolute inset-3 rounded-full border border-cyan-200/20" />
                    <div className="absolute inset-10 rounded-full border border-white/12" />
                    <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.28),transparent_60%)]" />
                    <div className="hero-core relative h-36 w-36 rounded-full border border-white/18 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.9),rgba(103,232,249,0.4)_32%,rgba(67,56,202,0.28)_70%,rgba(8,20,39,0.15)_100%)] shadow-[0_0_60px_rgba(56,189,248,0.25)]" />
                    <div className="hero-ping absolute inset-4 rounded-full border border-cyan-200/20" />
                  </div>

                  <div className="relative z-10 mt-5 grid gap-3 sm:grid-cols-2">
                    {[
                      ['Navigation', '信息密度降低，入口更干净'],
                      ['Hero Copy', '标题-副标题-CTA 层级清晰'],
                      ['Atmosphere', 'Aurora + grid + glow 建立记忆点'],
                      ['Trust', '首屏直接呈现实现方式与审阅状态']
                    ].map(([title, desc]) => (
                      <div
                        key={title}
                        className="rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-white/68 backdrop-blur-md"
                      >
                        <div className="font-medium uppercase tracking-[0.18em] text-white/54">{title}</div>
                        <div className="mt-2 leading-6">{desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
