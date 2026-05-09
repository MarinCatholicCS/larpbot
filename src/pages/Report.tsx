import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const data = {
  candidate: "stananan",
  githubUrl: "https://github.com/stananan",
  analyzedRepos: ["react-dashboard", "ml-pipeline-demo", "distributed-auth-service"],
  overallLarpScore: 84,
  overallVerdict: "Aggressively inflated. The GitHub tells a different story than the pitch.",
  subscores: {
    skillInflation: 91,
    projectSubstance: 78,
    roleAuthenticity: 88,
    codeDepth: 72,
  },
  claims: [
    {
      claim: "3 years of React experience",
      verdict: "CONTRADICTED" as const,
      confidence: 0.91,
      summary: "React activity spans 7 months, not 3 years. Earliest React commit dates to April 2024.",
      evidence: "Oldest React repo created April 2024. No React code before that. Total React LOC across all repos: 2,847 — one semester of weekend projects, not three years.",
      receipts: [
        { type: "repo", label: "Oldest React repo", detail: "react-dashboard created April 14, 2024 — 7 months ago, not 3 years", url: "https://github.com/stananan/react-dashboard" },
        { type: "commit", label: "First React commit", detail: "\"init react app\" — April 14, 2024", url: "https://github.com/stananan/react-dashboard/commit/a1b2c3d" },
        { type: "pattern", label: "Total React LOC", detail: "2,847 lines across 3 repos. Consistent with ~6 months of part-time work.", url: "https://github.com/stananan" },
      ],
      whatToAskNext: "Ask them to walk through a React performance issue they debugged — specifically why they chose their state management approach and what they'd do differently now.",
    },
    {
      claim: "Built a production ML pipeline",
      verdict: "UNVERIFIED" as const,
      confidence: 0.87,
      summary: "Found an ML-adjacent repo but no evidence of production deployment. It's a Jupyter notebook with hardcoded sample data.",
      evidence: "ml-pipeline-demo contains 1 notebook, 340 lines, sample CSV hardcoded as input, no deployment config, no CI, no requirements.txt pinned versions. README claims 'serves predictions in real-time' — no server code found.",
      receipts: [
        { type: "file", label: "README claim vs reality", detail: "README: 'production ML pipeline serving real-time predictions.' Repo contents: 1 Jupyter notebook, 1 CSV file, no API, no server.", url: "https://github.com/stananan/ml-pipeline-demo/blob/main/README.md" },
        { type: "file", label: "No deployment config", detail: "No Dockerfile, no CI/CD, no requirements.txt, no .env.example. Nothing that suggests this ever ran outside a laptop.", url: "https://github.com/stananan/ml-pipeline-demo" },
        { type: "commit", label: "Suspiciously linear history", detail: "14 commits, all in a single 6-hour window on Nov 3. No iteration, no debugging, no reverts.", url: "https://github.com/stananan/ml-pipeline-demo/commits/main" },
      ],
      whatToAskNext: "Ask them to describe the infrastructure — where it ran, how predictions were served, what the latency was, how they monitored it. If it was production, they'll have instant answers.",
    },
    {
      claim: "Led backend architecture for a real-time system",
      verdict: "CONTRADICTED" as const,
      confidence: 0.83,
      summary: "Found the repo. Candidate authored 9% of commits. All contributions were in a single 3-day window after the core architecture was already in place.",
      evidence: "distributed-auth-service: 247 commits total. Candidate: 22 commits. Core architecture — WebSocket layer, Redis pub/sub, connection pooling — committed by @nico-dev across weeks 1–4. Candidate joined in week 5, contributed UI glue code and README.",
      receipts: [
        { type: "pattern", label: "Commit attribution", detail: "22 of 247 commits (9%). Architecture commits: 0. Contributions: README, minor config changes, one bugfix.", url: "https://github.com/stananan/distributed-auth-service/graphs/contributors" },
        { type: "commit", label: "Architecture already done", detail: "WebSocket layer implemented by @nico-dev on Oct 1. Candidate's first commit: Oct 29 — 'update readme and fix typo'", url: "https://github.com/stananan/distributed-auth-service/commit/f4e5d6c" },
        { type: "file", label: "Core architecture files", detail: "websocket.ts, redis-pubsub.ts, connection-pool.ts — all authored by @nico-dev, zero commits from candidate on these files.", url: "https://github.com/stananan/distributed-auth-service/blob/main/src/websocket.ts" },
      ],
      whatToAskNext: "Ask them to draw the architecture from memory — specifically the connection pooling strategy and why they chose Redis pub/sub over alternatives. Ask what they'd change if rebuilding it today.",
    },
  ],
  redemption: "The React Dashboard has genuinely thoughtful component composition for someone 7 months in. The custom hook pattern in useDataFetcher.ts shows real understanding, not just tutorial copying. There's a developer here — just not the one described.",
  weirdestCommits: [
    { message: "fix fix fix fix fix", repo: "react-dashboard", url: "https://github.com/stananan/react-dashboard/commit/b2c3d4e" },
    { message: "idk why this works but it does", repo: "ml-pipeline-demo", url: "https://github.com/stananan/ml-pipeline-demo/commit/c3d4e5f" },
    { message: "final", repo: "react-dashboard", url: "https://github.com/stananan/react-dashboard/commit/d4e5f6a" },
    { message: "final FINAL", repo: "react-dashboard", url: "https://github.com/stananan/react-dashboard/commit/e5f6a7b" },
    { message: "ok actually final", repo: "react-dashboard", url: "https://github.com/stananan/react-dashboard/commit/f6a7b8c" },
    { message: "update readme and fix typo", repo: "distributed-auth-service", url: "https://github.com/stananan/distributed-auth-service/commit/f4e5d6c" },
    { message: "asdfghjkl", repo: "ml-pipeline-demo", url: "https://github.com/stananan/ml-pipeline-demo/commit/a7b8c9d" },
    { message: "please work", repo: "distributed-auth-service", url: "https://github.com/stananan/distributed-auth-service/commit/b8c9d0e" },
  ],
  analyzedAt: "2026-05-09T14:32:11Z",
};

function scoreColor(n: number) {
  if (n >= 85) return "#ef4444";
  if (n >= 65) return "#f97316";
  return "#facc15";
}

const subscoreMap: Record<string, string> = {
  skillInflation: "Skill Inflation",
  projectSubstance: "Project Substance",
  roleAuthenticity: "Role Authenticity",
  codeDepth: "Code Depth",
};

const receiptTypeClass: Record<string, string> = {
  repo: "bg-[#1e2d40] text-sky-400",
  commit: "bg-[#2a1f40] text-violet-400",
  file: "bg-[#1f2d20] text-green-400",
  pattern: "bg-[#2d2200] text-yellow-400",
};

const verdictClass: Record<string, string> = {
  CONTRADICTED: "bg-[#3f0d0d] text-red-400 border border-[#7f1d1d]",
  UNVERIFIED: "bg-[#2d2200] text-yellow-400 border border-[#78350f]",
  SUPPORTED: "bg-[#0d2a14] text-green-400 border border-[#14532d]",
};

function CountUpScore({ target }: { target: number }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const duration = 1800;
    const start = performance.now();
    function easeOut(t: number) { return 1 - Math.pow(1 - t, 3); }
    function lerpColor(t: number) {
      const r = t < 0.5 ? Math.round(74 + (250 - 74) * (t / 0.5)) : Math.round(250 + (239 - 250) * ((t - 0.5) / 0.5));
      const g = t < 0.5 ? Math.round(222 + (204 - 222) * (t / 0.5)) : Math.round(204 + (68 - 204) * ((t - 0.5) / 0.5));
      const b = t < 0.5 ? Math.round(128 + (21 - 128) * (t / 0.5)) : Math.round(21 + (68 - 21) * ((t - 0.5) / 0.5));
      return `rgb(${r},${g},${b})`;
    }
    let raf: number;
    function step(ts: number) {
      const progress = Math.min((ts - start) / duration, 1);
      const val = Math.round(easeOut(progress) * target);
      setCurrent(val);
      if (progress < 1) raf = requestAnimationFrame(step);
    }
    const timer = setTimeout(() => { raf = requestAnimationFrame(step); }, 150);
    return () => { clearTimeout(timer); cancelAnimationFrame(raf); };
  }, [target]);

  return (
    <span
      style={{ color: scoreColor(current) }}
      className="text-[3.5rem] font-black leading-none tabular-nums tracking-[-2px] transition-colors"
    >
      {current}
    </span>
  );
}

function GooeyCommits({ commits }: { commits: typeof data.weirdestCommits }) {
  const texts = commits.map((c) => `"${c.message}"`);
  const elA = useRef<HTMLSpanElement>(null);
  const elB = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const MORPH_TIME = 1;
    const COOLDOWN_TIME = 0.5;
    const DISPLAY_TIME = 2;
    let index = texts.length - 1;
    let morph = 0;
    let cooldown = COOLDOWN_TIME;
    let lastTime = performance.now();
    let raf: number;

    if (elA.current) elA.current.textContent = texts[index % texts.length];
    if (elB.current) elB.current.textContent = texts[(index + 1) % texts.length];

    function setMorph(fraction: number) {
      if (!elA.current || !elB.current) return;
      elB.current.style.filter = `blur(${Math.min(8 / fraction - 8, 100)}px)`;
      elB.current.style.opacity = `${Math.pow(fraction, 0.4) * 100}%`;
      const inv = 1 - fraction;
      elA.current.style.filter = `blur(${Math.min(8 / inv - 8, 100)}px)`;
      elA.current.style.opacity = `${Math.pow(inv, 0.4) * 100}%`;
    }

    function doCooldown() {
      if (!elA.current || !elB.current) return;
      morph = 0;
      elB.current.style.filter = "";
      elB.current.style.opacity = "100%";
      elA.current.style.filter = "";
      elA.current.style.opacity = "0%";
    }

    function tick(now: number) {
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      const wasCooling = cooldown > 0;
      cooldown -= dt;
      if (cooldown <= 0) {
        if (wasCooling) {
          index = (index + 1) % texts.length;
          if (elA.current) elA.current.textContent = texts[index % texts.length];
          if (elB.current) elB.current.textContent = texts[(index + 1) % texts.length];
        }
        morph -= cooldown;
        cooldown = 0;
        let fraction = morph / MORPH_TIME;
        if (fraction > 1) { cooldown = DISPLAY_TIME; fraction = 1; }
        setMorph(fraction);
      } else {
        doCooldown();
      }
      raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [texts]);

  return (
    <div className="flex items-center gap-3 mb-8 text-[0.82rem] text-slate-500">
      <span>💀 actual commit messages:</span>
      <svg className="absolute w-0 h-0" aria-hidden="true">
        <defs>
          <filter id="threshold">
            <feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 255 -140" />
          </filter>
        </defs>
      </svg>
      <div className="relative flex-1 h-[1.4em]" style={{ filter: "url(#threshold)" }}>
        <span ref={elA} className="absolute left-0 top-0 whitespace-nowrap font-mono text-[0.82rem] text-slate-200 opacity-0" />
        <span ref={elB} className="absolute left-0 top-0 whitespace-nowrap font-mono text-[0.82rem] text-slate-200 opacity-0" />
      </div>
    </div>
  );
}

type Verdict = "CONTRADICTED" | "UNVERIFIED" | "SUPPORTED";
type TabId = "evidence" | "receipts" | "asknext";

function ClaimCard({ claim, index }: { claim: typeof data.claims[0]; index: number }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<TabId>("evidence");
  const pct = Math.round(claim.confidence * 100);

  return (
    <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl overflow-hidden">
      <div
        className="flex items-start justify-between gap-4 px-[1.1rem] pt-4 pb-3 cursor-pointer select-none hover:bg-[#1a1a1a] transition-colors"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex-1">
          <div className="text-[0.95rem] font-semibold text-[#e5e5e5]">"{claim.claim}"</div>
          <div className="text-[#aaa] font-normal text-[0.85rem] mt-0.5">{claim.summary}</div>
        </div>
        <span className={cn("text-[0.65rem] font-bold tracking-[0.8px] uppercase px-2 py-[3px] rounded flex-shrink-0", verdictClass[claim.verdict as Verdict])}>
          {claim.verdict}
        </span>
        <span className="text-[0.7rem] text-[#555] flex-shrink-0 mt-0.5">{open ? "▲" : "▼"}</span>
      </div>

      {open && (
        <div className="border-t border-[#222]">
          {/* Tabs */}
          <div className="flex border-b border-[#222]">
            {(["evidence", "receipts", "asknext"] as TabId[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "px-4 py-[0.55rem] text-[0.72rem] font-semibold uppercase tracking-[0.7px] border-b-2 -mb-px transition-colors",
                  tab === t ? "text-[#e5e5e5] border-sky-400" : "text-[#555] border-transparent hover:text-[#aaa]"
                )}
              >
                {t === "receipts" ? `Receipts (${claim.receipts.length})` : t === "asknext" ? "Ask Next" : "Evidence"}
              </button>
            ))}
          </div>

          {tab === "evidence" && (
            <div className="px-[1.1rem] py-4">
              <div className="flex items-center gap-2 text-[0.75rem] text-[#666] mb-3">
                <span>Confidence</span>
                <div className="flex-1 h-1 bg-[#2a2a2a] rounded max-w-[120px]">
                  <div className="h-full bg-sky-400 rounded" style={{ width: `${pct}%` }} />
                </div>
                <span>{pct}%</span>
              </div>
              <div className="bg-[#0f0f0f] border border-[#222] rounded-md px-3 py-3 text-[0.8rem] text-[#aaa] leading-relaxed">
                {claim.evidence}
              </div>
            </div>
          )}

          {tab === "receipts" && (
            <div className="px-[1.1rem] py-4 flex flex-col gap-3">
              {claim.receipts.map((r, i) => (
                <div key={i} className="flex gap-2 items-start text-[0.78rem]">
                  <span className={cn("flex-shrink-0 px-1.5 py-[1px] rounded text-[0.65rem] font-semibold uppercase tracking-[0.5px]", receiptTypeClass[r.type])}>
                    {r.type}
                  </span>
                  <div className="flex-1">
                    <div className="font-semibold text-[#ccc]">
                      <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline">
                        {r.label}
                      </a>
                    </div>
                    <div className="text-[#777] mt-0.5">{r.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "asknext" && (
            <div className="px-[1.1rem] py-4">
              <div className="bg-[#0e1a2a] border border-[#1e3a5f] rounded-md px-4 py-3 text-[0.85rem] text-[#93c5fd] leading-relaxed">
                <div className="text-[0.65rem] font-bold uppercase tracking-[1px] text-sky-400 mb-1">Ask next</div>
                {claim.whatToAskNext}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Report() {
  const analyzedDate = new Date(data.analyzedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-[#e0e0e0] p-8 font-sans">
      <div className="max-w-[860px] mx-auto">
        <div className="mb-4">
          <Link to="/" className="text-xs text-slate-500 hover:text-sky-400 transition-colors">
            ← Back to LARPbot
          </Link>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between gap-6 mb-8 flex-wrap">
          <div>
            <h1 className="text-[1.75rem] font-bold tracking-[-0.5px] text-[#f5f5f5]">{data.candidate}</h1>
            <div className="mt-1 text-[0.85rem]">
              <a href={data.githubUrl} target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline">
                {data.githubUrl}
              </a>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {data.analyzedRepos.map((r) => (
                <span key={r} className="bg-[#1e1e1e] border border-[#333] rounded px-2 py-0.5 text-[0.78rem] text-[#888]">
                  {r}
                </span>
              ))}
            </div>
          </div>
          <div className="text-center flex-shrink-0">
            <CountUpScore target={data.overallLarpScore} />
            <div className="text-[0.7rem] uppercase tracking-[1px] text-[#888] mt-1">LARP Score</div>
          </div>
        </div>

        {/* Verdict */}
        <div className="bg-[#1a1a1a] border-l-4 border-red-500 rounded-md px-[1.1rem] py-[0.85rem] mb-8 text-[0.9rem] text-red-300 italic">
          {data.overallVerdict}
        </div>

        {/* Subscores */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3 mb-8">
          {Object.entries(data.subscores).map(([k, v]) => {
            const color = scoreColor(v);
            return (
              <div key={k} className="bg-[#161616] border border-[#2a2a2a] rounded-lg px-4 py-[0.85rem]">
                <div className="text-[0.7rem] uppercase tracking-[0.8px] text-[#777] mb-2">
                  {subscoreMap[k] ?? k}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-[#2a2a2a] rounded overflow-hidden">
                    <div className="h-full rounded" style={{ width: `${v}%`, background: color }} />
                  </div>
                  <span className="text-[0.85rem] font-bold min-w-[28px] text-right" style={{ color }}>
                    {v}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Claims */}
        <div className="text-[0.7rem] uppercase tracking-[1px] text-[#666] mb-4">Claims Analysis</div>
        <div className="flex flex-col gap-5 mb-8">
          {data.claims.map((c, i) => (
            <ClaimCard key={i} claim={c} index={i} />
          ))}
        </div>

        {/* Weirdest commits */}
        <div className="text-[0.7rem] uppercase tracking-[1px] text-[#666] mb-4">Weirdest Commits</div>
        <GooeyCommits commits={data.weirdestCommits} />

        {/* Redemption */}
        <div className="bg-[#0d1f0f] border border-[#1a3d1a] rounded-lg px-[1.1rem] py-4 mb-8 text-[0.85rem] text-green-300 leading-relaxed">
          <div className="text-[0.65rem] uppercase tracking-[1px] text-green-400 font-bold mb-1">Redemption arc</div>
          {data.redemption}
        </div>

        {/* Footer */}
        <div className="text-[0.72rem] text-[#444] text-center pt-4 border-t border-[#1e1e1e]">
          Analyzed {analyzedDate}
        </div>
      </div>
    </div>
  );
}
