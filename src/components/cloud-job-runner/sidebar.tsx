import { EmptyState } from "@/components/cloud-job-runner/empty-state";
import { type JobSession } from "@/components/cloud-job-runner/data";
import { Panel } from "@/components/cloud-job-runner/panel";

function getStatusLabel(status: JobSession["status"]) {
  return status.replace("_", " ");
}

function getStatusTone(status: JobSession["status"]) {
  if (status === "completed") {
    return "border-emerald-400/25 bg-emerald-500/10 text-emerald-200";
  }

  if (status === "failed" || status === "poll_failed") {
    return "border-rose-400/25 bg-rose-500/10 text-rose-200";
  }

  if (status === "running" || status === "pending" || status === "submitted") {
    return "border-sky-400/25 bg-sky-500/10 text-sky-200";
  }

  return "border-white/10 bg-white/[0.04] text-slate-300";
}

function formatJobCount(jobHistory: JobSession[]) {
  const count = jobHistory.length;
  return `${count} ${count === 1 ? "job" : "jobs"}`;
}

function formatJobTime(submittedAt: string) {
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

function formatExecutionDuration(session: JobSession) {
  const submittedAt = new Date(session.submittedAt);
  const endTime = new Date(session.completedAt ?? new Date().toISOString());

  if (Number.isNaN(submittedAt.valueOf()) || Number.isNaN(endTime.valueOf())) {
    return "--";
  }

  const durationInSeconds = Math.max(
    0,
    Math.round((endTime.getTime() - submittedAt.getTime()) / 1000),
  );

  return `${durationInSeconds}s`;
}

function getJobTitle(session: JobSession) {
  if (session.jobId) {
    return `Job ${session.jobId.slice(0, 8)}`;
  }

  return session.status === "failed" ? "Failed Submission" : "Pending Run";
}

function getJobSubtitle(session: JobSession) {
  if (session.jobId) {
    return `Job ID ${session.jobId}`;
  }

  return "Waiting for backend job ID";
}

type DashboardSidebarProps = {
  activeTabId: string;
  jobHistory: JobSession[];
  onClearHistory: () => void | Promise<void>;
  onOpenJob: (sessionId: string) => void;
};

export function DashboardSidebar({
  activeTabId,
  jobHistory,
  onClearHistory,
  onOpenJob,
}: DashboardSidebarProps) {
  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden">
      <Panel className="relative z-10 flex h-full min-h-0 flex-1 flex-col overflow-hidden border-r p-4" variant="raised">
        <div className="flex shrink-0 items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-2xl font-semibold tracking-tight text-white">
              Recent Jobs
            </h2>
            <span className="text-xs text-slate-500">{formatJobCount(jobHistory)}</span>
          </div>
          <button
            className="shrink-0 rounded-[12px] border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-300 transition hover:border-rose-300/30 hover:bg-rose-500/10 hover:text-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={jobHistory.length === 0}
            onClick={() => void onClearHistory()}
            type="button"
          >
            Clear
          </button>
        </div>

        <div className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1">
          {jobHistory.length ? (
            <div className="space-y-3">
              {jobHistory.map((session) => {
                const isActive = activeTabId === session.id;
                const tone = getStatusTone(session.status);
                const showCompletionHighlight = session.hasUnseenCompletion && !isActive;

                return (
                  <button
                    className={`w-full rounded-[16px] border px-4 py-4 text-left transition ${
                      isActive
                        ? "border-sky-400/45 bg-sky-500/10 shadow-[0_0_0_1px_rgba(56,189,248,0.15)]"
                        : showCompletionHighlight
                          ? "border-amber-300/65 bg-amber-400/[0.05] shadow-[0_0_0_1px_rgba(253,224,71,0.3),0_0_28px_rgba(253,224,71,0.18)] hover:border-amber-200/80 hover:bg-amber-400/[0.08]"
                        : "border-white/8 bg-white/[0.03] hover:border-white/14 hover:bg-white/[0.05]"
                    }`}
                    key={session.id}
                    onClick={() => onOpenJob(session.id)}
                    type="button"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-lg font-semibold text-white">
                          {getJobTitle(session)}
                        </p>
                        <p className="mt-2 break-all text-sm text-slate-400">
                          {getJobSubtitle(session)}
                        </p>
                      </div>
                      <span
                        className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${tone}`}
                      >
                        {getStatusLabel(session.status)}
                      </span>
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-3 text-sm text-slate-400">
                      <span>{formatExecutionDuration(session)}</span>
                      <span className="shrink-0">{formatJobTime(session.submittedAt)}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex min-h-full items-center justify-center rounded-[16px] border border-dashed border-white/10 bg-white/[0.02] px-5 py-8">
              <EmptyState
                description="Run a job to create a session and keep it in history."
                title="No recent jobs"
              />
            </div>
          )}
        </div>
      </Panel>
    </div>
  );
}
