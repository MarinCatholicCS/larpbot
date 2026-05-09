import { useEffect, useRef, useState } from "react";
import { Boxes } from "@/components/ui/background-boxes";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { Github } from "lucide-react";

const MORPH_DURATION = 1.0;

function MorphBlock({
  nodeA,
  nodeB,
  spacer,
  active,
  className,
  gooey = true,
}: {
  nodeA: React.ReactNode;
  nodeB: React.ReactNode;
  spacer: React.ReactNode;
  active: boolean;
  className?: string;
  gooey?: boolean;
}) {
  const refA = useRef<HTMLDivElement>(null);
  const refB = useRef<HTMLDivElement>(null);
  const morphRef = useRef(0);
  const activeRef = useRef(active);

  useEffect(() => { activeRef.current = active; }, [active]);

  useEffect(() => {
    let raf: number;
    let lastTime = performance.now();

    function tick(now: number) {
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      const target = activeRef.current ? 1 : 0;
      const dir = target > morphRef.current ? 1 : -1;
      morphRef.current = Math.max(0, Math.min(1, morphRef.current + (dt / MORPH_DURATION) * dir));
      const f = morphRef.current;

      if (refA.current && refB.current) {
        if (f <= 0.001) {
          refA.current.style.filter = "";
          refA.current.style.opacity = "1";
          refA.current.style.pointerEvents = "";
          refB.current.style.filter = "blur(40px)";
          refB.current.style.opacity = "0";
          refB.current.style.pointerEvents = "none";
        } else if (f >= 0.999) {
          refB.current.style.filter = "";
          refB.current.style.opacity = "1";
          refB.current.style.pointerEvents = "";
          refA.current.style.filter = "blur(40px)";
          refA.current.style.opacity = "0";
          refA.current.style.pointerEvents = "none";
        } else {
          refA.current.style.pointerEvents = "none";
          refB.current.style.pointerEvents = "none";
          refB.current.style.filter = `blur(${Math.min(8 / f - 8, 100)}px)`;
          refB.current.style.opacity = String(Math.pow(f, 0.4));
          const inv = 1 - f;
          refA.current.style.filter = `blur(${Math.min(8 / inv - 8, 100)}px)`;
          refA.current.style.opacity = String(Math.pow(inv, 0.4));
        }
      }

      raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      className={cn("relative", className)}
      style={gooey ? { filter: "url(#gooey-threshold)" } : undefined}
    >
      {/* invisible spacer — always reserves height of the taller state */}
      <div className="invisible pointer-events-none">{spacer}</div>
      <div ref={refA} className="absolute inset-0 flex items-center justify-center">
        {nodeA}
      </div>
      <div
        ref={refB}
        className="absolute inset-0 flex items-center justify-center"
        style={{ filter: "blur(40px)", opacity: "0", pointerEvents: "none" }}
      >
        {nodeB}
      </div>
    </div>
  );
}

export default function Landing() {
  const [howItWorks, setHowItWorks] = useState(false);

  const headingA = (
    <h1 className="text-5xl md:text-6xl font-black tracking-tight text-white leading-[1.08] text-center">
      Stop hiring{" "}
      <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-violet-400">
        LARPers
      </span>
    </h1>
  );

  const headingB = (
    <h1 className="text-5xl md:text-6xl font-black tracking-tight text-white leading-[1.08] text-center">
      How it works
    </h1>
  );

  const paraA = (
    <div className="flex flex-col items-center gap-3 w-full max-w-sm">
      <div className="w-full flex rounded-lg overflow-hidden border border-slate-700 bg-slate-800/60 focus-within:border-sky-500 transition-colors">
        <input
          type="email"
          placeholder="you@company.com"
          className="flex-1 bg-transparent px-4 py-3 text-sm text-white placeholder-slate-500 outline-none"
        />
        <button className="px-4 py-3 bg-sky-500 hover:bg-sky-400 text-white text-sm font-semibold transition-colors whitespace-nowrap">
          Connect Google
        </button>
      </div>
    </div>
  );

  const paraB = (
    <p className="text-slate-300 text-lg leading-relaxed text-center max-w-xl">
      When a candidate reaches out, TensorLink activates LARPbot — an agent that
      starts investigating before you ever open their résumé. It combs their
      GitHub, cross-references every skill and project they've claimed, then
      surfaces a LARP Score and a detailed evidence report you can act on.
      <span className="block mt-4 text-slate-500 italic text-base">
        The antidote to inflated profiles and AI-generated résumés.
      </span>
    </p>
  );

  return (
    <div className="h-screen overflow-hidden bg-slate-900 text-white font-sans flex flex-col">
      <svg className="absolute w-0 h-0" aria-hidden="true">
        <defs>
          <filter id="gooey-threshold">
            <feColorMatrix
              in="SourceGraphic"
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 255 -140"
            />
          </filter>
        </defs>
      </svg>

      {/* Nav */}
      <nav className="relative z-30 flex items-center justify-between px-8 py-5 border-b border-slate-800/60 flex-shrink-0">
        <span className="text-lg font-bold tracking-tight text-white">
          LARP<span className="text-sky-400">bot</span>
        </span>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setHowItWorks((v) => !v)}
            className="text-sm text-slate-400 hover:text-white transition-colors"
          >
            How it works
          </button>
          <button className="text-sm bg-white text-slate-900 font-semibold px-4 py-1.5 rounded-md hover:bg-slate-100 transition-colors">
            Sign in
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative flex-1 overflow-hidden flex flex-col items-center justify-center">
        <div className="absolute inset-0 w-full h-full bg-slate-900 z-20 [mask-image:radial-gradient(transparent_30%,white_80%)] pointer-events-none" />

        <Boxes />

        <div className="relative z-20 text-center px-4 max-w-2xl mx-auto w-full flex flex-col items-center gap-8">
          <div className="flex flex-col items-center gap-5 w-full">
            <MorphBlock
              nodeA={headingA}
              nodeB={headingB}
              spacer={headingA}
              active={howItWorks}
              className="w-full"
            />
            <MorphBlock
              nodeA={paraA}
              nodeB={paraB}
              spacer={paraB}
              active={howItWorks}
              className="w-full"
              gooey={false}
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/report"
              className="w-full sm:w-auto px-6 py-3 bg-sky-500 hover:bg-sky-400 text-white font-semibold rounded-lg transition-colors text-sm"
            >
              See a sample report
            </Link>
            <button className="w-full sm:w-auto px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold rounded-lg transition-colors text-sm flex items-center justify-center gap-2">
              <Github size={16} />
              Connect GitHub
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
