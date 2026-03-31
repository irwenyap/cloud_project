import { EmptyState } from "@/components/cloud-job-runner/empty-state";
import { UploadIcon } from "@/components/cloud-job-runner/icons";
import { jobTypeOptions, recentJobs } from "@/components/cloud-job-runner/data";
import { Panel } from "@/components/cloud-job-runner/panel";

export function DashboardSidebar() {
  return (
    <div className="flex min-h-0 flex-col gap-4">
      <Panel className="p-4">
        <button className="flex w-full items-center justify-center gap-3 rounded-[14px] border border-sky-300/20 bg-[linear-gradient(180deg,#45a9ff,#1b73dd)] px-4 py-4 text-base font-semibold text-white shadow-[0_20px_35px_rgba(19,92,194,0.35)] transition hover:brightness-105">
          <span className="text-2xl leading-none">+</span>
          New Job
        </button>

        <div className="mt-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-400">
            Job Type Selector
          </p>
          <div className="mt-3 rounded-[14px] border border-white/8 bg-[#10161f]/90 p-1">
            <select
              aria-label="Job type selector"
              className="w-full appearance-none rounded-[10px] border border-transparent bg-transparent px-4 py-3 text-sm text-slate-100 outline-none"
              defaultValue={jobTypeOptions[0].value}
            >
              {jobTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold tracking-tight text-white">
              Recent Jobs
            </h2>
            <span className="text-xs text-slate-500">{recentJobs.length} active</span>
          </div>

          <div className="mt-4 space-y-3">
            {recentJobs.length ? (
              recentJobs.map((job, index) => (
                <article
                  className={`rounded-[16px] border px-4 py-4 transition ${
                    index === 0
                      ? "border-sky-400/45 bg-sky-500/10 shadow-[0_0_0_1px_rgba(56,189,248,0.15)]"
                      : "border-white/8 bg-white/[0.03]"
                  }`}
                  key={job.id}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold text-white">{job.name}</p>
                      <p className="mt-2 text-sm text-slate-400">{job.run}</p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${job.tone}`}
                    >
                      {job.status}
                    </span>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-sm text-slate-400">
                    <span>Cloud execution</span>
                    <span>{job.time}</span>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-[16px] border border-dashed border-white/10 bg-white/[0.02] px-5 py-8">
                <EmptyState
                  description="Recent jobs will show up here after your first run."
                  title="No recent jobs"
                />
              </div>
            )}
          </div>
        </div>
      </Panel>

      <Panel className="p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-tight text-white">
            Document Upload
          </h2>
          <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-400">
            Empty
          </span>
        </div>

        <div className="mt-4 flex min-h-[172px] items-center justify-center rounded-[16px] border border-dashed border-white/12 bg-[#111722]/75 px-6 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
          <EmptyState
            description="Upload files to attach data and config inputs."
            icon={<UploadIcon />}
            title="No documents uploaded"
          />
        </div>
      </Panel>
    </div>
  );
}
