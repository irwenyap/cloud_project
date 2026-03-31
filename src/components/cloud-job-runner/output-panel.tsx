"use client";

import { useState } from "react";

import {
  outputTabs,
  type OutputTab,
} from "@/components/cloud-job-runner/data";
import { EmptyState } from "@/components/cloud-job-runner/empty-state";
import { Panel } from "@/components/cloud-job-runner/panel";

const emptyTabCopy: Record<OutputTab, { title: string; description: string }> = {
  Output: {
    title: "No output yet",
    description: "Run a job to stream execution events here.",
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

export function DashboardOutputPanel() {
  const [activeOutputTab, setActiveOutputTab] = useState<OutputTab>(outputTabs[0]);

  return (
    <Panel className="flex min-h-[620px] flex-col p-4 sm:p-5 xl:col-auto lg:col-span-2">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-400">
          Telemetry
        </p>
        <h2 className="mt-1 text-3xl font-semibold tracking-tight text-white">
          Execution Output
        </h2>
      </div>

      <div className="mt-4 rounded-[14px] border border-white/8 bg-[#111722]/85 px-4 py-4 text-sm text-slate-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
        <span className="text-slate-500">Job:</span> None
        <span className="mx-2 text-slate-600">|</span>
        <span className="text-slate-500">Type:</span> Not started
      </div>

      <div className="mt-5 flex gap-2 border-b border-white/8 pb-3">
        {outputTabs.map((tab) => (
          <button
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              tab === activeOutputTab
                ? "bg-sky-500/12 text-sky-300 shadow-[inset_0_-2px_0_rgba(56,189,248,0.75)]"
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

      <div className="mt-4 flex min-h-0 flex-1 flex-col overflow-hidden rounded-[16px] border border-white/8 bg-[#070b11] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
        <div className="flex flex-1 items-center justify-center px-5 py-5">
          <EmptyState
            className="max-w-[240px]"
            description={emptyTabCopy[activeOutputTab].description}
            title={emptyTabCopy[activeOutputTab].title}
          />
        </div>
      </div>
    </Panel>
  );
}
