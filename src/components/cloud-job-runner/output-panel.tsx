"use client";

import { useState } from "react";

import {
  outputTabs,
  type OutputTab,
} from "@/components/cloud-job-runner/data";
import { EmptyState } from "@/components/cloud-job-runner/empty-state";
import {
  isTerminalJobStatus,
  type DashboardJob,
} from "@/components/cloud-job-runner/job-api";
import { Panel } from "@/components/cloud-job-runner/panel";

const emptyTabCopy: Record<OutputTab, { title: string; description: string }> = {
  Output: {
    title: "Terminal idle",
    description: "Run a job to stream execution output here.",
  },
  Logs: {
    title: "No logs available",
    description: "Logs will appear after a job starts running.",
  },
  Details: {
    title: "No run selected",
    description: "Execution details will show up for the active job.",
  },
};

type DashboardOutputPanelProps = {
  activeJob: DashboardJob | null;
  activeJobId: string | null;
  isPolling: boolean;
  isSubmitting: boolean;
  pollingError: string | null;
  submitError: string | null;
};

function formatDisplayValue(value: unknown, fallback: string) {
  if (value === null || value === undefined) {
    return fallback;
  }

  if (typeof value === "string") {
    return value.trim() ? value : fallback;
  }

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function getJobStatusLabel(
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

  return "not started";
}

function buildOutputLines({
  activeJob,
  activeJobId,
  statusLabel,
  submitError,
  pollingError,
  isSubmitting,
  isPolling,
}: {
  activeJob: DashboardJob | null;
  activeJobId: string | null;
  statusLabel: string;
  submitError: string | null;
  pollingError: string | null;
  isSubmitting: boolean;
  isPolling: boolean;
}) {
  const lines = [
    "$ aws-runner status",
    `job_id: ${activeJobId ?? "none"}`,
    `status: ${statusLabel}`,
  ];

  if (submitError) {
    lines.push("", "submit_error:", submitError);
    return lines.join("\n");
  }

  if (pollingError) {
    lines.push("", "poll_error:", pollingError, "", "hint: check logs for the last known backend response.");
    return lines.join("\n");
  }

  if (statusLabel.toLowerCase() === "failed") {
    lines.push(
      "",
      "task failed",
      "check logs for more details.",
    );

    if (activeJob?.error !== undefined && activeJob.error !== null) {
      lines.push("", "error:", formatDisplayValue(activeJob.error, "No error reported."));
    }

    return lines.join("\n");
  }

  if (isSubmitting) {
    lines.push("", "submitting current Monaco editor contents to AWS...");
    return lines.join("\n");
  }

  if (isPolling) {
    lines.push("", "polling /jobs/{jobId} every 2 seconds...");
  }

  lines.push(
    "",
    "result:",
    formatDisplayValue(
      activeJob?.result,
      isPolling ? "Waiting for the backend to return a result..." : "No result returned.",
    ),
  );

  return lines.join("\n");
}

function buildLogsValue(activeJob: DashboardJob | null, pollingError: string | null) {
  if (activeJob && ("logs" in activeJob || "log" in activeJob)) {
    return formatDisplayValue(activeJob.logs ?? activeJob.log, "No logs returned.");
  }

  if (pollingError) {
    return `${pollingError}\n\nNo fresh logs were returned after the polling failure.`;
  }

  return "No logs returned by the backend for this job yet.";
}

function buildDetailsValue(activeJob: DashboardJob | null, latestError: string | null) {
  if (activeJob) {
    return formatDisplayValue(activeJob, "No job details returned.");
  }

  return latestError ?? "No execution details yet.";
}

export function DashboardOutputPanel({
  activeJob,
  activeJobId,
  isPolling,
  isSubmitting,
  pollingError,
  submitError,
}: DashboardOutputPanelProps) {
  const [activeOutputTab, setActiveOutputTab] = useState<OutputTab>(outputTabs[0]);
  const statusLabel = getJobStatusLabel(
    activeJob,
    isSubmitting,
    isPolling,
    submitError,
    pollingError,
  );
  const latestError = submitError ?? pollingError;
  const hasJob = Boolean(activeJobId || activeJob);
  const shouldShowEmptyState = !hasJob && !latestError && !isSubmitting;
  const outputValue = buildOutputLines({
    activeJob,
    activeJobId,
    statusLabel,
    submitError,
    pollingError,
    isSubmitting,
    isPolling,
  });
  const logsValue = buildLogsValue(activeJob, pollingError);
  const detailsValue = buildDetailsValue(activeJob, latestError);

  return (
    <Panel className="flex h-full min-h-0 flex-col overflow-hidden p-4 sm:p-5 xl:col-auto lg:col-span-2">
      <div className="shrink-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-400">
          Console
        </p>
        <h2 className="mt-1 text-3xl font-semibold tracking-tight text-white">
          Execution Output
        </h2>
      </div>

      <div className="mt-5 flex min-h-0 flex-1 flex-col overflow-hidden rounded-[18px] border border-[#1d2733] bg-[#05070b] shadow-[0_24px_50px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.03)]">
        <div className="flex shrink-0 items-center justify-between border-b border-white/8 bg-[linear-gradient(180deg,#0a0d12,#07090d)] px-4 py-3">
          <p className="font-mono text-xs text-slate-500">
            runner://aws/{activeJobId ?? "idle"}
          </p>
        </div>

        <div className="flex shrink-0 gap-2 border-b border-white/8 px-4 py-3">
          {outputTabs.map((tab) => (
            <button
              className={`font-mono text-xs uppercase tracking-[0.18em] transition ${
                tab === activeOutputTab
                  ? "text-emerald-300"
                  : "text-slate-500 hover:text-slate-300"
              }`}
              key={tab}
              onClick={() => setActiveOutputTab(tab)}
              type="button"
            >
              {tab}
            </button>
          ))}
        </div>

        {shouldShowEmptyState ? (
          <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden px-5 py-5">
            <EmptyState
              className="max-w-[260px]"
              description={emptyTabCopy[activeOutputTab].description}
              title={emptyTabCopy[activeOutputTab].title}
            />
          </div>
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.08),_transparent_34%)] px-4 py-4">
            <pre className="whitespace-pre-wrap break-words font-mono text-[13px] leading-6 text-emerald-200">
              {activeOutputTab === "Output" ? outputValue : null}
              {activeOutputTab === "Logs" ? logsValue : null}
              {activeOutputTab === "Details" ? detailsValue : null}
            </pre>
            {activeOutputTab === "Logs" && activeJob && !isTerminalJobStatus(activeJob.status) ? (
              <p className="mt-4 font-mono text-xs text-slate-500">
                polling every 2 seconds for the latest AWS job state...
              </p>
            ) : null}
          </div>
        )}
      </div>
    </Panel>
  );
}
