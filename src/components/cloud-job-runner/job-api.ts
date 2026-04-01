"use client";

const configuredJobApiBaseUrl =
  process.env.NEXT_PUBLIC_JOB_API_BASE_URL?.trim() ?? "";
const jobApiBaseUrl = configuredJobApiBaseUrl
  ? configuredJobApiBaseUrl.replace(/\/+$/, "")
  : "";

export type DashboardJob = Record<string, unknown> & {
  id?: string;
  jobId?: string;
  status?: string;
  result?: unknown;
  error?: unknown;
  log?: unknown;
  logs?: unknown;
};

type SubmitJobResponse = {
  success?: boolean;
  jobId?: string;
} & Record<string, unknown>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getMessageFromValue(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) {
    return value;
  }

  if (!isRecord(value)) {
    return null;
  }

  const messageCandidates = [value.error, value.message, value.detail];

  for (const candidate of messageCandidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate;
    }
  }

  return null;
}

async function parseJsonResponse(response: Response) {
  const rawText = await response.text();

  if (!rawText) {
    return null;
  }

  try {
    return JSON.parse(rawText) as unknown;
  } catch {
    throw new Error("Backend returned invalid JSON.");
  }
}

function getApiUrl(pathname: string) {
  return jobApiBaseUrl ? `${jobApiBaseUrl}${pathname}` : pathname;
}

function getResponseErrorMessage(
  response: Response,
  payload: unknown,
  fallbackMessage: string,
) {
  const backendMessage = getMessageFromValue(payload);

  if (backendMessage) {
    return backendMessage;
  }

  return `${fallbackMessage} (${response.status} ${response.statusText})`;
}

function resolveJobId(job: DashboardJob, fallbackJobId: string) {
  if (typeof job.jobId === "string" && job.jobId.trim()) {
    return job.jobId;
  }

  if (typeof job.id === "string" && job.id.trim()) {
    return job.id;
  }

  return fallbackJobId;
}

export function getErrorMessage(error: unknown, fallbackMessage: string) {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallbackMessage;
}

export function normalizeJob(payload: unknown, fallbackJobId: string): DashboardJob {
  if (isRecord(payload)) {
    const normalizedJob = payload as DashboardJob;

    return {
      ...normalizedJob,
      jobId: resolveJobId(normalizedJob, fallbackJobId),
    };
  }

  return {
    jobId: fallbackJobId,
    status: "unknown",
    result: payload,
  };
}

export function isTerminalJobStatus(status: unknown) {
  if (typeof status !== "string") {
    return false;
  }

  return status.toLowerCase() === "completed" || status.toLowerCase() === "failed";
}

export async function submitPythonJob(payload: string, signal: AbortSignal) {
  const response = await fetch(getApiUrl("/submit-job"), {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jobType: "python",
      payload,
    }),
    cache: "no-store",
    signal,
  });

  const responsePayload = (await parseJsonResponse(response)) as SubmitJobResponse | null;

  if (!response.ok) {
    throw new Error(
      getResponseErrorMessage(response, responsePayload, "Unable to submit the job."),
    );
  }

  const jobId =
    typeof responsePayload?.jobId === "string" ? responsePayload.jobId.trim() : "";

  if (responsePayload?.success !== true || !jobId) {
    throw new Error("Backend did not return a valid jobId.");
  }

  return { jobId };
}

export async function fetchJob(jobId: string, signal: AbortSignal) {
  const response = await fetch(getApiUrl(`/jobs/${encodeURIComponent(jobId)}`), {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
    signal,
  });

  const responsePayload = await parseJsonResponse(response);

  if (!response.ok) {
    throw new Error(
      getResponseErrorMessage(
        response,
        responsePayload,
        "Unable to load the latest job state.",
      ),
    );
  }

  return normalizeJob(responsePayload, jobId);
}
