import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LogOut, ExternalLink, Github } from "lucide-react";

const candidates: {
  id: number;
  candidate: string;
  githubUrl: string;
  larpScore: number;
  verdict: "CONTRADICTED" | "UNVERIFIED" | "SUPPORTED";
  analyzedRepos: string[];
  analyzedAt: string;
  role: string;
}[] = [];

function scoreColor(n: number) {
  if (n >= 85) return "#ef4444";
  if (n >= 65) return "#f97316";
  return "#4ade80";
}

const verdictStyle: Record<string, string> = {
  CONTRADICTED: "bg-red-950/60 text-red-400 border border-red-900",
  UNVERIFIED:   "bg-yellow-950/60 text-yellow-400 border border-yellow-900",
  SUPPORTED:    "bg-green-950/60 text-green-400 border border-green-900",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function Initials({ name }: { name: string }) {
  const letters = name.replace(/[^a-zA-Z]/g, "").slice(0, 2).toUpperCase();
  return (
    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300 flex-shrink-0">
      {letters}
    </div>
  );
}

const total = candidates.length;
const avgScore = total > 0 ? Math.round(candidates.reduce((s, c) => s + c.larpScore, 0) / total) : 0;
const flagged = candidates.filter((c) => c.larpScore >= 70).length;
const clean = candidates.filter((c) => c.larpScore < 50).length;

const stats = [
  { label: "Total Scanned", value: total },
  { label: "Avg LARP Score", value: avgScore, colored: true },
  { label: "Flagged (≥70)", value: flagged },
  { label: "Clean (<50)", value: clean },
];

export default function Dashboard() {
  return (
    <div className="h-screen overflow-hidden bg-slate-900 text-white font-sans flex flex-col">
      {/* Nav */}
      <nav className="flex-shrink-0 flex items-center justify-between px-8 py-4 border-b border-slate-800">
        <span className="text-lg font-bold tracking-tight">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-violet-400">LARP</span>
          <span className="text-white">bot</span>
        </span>
        <div className="flex items-center gap-4">
          <span className="text-xs text-slate-500">you@company.com</span>
          <Link
            to="/"
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <LogOut size={13} />
            Sign out
          </Link>
        </div>
      </nav>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="max-w-6xl mx-auto flex flex-col gap-6">

          {/* Header */}
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard</h1>
              <p className="text-sm text-slate-500 mt-0.5">Applicants scanned by LARPbot</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white text-sm font-semibold rounded-lg transition-colors">
              <Github size={14} />
              Scan new profile
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-3">
            {stats.map(({ label, value, colored }) => (
              <div key={label} className="bg-slate-800/50 border border-slate-700/60 rounded-xl px-5 py-4">
                <div className="text-[0.65rem] uppercase tracking-widest text-slate-500 font-semibold mb-1">{label}</div>
                <div
                  className="text-3xl font-black tabular-nums"
                  style={colored ? { color: scoreColor(value as number) } : undefined}
                >
                  {value}
                </div>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="bg-slate-800/30 border border-slate-700/60 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700/60 text-[0.65rem] uppercase tracking-widest text-slate-500">
                  <th className="text-left px-5 py-3 font-semibold">Candidate</th>
                  <th className="text-left px-5 py-3 font-semibold">Role</th>
                  <th className="text-left px-5 py-3 font-semibold">Repos</th>
                  <th className="text-left px-5 py-3 font-semibold">Verdict</th>
                  <th className="text-left px-5 py-3 font-semibold">LARP Score</th>
                  <th className="text-left px-5 py-3 font-semibold">Analyzed</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {candidates.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-slate-500 text-sm">
                      No candidates analyzed yet.
                    </td>
                  </tr>
                )}
                {candidates.map((c, i) => (
                  <tr
                    key={c.id}
                    className={cn(
                      "border-b border-slate-700/40 hover:bg-slate-700/20 transition-colors",
                      i === candidates.length - 1 && "border-b-0"
                    )}
                  >
                    {/* Candidate */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <Initials name={c.candidate} />
                        <div>
                          <div className="font-semibold text-slate-200">{c.candidate}</div>
                          <a
                            href={c.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[0.7rem] text-slate-500 hover:text-sky-400 transition-colors"
                          >
                            {c.githubUrl.replace("https://", "")}
                          </a>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-5 py-3.5 text-slate-400 text-xs">{c.role}</td>

                    {/* Repos */}
                    <td className="px-5 py-3.5">
                      <div className="flex flex-wrap gap-1 max-w-[180px]">
                        {c.analyzedRepos.slice(0, 2).map((r) => (
                          <span key={r} className="px-1.5 py-0.5 bg-slate-700/60 border border-slate-600/50 rounded text-[0.65rem] text-slate-400">
                            {r}
                          </span>
                        ))}
                        {c.analyzedRepos.length > 2 && (
                          <span className="px-1.5 py-0.5 text-[0.65rem] text-slate-500">
                            +{c.analyzedRepos.length - 2}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Verdict */}
                    <td className="px-5 py-3.5">
                      <span className={cn("px-2 py-0.5 rounded text-[0.65rem] font-bold uppercase tracking-wider", verdictStyle[c.verdict])}>
                        {c.verdict}
                      </span>
                    </td>

                    {/* Score */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-slate-700 rounded overflow-hidden">
                          <div
                            className="h-full rounded"
                            style={{ width: `${c.larpScore}%`, background: scoreColor(c.larpScore) }}
                          />
                        </div>
                        <span className="font-bold tabular-nums text-xs" style={{ color: scoreColor(c.larpScore) }}>
                          {c.larpScore}
                        </span>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="px-5 py-3.5 text-slate-500 text-xs">{formatDate(c.analyzedAt)}</td>

                    {/* Action */}
                    <td className="px-5 py-3.5">
                      <Link
                        to="/report"
                        className="flex items-center gap-1 text-xs text-slate-400 hover:text-sky-400 transition-colors"
                      >
                        View <ExternalLink size={11} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
