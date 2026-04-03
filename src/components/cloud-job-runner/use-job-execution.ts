"use client";

import { useEffect, useRef, useState } from "react";

import { type RecentJob } from "@/components/cloud-job-runner/data";
import {
  fetchJob,
  getErrorMessage,
  isTerminalJobStatus,
  submitPythonJob,
  type DashboardJob,
} from "@/components/cloud-job-runner/job-api";

const POLL_INTERVAL_MS = 2_000;
const RECENT_JOBS_STORAGE_KEY = "cloud-job-runner:recent-jobs";
const MAX_RECENT_JOBS = 12;

export type JobExecutionState = {
  activeJob: DashboardJob | null;
  activeJobId: string | null;
  isPolling: boolean;
  isSubmitting: boolean;
  pollingError: string | null;
  submitError: string | null;
};

const initialState: JobExecutionState = {
  activeJob: null,
  activeJobId: null,
  isPolling: false,
  isSubmitting: false,
  pollingError: null,
  submitError: null,
};

function readStoredRecentJobs(): RecentJob[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const storedValue = window.localStorage.getItem(RECENT_JOBS_STORAGE_KEY);

    if (!storedValue) {
      return [];
    }

    const parsedValue = JSON.parse(storedValue) as unknown;

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue.filter((job): job is RecentJob => {
      if (typeof job !== "object" || job === null) {
        return false;
      }

      return (
        typeof job.id === "string" &&
        typeof job.name === "string" &&
        typeof job.run === "string" &&
        typeof job.submittedAt === "string" &&
        typeof job.status === "string"
      );
    });
  } catch {
    return [];
  }
}

function getRecentJobStatus(status: unknown, fallbackStatus = "running") {
  if (typeof status === "string" && status.trim()) {
    return status;
  }

  return fallbackStatus;
}

function buildRecentJob(jobId: string, status: string, existingJob?: RecentJob): RecentJob {
  return {
    id: jobId,
    name: existingJob?.name ?? `Python Job ${jobId.slice(0, 8)}`,
    run: existingJob?.run ?? `Job ID ${jobId}`,
    submittedAt: existingJob?.submittedAt ?? new Date().toISOString(),
    status,
  };
}

function upsertRecentJobs(currentJobs: RecentJob[], jobId: string, status: string) {
  const existingJob = currentJobs.find((job) => job.id === jobId);
  const nextJob = buildRecentJob(jobId, status, existingJob);

  return [nextJob, ...currentJobs.filter((job) => job.id !== jobId)].slice(0, MAX_RECENT_JOBS);
}

async function clearClientCache() {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.clear();
  } catch {
    // Ignore storage access failures.
  }

  try {
    window.sessionStorage.clear();
  } catch {
    // Ignore storage access failures.
  }

  if ("caches" in window) {
    try {
      const cacheKeys = await window.caches.keys();
      await Promise.all(cacheKeys.map((cacheKey) => window.caches.delete(cacheKey)));
    } catch {
      // Ignore Cache Storage failures.
    }
  }
}

export function useJobExecution() {
  const [state, setState] = useState<JobExecutionState>(initialState);
  const [recentJobs, setRecentJobs] = useState<RecentJob[]>([]);
  const [hasLoadedRecentJobs, setHasLoadedRecentJobs] = useState(false);
  const runTokenRef = useRef(0);
  const submitControllerRef = useRef<AbortController | null>(null);
  const pollControllerRef = useRef<AbortController | null>(null);
  const pollTimeoutRef = useRef<number | null>(null);

  const cancelActiveRequests = () => {
    submitControllerRef.current?.abort();
    submitControllerRef.current = null;

    pollControllerRef.current?.abort();
    pollControllerRef.current = null;

    if (pollTimeoutRef.current !== null) {
      window.clearTimeout(pollTimeoutRef.current);
      pollTimeoutRef.current = null;
    }
  };

  const clearJobHistory = async () => {
    runTokenRef.current += 1;
    cancelActiveRequests();
    setState(initialState);
    setRecentJobs([]);
    await clearClientCache();
  };

  const pollJobUntilComplete = async (jobId: string, runToken: number) => {
    const controller = new AbortController();
    pollControllerRef.current = controller;

    try {
      const nextJob = await fetchJob(jobId, controller.signal);

      if (runToken !== runTokenRef.current) {
        return;
      }

      const nextJobId =
        typeof nextJob.jobId === "string" && nextJob.jobId.trim()
          ? nextJob.jobId
          : jobId;
      const isTerminal = isTerminalJobStatus(nextJob.status);

      setState((currentState) => ({
        ...currentState,
        activeJob: nextJob,
        activeJobId: nextJobId,
        isPolling: !isTerminal,
        isSubmitting: false,
        pollingError: null,
      }));
      setRecentJobs((currentJobs) =>
        upsertRecentJobs(currentJobs, nextJobId, getRecentJobStatus(nextJob.status)),
      );

      if (isTerminal) {
        pollControllerRef.current = null;
        return;
      }

      pollTimeoutRef.current = window.setTimeout(() => {
        pollTimeoutRef.current = null;
        void pollJobUntilComplete(nextJobId, runToken);
      }, POLL_INTERVAL_MS);
    } catch (error) {
      if (controller.signal.aborted || runToken !== runTokenRef.current) {
        return;
      }

      pollControllerRef.current = null;

      setState((currentState) => ({
        ...currentState,
        activeJobId: jobId,
        isPolling: false,
        isSubmitting: false,
        pollingError: getErrorMessage(
          error,
          "Unable to refresh the latest job state.",
        ),
      }));
      setRecentJobs((currentJobs) => upsertRecentJobs(currentJobs, jobId, "poll failed"));
    }
  };

  const runJob = async (payload: string) => {
    const nextRunToken = runTokenRef.current + 1;
    runTokenRef.current = nextRunToken;
    cancelActiveRequests();

    setState({
      activeJob: null,
      activeJobId: null,
      isPolling: false,
      isSubmitting: true,
      pollingError: null,
      submitError: null,
    });

    const controller = new AbortController();
    submitControllerRef.current = controller;

    try {
      const { jobId } = await submitPythonJob(payload, controller.signal);

      if (nextRunToken !== runTokenRef.current) {
        return;
      }

      submitControllerRef.current = null;

      setState({
        activeJob: {
          error: null,
          jobId,
          result: null,
          status: "submitted",
        },
        activeJobId: jobId,
        isPolling: true,
        isSubmitting: false,
        pollingError: null,
        submitError: null,
      });
      setRecentJobs((currentJobs) => upsertRecentJobs(currentJobs, jobId, "submitted"));

      void pollJobUntilComplete(jobId, nextRunToken);
    } catch (error) {
      if (controller.signal.aborted || nextRunToken !== runTokenRef.current) {
        return;
      }

      submitControllerRef.current = null;

      setState({
        activeJob: null,
        activeJobId: null,
        isPolling: false,
        isSubmitting: false,
        pollingError: null,
        submitError: getErrorMessage(error, "Unable to submit the job."),
      });
    }
  };

  useEffect(() => {
    setRecentJobs(readStoredRecentJobs());
    setHasLoadedRecentJobs(true);
  }, []);

  useEffect(() => {
    if (!hasLoadedRecentJobs || typeof window === "undefined") {
      return;
    }

    try {
      window.localStorage.setItem(RECENT_JOBS_STORAGE_KEY, JSON.stringify(recentJobs));
    } catch {
      // Ignore storage write failures and keep the in-memory history.
    }
  }, [hasLoadedRecentJobs, recentJobs]);

  useEffect(() => {
    return () => {
      runTokenRef.current += 1;
      submitControllerRef.current?.abort();
      submitControllerRef.current = null;
      pollControllerRef.current?.abort();
      pollControllerRef.current = null;

      if (pollTimeoutRef.current !== null) {
        window.clearTimeout(pollTimeoutRef.current);
        pollTimeoutRef.current = null;
      }
    };
  }, []);

  return {
    ...state,
    clearJobHistory,
    recentJobs,
    runJob,
  };
}
