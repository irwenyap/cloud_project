"use client";

import { useState } from "react";

import { dashboardFiles } from "@/components/cloud-job-runner/data";
import {
  CloseIcon,
  CogIcon,
  PlusIcon,
  TextFileGlyph,
} from "@/components/cloud-job-runner/icons";
import { ControlIcon, Panel } from "@/components/cloud-job-runner/panel";
import { MonacoCodeEditor } from "@/components/monaco-code-editor";

export function DashboardEditorPanel() {
  const [files, setFiles] = useState(dashboardFiles);
  const [activeFileId, setActiveFileId] = useState(dashboardFiles[0]?.id ?? "");
  const [nextFileNumber, setNextFileNumber] = useState(dashboardFiles.length + 1);

  const activeFile = files.find((file) => file.id === activeFileId) ?? files[0];

  if (!activeFile) {
    return null;
  }

  const createFile = (fileNumber: number) => {
    const label = fileNumber === 1 ? "notes.txt" : `notes-${fileNumber}.txt`;

    return {
      id: `note-${fileNumber}`,
      label,
      path: `workspace/${label}`,
      content: "",
    };
  };

  const handleAddFile = () => {
    const newFile = createFile(nextFileNumber);

    setFiles((currentFiles) => [...currentFiles, newFile]);
    setActiveFileId(newFile.id);
    setNextFileNumber((currentNumber) => currentNumber + 1);
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
      const replacementFile = createFile(nextFileNumber);
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

      <div className="relative mt-4 flex min-h-0 flex-1 flex-col overflow-visible pt-8">
        <div className="absolute top-0 z-10 flex items-end overflow-x-auto pb-4">
          {files.map((file, index) => {
            const isActive = file.id === activeFile.id;
            const isFirst = index === 0;
            const edgeRounding = isFirst
              ? "rounded-tl-[14px] rounded-tr-none"
              : "rounded-t-none";

            return (
              <div
                key={file.id}
                className={`inline-flex h-8 items-center gap-1 border border-b-0 px-2 pl-4 text-sm transition ${edgeRounding} ${
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
                  <TextFileGlyph className={isActive ? "text-sky-300" : "text-slate-500"} />
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
            type="button"
            onClick={handleAddFile}
            className="inline-flex h-8 w-8 items-center justify-center rounded-tl-none rounded-tr-[14px] border border-b-0 border-white/8 bg-[#0b1118] text-slate-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition hover:border-white/12 hover:bg-[#101823] hover:text-white"
            aria-label="Create a new note"
            title="Create a new note"
          >
            <PlusIcon />
          </button>
        </div>

        <div className="min-h-115 flex-1">
          <MonacoCodeEditor
            path={activeFile.path}
            value={activeFile.content}
            onChange={handleChange}
          />
        </div>
      </div>
    </Panel>
  );
}
