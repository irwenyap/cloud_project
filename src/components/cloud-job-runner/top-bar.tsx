import { CloudIcon, SearchIcon } from "@/components/cloud-job-runner/icons";

export function DashboardTopBar() {
  return (
    <header className="flex flex-col gap-4 rounded-[20px] border border-white/8 bg-white/[0.04] px-5 py-4 shadow-[0_28px_65px_rgba(0,0,0,0.35)] backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-[14px] border border-white/10 bg-white/5 text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
          <CloudIcon />
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-slate-400">
            Control Plane
          </p>
          <h1 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
            Cloud Distributed Job Runner
          </h1>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* <label className="flex min-w-[220px] items-center gap-3 rounded-[14px] border border-white/8 bg-[#111722]/90 px-4 py-3 text-slate-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
          <SearchIcon />
          <input
            aria-label="Search jobs"
            className="w-full bg-transparent text-sm text-slate-200 outline-none placeholder:text-slate-500"
            defaultValue=""
            placeholder="Search"
          />
        </label> */}

        {/* <button className="flex items-center gap-3 self-start rounded-[14px] border border-white/8 bg-[#111722]/90 px-3 py-2 pr-4 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition hover:border-white/15 hover:bg-white/[0.08]">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[linear-gradient(135deg,#e9d5c2,#9fb3d7)] text-sm font-semibold text-slate-900">
            AR
          </span>
          <span>
            <span className="block text-sm font-semibold text-white">Alex R.</span>
            <span className="block text-xs text-slate-400">Workspace Owner</span>
          </span>
        </button> */}
      </div>
    </header>
  );
}
