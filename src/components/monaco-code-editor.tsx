"use client";

import dynamic from "next/dynamic";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-0 items-center justify-center rounded-b-2xl border border-white/8 bg-[#0f141b] text-sm text-slate-400">
      Loading editor...
    </div>
  ),
});

type MonacoModule = typeof import("monaco-editor");

type MonacoCodeEditorProps = {
  language: "python" | "plaintext";
  onChange?: (value: string) => void;
  path: string;
  readOnly?: boolean;
  value: string;
};

export function MonacoCodeEditor({
  language,
  onChange,
  path,
  readOnly = false,
  value,
}: MonacoCodeEditorProps) {
  const handleBeforeMount = (monaco: MonacoModule) => {
    monaco.editor.defineTheme("job-runner-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "6A9955", fontStyle: "italic" },
        { token: "keyword", foreground: "5DA8FF" },
        { token: "string", foreground: "D7BA7D" },
        { token: "number", foreground: "B5CEA8" },
        { token: "delimiter", foreground: "AAB4C3" },
        { token: "identifier", foreground: "DCE6F2" },
      ],
      colors: {
        "editor.background": "#0F141B",
        "editor.foreground": "#DCE6F2",
        "editorLineNumber.foreground": "#586274",
        "editorLineNumber.activeForeground": "#C8D2DF",
        "editorCursor.foreground": "#66B7FF",
        "editor.lineHighlightBackground": "#151C25",
        "editor.lineHighlightBorder": "#00000000",
        "editor.selectionBackground": "#21395A",
        "editor.inactiveSelectionBackground": "#182B42",
        "editorIndentGuide.background1": "#1B2430",
        "editorIndentGuide.activeBackground1": "#2E3A4A",
        "editorWhitespace.foreground": "#2D3746",
        "editorBracketMatch.background": "#223047",
        "editorBracketMatch.border": "#3B82F600",
        "editorGutter.background": "#0F141B",
        "editorOverviewRuler.border": "#00000000",
        "scrollbar.shadow": "#00000000",
        "scrollbarSlider.background": "#33415588",
        "scrollbarSlider.hoverBackground": "#475569AA",
        "scrollbarSlider.activeBackground": "#64748BBB",
      },
    });
  };

  return (
    <div className="h-full min-h-0 overflow-hidden rounded-b-2xl border border-white/8 bg-[#0f141b] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
      <MonacoEditor
        beforeMount={handleBeforeMount}
        defaultLanguage={language}
        keepCurrentModel
        language={language}
        options={{
          automaticLayout: true,
          contextmenu: true,
          cursorBlinking: "smooth",
          cursorSmoothCaretAnimation: "on",
          domReadOnly: readOnly,
          folding: false,
          fontFamily: "var(--font-code), 'JetBrains Mono', 'Fira Code', monospace",
          fontLigatures: true,
          fontSize: 17,
          glyphMargin: false,
          guides: {
            highlightActiveIndentation: true,
            indentation: true,
          },
          hideCursorInOverviewRuler: true,
          lineDecorationsWidth: 12,
          lineHeight: 30,
          lineNumbers: "on",
          lineNumbersMinChars: 3,
          matchBrackets: "always",
          minimap: { enabled: false },
          overviewRulerBorder: false,
          overviewRulerLanes: 0,
          padding: { top: 26, bottom: 20 },
          readOnly,
          renderLineHighlight: "line",
          renderWhitespace: "selection",
          roundedSelection: false,
          scrollBeyondLastLine: false,
          scrollbar: {
            alwaysConsumeMouseWheel: false,
            horizontalScrollbarSize: 8,
            verticalScrollbarSize: 8,
          },
          smoothScrolling: true,
          wordWrap: "on",
        }}
        onChange={(nextValue) => onChange?.(nextValue ?? "")}
        path={path}
        theme="job-runner-dark"
        value={value}
      />
    </div>
  );
}
