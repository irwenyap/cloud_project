export type DashboardFileKind = "python" | "text";

export type DashboardFile = {
  id: string;
  kind: DashboardFileKind;
  label: string;
  language: "python" | "plaintext";
  path: string;
  content: string;
};

export type RecentJob = {
  id: string;
  name: string;
  run: string;
  time: string;
  status: string;
  tone: string;
};

export const dashboardFiles: DashboardFile[] = [
  {
    id: "script-1",
    kind: "python",
    label: "main.py",
    language: "python",
    path: "workspace/main.py",
    content: "",
  },
];

export const jobTypeOptions = [
  { value: "cloud-function", label: "Cloud Function (Python)" },
  { value: "batch-job", label: "Batch Job (Container)" },
  { value: "workflow", label: "Workflow Orchestration" },
] as const;

export const recentJobs: RecentJob[] = [];

export const outputTabs = ["Output", "Logs", "Details"] as const;

export type OutputTab = (typeof outputTabs)[number];
