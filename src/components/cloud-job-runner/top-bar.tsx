import { CloudIcon } from "@/components/cloud-job-runner/icons";

export function DashboardTopBar() {
  return (
    <header className="relative z-20 flex flex-col gap-4 border border-white/10 bg-[linear-gradient(180deg,rgba(24,31,44,0.99),rgba(13,18,27,0.97))] px-5 py-4 shadow-[0_28px_60px_rgba(0,0,0,0.34),0_6px_0_rgba(7,10,16,0.42),inset_0_1px_0_rgba(255,255,255,0.05)] lg:flex-row lg:items-center lg:justify-between">
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
