import { EmptyState } from "@/components/cloud-job-runner/empty-state";
import { type RecentJob } from "@/components/cloud-job-runner/data";
import { type DashboardJob } from "@/components/cloud-job-runner/job-api";
import { Panel } from "@/components/cloud-job-runner/panel";

type DashboardSidebarProps = {
  activeJob: DashboardJob | null;
  activeJobId: string | null;
  isPolling: boolean;
  isSubmitting: boolean;
  onClearHistory: () => void | Promise<void>;
  pollingError: string | null;
  recentJobs: RecentJob[];
  submitError: string | null;
};

function getStatusLabel(
  activeJob: DashboardJob | null,
  isSubmitting: boolean,
  isPolling: boolean,
  submitError: string | null,
  pollingError: string | null,
) {
  if (submitError) {
    return "submit failed";
  }

  if (pollingError) {
    return "poll failed";
  }

  if (typeof activeJob?.status === "string" && activeJob.status.trim()) {
    return activeJob.status;
  }

  if (isSubmitting) {
    return "submitting";
  }

  if (isPolling) {
    return "running";
  }

  return "idle";
}

function getStatusTone(statusLabel: string) {
  const normalizedStatus = statusLabel.toLowerCase();

  if (normalizedStatus === "completed") {
    return "border-emerald-400/25 bg-emerald-500/10 text-emerald-200";
  }

  if (normalizedStatus === "failed" || normalizedStatus.includes("failed")) {
    return "border-rose-400/25 bg-rose-500/10 text-rose-200";
  }

  if (
    normalizedStatus === "running" ||
    normalizedStatus === "submitting" ||
    normalizedStatus === "submitted"
  ) {
    return "border-sky-400/25 bg-sky-500/10 text-sky-200";
  }

  return "border-white/10 bg-white/[0.04] text-slate-300";
}

function formatRecentJobsCount(recentJobs: RecentJob[]) {
  const count = recentJobs.length;
  return `${count} ${count === 1 ? "job" : "jobs"}`;
}

function formatRecentJobTime(submittedAt: string) {
  const parsedDate = new Date(submittedAt);

  if (Number.isNaN(parsedDate.valueOf())) {
    return "Queued recently";
  }

  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    month: "short",
  }).format(parsedDate);
}

export function DashboardSidebar({
  activeJob,
  activeJobId,
  isPolling,
  isSubmitting,
  onClearHistory,
  pollingError,
  recentJobs,
  submitError,
}: DashboardSidebarProps) {
  const statusLabel = getStatusLabel(
    activeJob,
    isSubmitting,
    isPolling,
    submitError,
    pollingError,
  );
  const statusTone = getStatusTone(statusLabel);
  const latestError = submitError ?? pollingError;

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden">
      <Panel className="flex h-full min-h-0 flex-1 flex-col overflow-hidden p-4">
        <div className="flex shrink-0 items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-2xl font-semibold tracking-tight text-white">
              Recent Jobs
            </h2>
            <span className="text-xs text-slate-500">{formatRecentJobsCount(recentJobs)}</span>
          </div>
          <button
            className="shrink-0 rounded-[12px] border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-300 transition hover:border-rose-300/30 hover:bg-rose-500/10 hover:text-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={recentJobs.length === 0}
            onClick={() => void onClearHistory()}
            type="button"
          >
            Clear
          </button>
        </div>

        <div className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1">
          {recentJobs.length ? (
            <div className="space-y-3">
              {recentJobs.map((job, index) => {
                const isHighlighted = job.id === activeJobId || (!activeJobId && index === 0);
                const tone = getStatusTone(job.status);

                return (
                  <article
                    className={`rounded-[16px] border px-4 py-4 transition ${
                      isHighlighted
                        ? "border-sky-400/45 bg-sky-500/10 shadow-[0_0_0_1px_rgba(56,189,248,0.15)]"
                        : "border-white/8 bg-white/[0.03]"
                    }`}
                    key={job.id}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-lg font-semibold text-white">{job.name}</p>
                        <p className="mt-2 break-all text-sm text-slate-400">{job.run}</p>
                      </div>
                      <span
                        className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${tone}`}
                      >
                        {job.status}
                      </span>
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-3 text-sm text-slate-400">
                      <span>Cloud execution</span>
                      <span className="shrink-0">{formatRecentJobTime(job.submittedAt)}</span>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="flex min-h-full items-center justify-center rounded-[16px] border border-dashed border-white/10 bg-white/[0.02] px-5 py-8">
              <EmptyState
                description="Recent jobs will stack here after your first run."
                title="No recent jobs"
              />
            </div>
          )}

        </div>
      </Panel>
    </div>
  );
}
