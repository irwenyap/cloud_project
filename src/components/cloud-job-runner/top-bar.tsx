import { CloudIcon } from "@/components/cloud-job-runner/icons";

export function DashboardTopBar() {
  return (
    <header className="flex flex-col gap-4 rounded-[20px] border border-white/8 bg-white/[0.04] px-5 py-4 shadow-[0_28px_65px_rgba(0,0,0,0.35)] backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-[14px] border border-white/10 bg-white/5 text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
          <CloudIcon />
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-slate-400">
            Cloud Distributed Job Runner
          </p>
          <h1 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
            PyWeb
          </h1>
        </div>
      </div>
    </header>
  );
}

