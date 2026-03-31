"use client";

import dynamic from "next/dynamic";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-115 items-center justify-center rounded-b-2xl border border-white/8 bg-[#0f141b] text-sm text-slate-400">
      Loading editor...
    </div>
  ),
});

type MonacoModule = typeof import("monaco-editor");

type MonacoCodeEditorProps = {
  path: string;
  value: string;
  onChange?: (value: string) => void;
};

export function MonacoCodeEditor({ path, value, onChange }: MonacoCodeEditorProps) {
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
    <div className="h-full overflow-hidden rounded-b-2xl border border-white/8 bg-[#0f141b] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
      <MonacoEditor
        beforeMount={handleBeforeMount}
        defaultLanguage="plaintext"
        keepCurrentModel
        language="plaintext"
        options={{
          automaticLayout: true,
          fontFamily: "var(--font-code), 'JetBrains Mono', 'Fira Code', monospace",
          fontLigatures: true,
          fontSize: 17,
          lineHeight: 30,
          minimap: { enabled: false },
          glyphMargin: false,
          folding: false,
          lineNumbers: "on",
          lineNumbersMinChars: 3,
          lineDecorationsWidth: 12,
          roundedSelection: false,
          renderLineHighlight: "line",
          renderWhitespace: "selection",
          wordWrap: "on",
          scrollBeyondLastLine: false,
          smoothScrolling: true,
          cursorBlinking: "smooth",
          cursorSmoothCaretAnimation: "on",
          padding: { top: 26, bottom: 20 },
          overviewRulerBorder: false,
          overviewRulerLanes: 0,
          hideCursorInOverviewRuler: true,
          scrollbar: {
            verticalScrollbarSize: 8,
            horizontalScrollbarSize: 8,
            alwaysConsumeMouseWheel: false,
          },
          contextmenu: true,
          matchBrackets: "always",
          guides: {
            indentation: true,
            highlightActiveIndentation: true,
          },
        }}
        onChange={(nextValue) => onChange?.(nextValue ?? "")}
        path={path}
        theme="job-runner-dark"
        value={value}
      />
    </div>
  );
}
