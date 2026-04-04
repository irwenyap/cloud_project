import { type DashboardJob } from "@/components/cloud-job-runner/job-api";

export type DashboardFileKind = "python" | "text";

export type DashboardFile = {
  id: string;
  kind: DashboardFileKind;
  label: string;
  language: "python" | "plaintext";
  path: string;
  content: string;
};

export const DRAFT_TAB_ID = "draft";

export type JobSessionStatus =
  | "pending"
  | "submitted"
  | "running"
  | "completed"
  | "failed"
  | "poll_failed";

export type JobSession = {
  id: string;
  jobId: string | null;
  codeSnapshot: string;
  submittedAt: string;
  status: JobSessionStatus;
  logs: string;
  result: unknown;
  error: unknown;
  details: DashboardJob | null;
  isPolling: boolean;
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

export const outputTabs = ["Output", "Logs", "Details"] as const;

export type OutputTab = (typeof outputTabs)[number];
