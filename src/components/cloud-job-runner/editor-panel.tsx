"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import {
  DRAFT_TAB_ID,
  dashboardFiles,
  type DashboardFile,
  type DashboardFileKind,
  type JobSession,
} from "@/components/cloud-job-runner/data";
import { CloseIcon, CogIcon, FileGlyph, PlusIcon } from "@/components/cloud-job-runner/icons";
import { ControlIcon, Panel } from "@/components/cloud-job-runner/panel";
import { MonacoCodeEditor } from "@/components/monaco-code-editor";

const fileTypeOptions: Array<{ kind: DashboardFileKind; label: string }> = [
  { kind: "python", label: "Python file (.py)" },
  { kind: "text", label: "Text file (.txt)" },
];

const CREATE_MENU_WIDTH = 176;

type MenuPosition = {
  left: number;
  top: number;
};

type DashboardEditorPanelProps = {
  activeSession: JobSession | null;
  activeTabId: string;
  isSubmitting: boolean;
  onCloseTab: (tabId: string) => void;
  onRun: (editorText: string) => void | Promise<void>;
  onSetActiveTab: (tabId: string) => void;
  openSessionTabs: JobSession[];
};

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

  return "border-sky-400/25 bg-sky-500/10 text-sky-200";
}

function getSessionTabLabel(session: JobSession) {
  if (session.jobId) {
    return session.jobId.slice(0, 8);
  }

  return session.status === "failed" ? "failed" : "pending";
}

function formatSubmittedAt(submittedAt: string) {
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

export function DashboardEditorPanel({
  activeSession,
  activeTabId,
  isSubmitting,
  onCloseTab,
  onRun,
  onSetActiveTab,
  openSessionTabs,
}: DashboardEditorPanelProps) {
  const [files, setFiles] = useState(dashboardFiles);
  const [activeFileId, setActiveFileId] = useState(dashboardFiles[0]?.id ?? "");
  const [nextFileNumber, setNextFileNumber] = useState(dashboardFiles.length + 1);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState<MenuPosition>({ left: 0, top: 0 });
  const plusButtonRef = useRef<HTMLButtonElement | null>(null);
  const menuSurfaceRef = useRef<HTMLDivElement | null>(null);

  const activeFile = files.find((file) => file.id === activeFileId) ?? files[0];
  const isDraftTabActive = activeTabId === DRAFT_TAB_ID;
  const isCreateMenuOpen = showCreateMenu && isDraftTabActive;

  const updateMenuPosition = () => {
    const button = plusButtonRef.current;

    if (!button) {
      return;
    }

    const rect = button.getBoundingClientRect();
    const left = Math.min(
      Math.max(16, rect.right - CREATE_MENU_WIDTH),
      window.innerWidth - CREATE_MENU_WIDTH - 16,
    );

    setMenuPosition({
      left,
      top: rect.bottom + 8,
    });
  };

  useEffect(() => {
    if (!isCreateMenuOpen) {
      return;
    }

    updateMenuPosition();

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        plusButtonRef.current?.contains(target) ||
        menuSurfaceRef.current?.contains(target)
      ) {
        return;
      }

      setShowCreateMenu(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowCreateMenu(false);
      }
    };

    const handleViewportChange = () => {
      updateMenuPosition();
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
    };
  }, [isCreateMenuOpen]);

  if (!activeFile) {
    return null;
  }

  const createFile = (kind: DashboardFileKind, fileNumber: number): DashboardFile => {
    const label =
      kind === "python"
        ? fileNumber === 1
          ? "main.py"
          : `script-${fileNumber}.py`
        : fileNumber === 1
          ? "notes.txt"
          : `notes-${fileNumber}.txt`;

    return {
      id: `${kind}-${fileNumber}`,
      kind,
      label,
      language: kind === "python" ? "python" : "plaintext",
      path: `workspace/${label}`,
      content: "",
    };
  };

  const handleAddFile = (kind: DashboardFileKind) => {
    const newFile = createFile(kind, nextFileNumber);

    setFiles((currentFiles) => [...currentFiles, newFile]);
    setActiveFileId(newFile.id);
    setNextFileNumber((currentNumber) => currentNumber + 1);
    setShowCreateMenu(false);
  };

  const handleChange = (nextValue: string) => {
    setFiles((currentFiles) =>
      currentFiles.map((file) =>
        file.id === activeFile.id ? { ...file, content: nextValue } : file,
      ),
    );
  };

  const handleCloseFile = (fileId: string) => {
    const fileIndex = files.findIndex((file) => file.id === fileId);

    if (fileIndex === -1) {
      return;
    }

    if (files.length === 1) {
      const replacementFile = createFile("python", nextFileNumber);
      setFiles([replacementFile]);
      setActiveFileId(replacementFile.id);
      setNextFileNumber((currentNumber) => currentNumber + 1);
      return;
    }

    const remainingFiles = files.filter((file) => file.id !== fileId);
    setFiles(remainingFiles);

    if (activeFileId === fileId) {
      const nextActiveFile =
        remainingFiles[Math.max(0, fileIndex - 1)] ?? remainingFiles[0];
      setActiveFileId(nextActiveFile.id);
    }
  };

  return (
    <Panel className="flex h-full min-h-0 flex-col overflow-hidden border-x p-4 sm:p-5" variant="sunken">
      <div className="shrink-0 border-b border-white/8 pb-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            className={`inline-flex h-9 shrink-0 items-center rounded-[14px] border px-4 text-sm font-medium transition ${
              isDraftTabActive
                ? "border-sky-400/45 bg-sky-500/10 text-white"
                : "border-white/8 bg-white/[0.03] text-slate-400 hover:border-white/14 hover:text-white"
            }`}
            onClick={() => {
              setShowCreateMenu(false);
              onSetActiveTab(DRAFT_TAB_ID);
            }}
            type="button"
          >
            Draft
          </button>

          {openSessionTabs.map((session) => {
            const isActive = activeTabId === session.id;

            return (
              <div
                className={`inline-flex h-9 shrink-0 items-center gap-2 rounded-[14px] border px-3 text-sm transition ${
                  isActive
                    ? "border-sky-400/45 bg-sky-500/10 text-white"
                    : "border-white/8 bg-white/[0.03] text-slate-400"
                }`}
                key={session.id}
              >
                <button
                  className="inline-flex min-w-0 items-center gap-2"
                  onClick={() => {
                    setShowCreateMenu(false);
                    onSetActiveTab(session.id);
                  }}
                  type="button"
                >
                  <span className="max-w-24 truncate font-medium">
                    {getSessionTabLabel(session)}
                  </span>
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] ${getStatusTone(session.status)}`}>
                    {getStatusLabel(session.status)}
                  </span>
                </button>
                <button
                  aria-label={`Close ${getSessionTabLabel(session)} tab`}
                  className="inline-flex h-5 w-5 items-center justify-center rounded-full text-slate-400 transition hover:bg-white/8 hover:text-white"
                  onClick={() => onCloseTab(session.id)}
                  type="button"
                >
                  <CloseIcon />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {isDraftTabActive ? (
        <>
          <div className="mt-4 flex shrink-0 flex-col gap-4 border-b border-white/8 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-400">
                Personal
              </p>
              <h2 className="mt-1 text-3xl font-semibold tracking-tight text-white">
                Workspace
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => void onRun(activeFile.content)}
                disabled={isSubmitting}
                className="rounded-[14px] border border-sky-300/20 bg-[linear-gradient(180deg,#2f91ff,#1768d6)] px-5 py-3 text-sm font-semibold text-white shadow-[0_20px_30px_rgba(22,104,214,0.35)] transition hover:brightness-105 disabled:cursor-wait disabled:opacity-75"
              >
                {isSubmitting ? "Submitting..." : "Run Job"}
              </button>
              <ControlIcon>
                <CogIcon />
              </ControlIcon>
            </div>
          </div>

          <div className="relative mt-4 flex min-h-0 flex-1 flex-col overflow-hidden pt-8">
            <div className="absolute inset-x-0 top-0 z-10 flex items-end pb-4">
              <div className="min-w-0 flex max-w-full items-end overflow-x-auto">
                {files.map((file, index) => {
                  const isActive = file.id === activeFile.id;
                  const isFirst = index === 0;
                  const edgeRounding = isFirst
                    ? "rounded-tl-[14px] rounded-tr-none"
                    : "rounded-t-none";

                  return (
                    <div
                      key={file.id}
                      className={`inline-flex h-8 shrink-0 items-center gap-1 border border-b-0 px-2 pl-4 text-sm transition ${edgeRounding} ${
                        isActive
                          ? "border-white/14 bg-[#16202b] text-white"
                          : "border-white/6 bg-[#0f1620] text-slate-400 hover:bg-[#131d29] hover:text-slate-200"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setActiveFileId(file.id)}
                        className="inline-flex min-w-0 items-center gap-2"
                      >
                        <FileGlyph
                          kind={file.kind}
                          className={isActive ? "text-sky-300" : "text-slate-500"}
                        />
                        <span className="max-w-30 truncate">{file.label}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCloseFile(file.id)}
                        className={`inline-flex h-5 w-5 items-center justify-center rounded-full transition ${
                          isActive
                            ? "text-slate-300 hover:bg-white/8 hover:text-white"
                            : "text-slate-500 hover:bg-white/6 hover:text-slate-200"
                        }`}
                        aria-label={`Close ${file.label}`}
                      >
                        <CloseIcon />
                      </button>
                    </div>
                  );
                })}

                <button
                  ref={plusButtonRef}
                  type="button"
                  onClick={() => setShowCreateMenu((currentValue) => !currentValue)}
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-tl-none rounded-tr-[14px] border border-b-0 border-white/8 bg-[#0b1118] text-slate-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition hover:border-white/12 hover:bg-[#101823] hover:text-white"
                  aria-expanded={isCreateMenuOpen}
                  aria-label="Create a new file"
                  title="Create a new file"
                >
                  <PlusIcon />
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-hidden">
              <MonacoCodeEditor
                language={activeFile.language}
                path={activeFile.path}
                value={activeFile.content}
                onChange={handleChange}
              />
            </div>
          </div>
        </>
      ) : activeSession ? (
        <>
          <div className="mt-4 flex shrink-0 flex-col gap-4 border-b border-white/8 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-400">
                Session Snapshot
              </p>
              <h2 className="mt-1 text-3xl font-semibold tracking-tight text-white">
                {activeSession.jobId ? `Job ${activeSession.jobId.slice(0, 8)}` : "Pending Session"}
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
              <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${getStatusTone(activeSession.status)}`}>
                {getStatusLabel(activeSession.status)}
              </span>
              <span className="rounded-[12px] border border-white/10 bg-white/[0.03] px-3 py-2">
                {activeSession.jobId ?? "Awaiting job ID"}
              </span>
              <span className="rounded-[12px] border border-white/10 bg-white/[0.03] px-3 py-2">
                {formatSubmittedAt(activeSession.submittedAt)}
              </span>
            </div>
          </div>

          <div className="mt-4 min-h-0 flex-1 overflow-hidden">
            <MonacoCodeEditor
              language="python"
              path={`jobs/${activeSession.jobId ?? activeSession.id}/snapshot.py`}
              readOnly
              value={activeSession.codeSnapshot}
            />
          </div>
        </>
      ) : null}

      {isCreateMenuOpen
        ? createPortal(
            <div
              ref={menuSurfaceRef}
              className="fixed z-50 w-44 rounded-[14px] border border-white/10 bg-[#0d141d] p-2 shadow-[0_18px_45px_rgba(0,0,0,0.38)] backdrop-blur-xl"
              style={{ left: `${menuPosition.left}px`, top: `${menuPosition.top}px` }}
            >
              {fileTypeOptions.map((option) => (
                <button
                  key={option.kind}
                  type="button"
                  onClick={() => handleAddFile(option.kind)}
                  className="flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-left text-sm text-slate-300 transition hover:bg-white/[0.06] hover:text-white"
                >
                  <FileGlyph kind={option.kind} />
                  <span>{option.label}</span>
                </button>
              ))}
            </div>,
            document.body,
          )
        : null}
    </Panel>
  );
}
