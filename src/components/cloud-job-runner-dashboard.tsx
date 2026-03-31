"use client";

import { useState, useTransition } from "react";

import { MonacoCodeEditor } from "@/components/monaco-code-editor";

const files = [
  {
    id: "notes",
    label: "notes.txt",
    accent: "note",
    language: "plaintext",
    path: "workspace/notes.txt",
    content: ``,
  },
] as const;

const recentJobs = [

] as const;

const outputTabs = ["Output", "Logs", "Details"] as const;

const panelClassName =
  "rounded-[20px] border border-white/8 bg-white/[0.045] shadow-[0_30px_80px_rgba(0,0,0,0.4)] backdrop-blur-xl";

type PanelProps = {
  children: React.ReactNode;
  className?: string;
};

function Panel({ children, className = "" }: PanelProps) {
  return <section className={`${panelClassName} ${className}`}>{children}</section>;
}

function ControlIcon({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex h-9 w-9 items-center justify-center rounded-[12px] border border-white/10 bg-white/5 text-slate-300">
      {children}
    </span>
  );
}

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function CloudIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-7 w-7"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <path d="M7 18a4 4 0 1 1 .4-8A5.5 5.5 0 0 1 18 8.7 3.8 3.8 0 1 1 18.5 18H7Z" />
    </svg>
  );
}

function FileGlyph() {
  return (
    <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-[#17324d] text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-200">
      txt
    </span>
  );
}

export function CloudJobRunnerDashboard() {
  const [activeFileId, setActiveFileId] = useState<(typeof files)[number]["id"]>(
    files[0].id,
  );
  const [activeOutputTab, setActiveOutputTab] = useState<(typeof outputTabs)[number]>(
    outputTabs[0],
  );
  const [isEditorPending, startEditorTransition] = useTransition();

  const activeFile = files.find((file) => file.id === activeFileId) ?? files[0];

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#090c12] text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(70,111,197,0.28),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(35,164,117,0.16),_transparent_22%),linear-gradient(180deg,_rgba(255,255,255,0.03),_transparent_32%)]" />
      <div className="pointer-events-none absolute inset-y-0 left-0 w-full bg-[linear-gradient(90deg,_transparent_0%,_rgba(255,255,255,0.03)_48%,_transparent_100%)] opacity-30" />

      <div className="relative flex min-h-screen flex-col p-4 sm:p-5 lg:p-6">
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
            <div className="inline-flex items-center gap-2 self-start rounded-full border border-emerald-400/20 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-300">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(74,222,128,0.9)]" />
              System Online
            </div>

            <label className="flex min-w-[220px] items-center gap-3 rounded-[14px] border border-white/8 bg-[#111722]/90 px-4 py-3 text-slate-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              <SearchIcon />
              <input
                aria-label="Search jobs"
                className="w-full bg-transparent text-sm text-slate-200 outline-none placeholder:text-slate-500"
                defaultValue=""
                placeholder="Search"
              />
            </label>

            <button className="flex items-center gap-3 self-start rounded-[14px] border border-white/8 bg-[#111722]/90 px-3 py-2 pr-4 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition hover:border-white/15 hover:bg-white/[0.08]">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[linear-gradient(135deg,#e9d5c2,#9fb3d7)] text-sm font-semibold text-slate-900">
                AR
              </span>
              <span>
                <span className="block text-sm font-semibold text-white">Alex R.</span>
                <span className="block text-xs text-slate-400">Workspace Owner</span>
              </span>
            </button>
          </div>
        </header>

        <div className="mt-4 grid flex-1 min-h-0 gap-4 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)_360px]">
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
                    defaultValue="cloud-function"
                  >
                    <option value="cloud-function">Cloud Function (Python)</option>
                    <option value="batch-job">Batch Job (Container)</option>
                    <option value="workflow">Workflow Orchestration</option>
                  </select>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold tracking-tight text-white">
                    Recent Jobs
                  </h2>
                  <span className="text-xs text-slate-500">3 active</span>
                </div>

                <div className="mt-4 space-y-3">
                  {recentJobs.map((job, index) => (
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
                  ))}
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
                <div>
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[14px] bg-white/[0.05] text-slate-400">
                    <svg
                      aria-hidden="true"
                      className="h-7 w-7"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.6"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 16V5" />
                      <path d="m7 10 5-5 5 5" />
                      <path d="M5 19h14" />
                    </svg>
                  </div>
                  <p className="mt-4 text-base font-medium text-slate-200">
                    No documents uploaded
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Upload files to attach data and config inputs.
                  </p>
                </div>
              </div>
            </Panel>
          </div>

          <Panel className="flex min-h-[620px] flex-col p-4 sm:p-5">
            <div className="flex flex-col gap-4 border-b border-white/8 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-400">
                  Workspace
                </p>
                <h2 className="mt-1 text-3xl font-semibold tracking-tight text-white">
                  Code Editor
                </h2>
              </div>

              <div className="flex items-center gap-3">
                <button className="rounded-[14px] border border-sky-300/20 bg-[linear-gradient(180deg,#2f91ff,#1768d6)] px-5 py-3 text-sm font-semibold text-white shadow-[0_20px_30px_rgba(22,104,214,0.35)] transition hover:brightness-105">
                  Run Job
                </button>
                <ControlIcon>
                  <svg
                    aria-hidden="true"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.7"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.2a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.2a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3h.1a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.2a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8v.1a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.2a1.6 1.6 0 0 0-1.4 1Z" />
                  </svg>
                </ControlIcon>
              </div>
            </div>

            <div className="mt-4 flex min-h-0 flex-1 flex-col overflow-hidden rounded-[16px] border border-white/8 bg-[#0e141d]/85">
              <div className="flex flex-wrap items-center gap-2 border-b border-white/8 px-3 py-3">
                {files.map((file) => (
                  <button
                    className={`inline-flex items-center gap-3 rounded-[12px] border px-4 py-2 text-sm transition ${
                      file.id === activeFile.id
                        ? "border-sky-400/30 bg-white/[0.06] text-white"
                        : "border-transparent bg-transparent text-slate-400 hover:border-white/10 hover:bg-white/[0.04] hover:text-slate-200"
                    }`}
                    key={file.id}
                    onClick={() =>
                      startEditorTransition(() => {
                        setActiveFileId(file.id);
                      })
                    }
                    type="button"
                  >
                    <FileGlyph />
                    <span>{file.label}</span>
                  </button>
                ))}

                <div className="ml-auto flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.04] px-3 py-1.5 text-sm text-slate-400">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      isEditorPending ? "bg-amber-300" : "bg-emerald-400"
                    }`}
                  />
                  Text Note
                </div>
              </div>

              <div className="min-h-[460px] flex-1">
                <MonacoCodeEditor
                  language={activeFile.language}
                  path={activeFile.path}
                  value={activeFile.content}
                />
              </div>
            </div>
          </Panel>

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
              {activeOutputTab === "Output" ? (
                <div className="flex flex-1 items-center justify-center px-5 py-5 text-center">
                  <div>
                    <p className="font-medium text-slate-200">No output yet</p>
                    <p className="mt-1 text-sm text-slate-500">
                      Run a job to stream execution events here.
                    </p>
                  </div>
                </div>
              ) : null}

              {activeOutputTab === "Logs" ? (
                <div className="flex flex-1 items-center justify-center px-5 py-5 text-center">
                  <div>
                    <p className="font-medium text-slate-200">No logs available</p>
                    <p className="mt-1 text-sm text-slate-500">
                      Logs will appear after a job starts running.
                    </p>
                  </div>
                </div>
              ) : null}

              {activeOutputTab === "Details" ? (
                <div className="flex flex-1 items-center justify-center px-5 py-5 text-center">
                  <div>
                    <p className="font-medium text-slate-200">No run selected</p>
                    <p className="mt-1 text-sm text-slate-500">
                      Execution details will show up for the active job.
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          </Panel>
        </div>
      </div>
    </main>
  );
}
