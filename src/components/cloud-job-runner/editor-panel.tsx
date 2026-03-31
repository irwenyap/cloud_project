"use client";

import { useState, useTransition } from "react";

import { dashboardFiles } from "@/components/cloud-job-runner/data";
import {
  CogIcon,
  PlusIcon,
  TextFileGlyph,
} from "@/components/cloud-job-runner/icons";
import { ControlIcon, Panel } from "@/components/cloud-job-runner/panel";
import { MonacoCodeEditor } from "@/components/monaco-code-editor";

export function DashboardEditorPanel() {
  const [activeFileId, setActiveFileId] = useState(dashboardFiles[0]?.id ?? "");
  const [isEditorPending, startEditorTransition] = useTransition();

  const activeFile =
    dashboardFiles.find((file) => file.id === activeFileId) ?? dashboardFiles[0];

  if (!activeFile) {
    return null;
  }

  return (
    <Panel className="flex min-h-155 flex-col p-4 sm:p-5">
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
            <CogIcon />
          </ControlIcon>
        </div>
      </div>

      <div className="mt-4 flex min-h-0 flex-1 flex-col overflow-hidden border border-white/8 bg-[#0b1118]">
        <div className="flex items-center border-b border-white/8 bg-[#0f1620] px-3">
          <div className="flex min-w-0 flex-1 items-end gap-1 overflow-x-auto py-2">
            {dashboardFiles.map((file) => {
              const isActive = file.id === activeFile.id;

              return (
                <button
                  key={file.id}
                  type="button"
                  onClick={() =>
                    startEditorTransition(() => {
                      setActiveFileId(file.id);
                    })
                  }
                  className={`group relative inline-flex h-11 items-center gap-2 border border-b-0 px-4 text-sm transition ${
                    isActive
                      ? "bg-[#0b1118] text-white border-white/10"
                      : "bg-[#101926] text-slate-400 border-transparent hover:bg-[#132031] hover:text-slate-200"
                  }`}
                >
                  <TextFileGlyph className={isActive ? "text-sky-300" : "text-slate-500"} />
                  <span className="truncate">{file.label}</span>

                  {isActive && (
                    <span className="absolute inset-x-0 bottom-0 h-px bg-[#0b1118]" />
                  )}
                </button>
              );
            })}

            <button
              type="button"
              className="ml-1 inline-flex h-11 w-11 items-center justify-center border border-transparent bg-[#101926] text-slate-400 transition hover:bg-[#132031] hover:text-white"
              aria-label="Add file"
              title="Add file"
            >
              <PlusIcon />
            </button>
          </div>

          <div className="ml-3 hidden items-center gap-2 text-sm text-slate-400 md:flex">
            <span
              className={`h-2 w-2 rounded-full ${
                isEditorPending ? "bg-amber-300" : "bg-emerald-400"
              }`}
            />
            <span>{activeFile.languageLabel ?? "Text Note"}</span>
          </div>
        </div>

        <div className="min-h-115 flex-1 bg-[#0b1118]">
          <MonacoCodeEditor
            language={activeFile.language}
            path={activeFile.path}
            value={activeFile.content}
          />
        </div>
      </div>
    </Panel>
  );
}