"use client";

import { useEffect, useRef, useState } from "react";

import {
  fetchJob,
  getErrorMessage,
  isTerminalJobStatus,
  submitPythonJob,
  type DashboardJob,
} from "@/components/cloud-job-runner/job-api";

const POLL_INTERVAL_MS = 2_000;

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

export function useJobExecution() {
  const [state, setState] = useState<JobExecutionState>(initialState);
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
    runJob,
  };
}
