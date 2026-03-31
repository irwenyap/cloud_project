export type DashboardFile = {
  id: string;
  label: string;
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
    id: "notes",
    label: "notes.txt",
    path: "workspace/notes.txt",
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
