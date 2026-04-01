"use client";

import { DashboardEditorPanel } from "@/components/cloud-job-runner/editor-panel";
import { DashboardOutputPanel } from "@/components/cloud-job-runner/output-panel";
import { DashboardSidebar } from "@/components/cloud-job-runner/sidebar";
import { DashboardTopBar } from "@/components/cloud-job-runner/top-bar";
import { useJobExecution } from "@/components/cloud-job-runner/use-job-execution";

export function CloudJobRunnerDashboard() {
  const {
    activeJob,
    activeJobId,
    isPolling,
    isSubmitting,
    pollingError,
    runJob,
    submitError,
  } = useJobExecution();

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#090c12] text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(70,111,197,0.28),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(35,164,117,0.16),_transparent_22%),linear-gradient(180deg,_rgba(255,255,255,0.03),_transparent_32%)]" />
      <div className="pointer-events-none absolute inset-y-0 left-0 w-full bg-[linear-gradient(90deg,_transparent_0%,_rgba(255,255,255,0.03)_48%,_transparent_100%)] opacity-30" />

      <div className="relative flex min-h-screen flex-col p-4 sm:p-5 lg:p-6">
        <DashboardTopBar />

        <div className="mt-4 grid min-h-0 flex-1 gap-4 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)_360px]">
          <DashboardSidebar
            activeJob={activeJob}
            activeJobId={activeJobId}
            isPolling={isPolling}
            isSubmitting={isSubmitting}
            pollingError={pollingError}
            submitError={submitError}
          />
          <DashboardEditorPanel
            activeJobId={activeJobId}
            isPolling={isPolling}
            isSubmitting={isSubmitting}
            onRun={runJob}
          />
          <DashboardOutputPanel
            activeJob={activeJob}
            activeJobId={activeJobId}
            isPolling={isPolling}
            isSubmitting={isSubmitting}
            pollingError={pollingError}
            submitError={submitError}
          />
        </div>
      </div>
    </main>
  );
}
