"use client";

import { useState } from "react";

import {
  DRAFT_TAB_ID,
  outputTabs,
  type JobSession,
  type OutputTab,
} from "@/components/cloud-job-runner/data";
import { EmptyState } from "@/components/cloud-job-runner/empty-state";
import { Panel } from "@/components/cloud-job-runner/panel";

const emptyTabCopy: Record<OutputTab, { title: string; description: string }> = {
  Output: {
    title: "Draft idle",
    description: "Select a job session or run the draft to stream execution output here.",
  },
  Logs: {
    title: "No session selected",
    description: "Job logs will appear here for the active session tab.",
  },
  Details: {
    title: "No session details",
    description: "Open a job session to inspect its latest backend payload.",
  },
};

type DashboardOutputPanelProps = {
  activeSession: JobSession | null;
  activeTabId: string;
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

function getStatusLabel(status: JobSession["status"]) {
  return status.replace("_", " ");
}

function buildOutputValue(activeSession: JobSession) {
  const lines = [
    "$ aws-runner status",
    `session_id: ${activeSession.id}`,
    `job_id: ${activeSession.jobId ?? "pending"}`,
    `status: ${getStatusLabel(activeSession.status)}`,
    `submitted_at: ${activeSession.submittedAt}`,
  ];

  if (activeSession.error !== null && activeSession.error !== undefined) {
    lines.push("", "error:", formatDisplayValue(activeSession.error, "No error returned."));
  }

  lines.push(
    "",
    "result:",
    formatDisplayValue(
      activeSession.result,
      activeSession.isPolling
        ? "Waiting for the backend to return a result..."
        : "No result returned.",
    ),
  );

  return lines.join("\n");
}

function buildLogsValue(activeSession: JobSession) {
  if (activeSession.logs.trim()) {
    return activeSession.logs;
  }

  return activeSession.isPolling
    ? "Waiting for backend logs..."
    : "No logs returned by the backend for this job yet.";
}

function buildDetailsValue(activeSession: JobSession) {
  if (activeSession.details) {
    return formatDisplayValue(activeSession.details, "No job details returned.");
  }

  return formatDisplayValue(
    {
      codeSnapshot: activeSession.codeSnapshot,
      error: activeSession.error,
      id: activeSession.id,
      jobId: activeSession.jobId,
      status: activeSession.status,
      submittedAt: activeSession.submittedAt,
    },
    "No execution details yet.",
  );
}

export function DashboardOutputPanel({
  activeSession,
  activeTabId,
}: DashboardOutputPanelProps) {
  const [activeOutputTab, setActiveOutputTab] = useState<OutputTab>(outputTabs[0]);
  const isDraftTabActive = activeTabId === DRAFT_TAB_ID;
  const shouldShowEmptyState = isDraftTabActive || !activeSession;
  const outputValue = activeSession ? buildOutputValue(activeSession) : "";
  const logsValue = activeSession ? buildLogsValue(activeSession) : "";
  const detailsValue = activeSession ? buildDetailsValue(activeSession) : "";

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
            runner://aws/{activeSession?.jobId ?? activeSession?.id ?? DRAFT_TAB_ID}
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
              className="max-w-[280px]"
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
            {activeOutputTab === "Logs" && activeSession?.isPolling ? (
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
