"use client";

import { useEffect, useRef, useState } from "react";

import {
  DRAFT_TAB_ID,
  type JobSession,
  type JobSessionStatus,
} from "@/components/cloud-job-runner/data";
import {
  fetchJob,
  getErrorMessage,
  isTerminalJobStatus,
  submitPythonJob,
  type DashboardJob,
} from "@/components/cloud-job-runner/job-api";

const POLL_INTERVAL_MS = 2_000;
const WORKSPACE_STORAGE_KEY = "cloud-job-runner:workspace-state";

type PersistedWorkspaceState = {
  activeTabId: string;
  jobOrder: string[];
  jobsById: Record<string, JobSession>;
  openTabs: string[];
};

type WorkspaceState = PersistedWorkspaceState & {
  isSubmitting: boolean;
};

const initialState: WorkspaceState = {
  activeTabId: DRAFT_TAB_ID,
  isSubmitting: false,
  jobOrder: [],
  jobsById: {},
  openTabs: [DRAFT_TAB_ID],
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function formatDisplayValue(value: unknown, fallback: string) {
  if (value === null || value === undefined) {
    return fallback;
  }

  if (typeof value === "string") {
    return value.trim() ? value : fallback;
  }

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function normalizeSessionStatus(
  status: unknown,
  fallbackStatus: JobSessionStatus,
): JobSessionStatus {
  if (typeof status !== "string") {
    return fallbackStatus;
  }

  const normalizedStatus = status.trim().toLowerCase();

  if (
    normalizedStatus === "pending" ||
    normalizedStatus === "submitted" ||
    normalizedStatus === "running" ||
    normalizedStatus === "completed" ||
    normalizedStatus === "failed"
  ) {
    return normalizedStatus;
  }

  if (normalizedStatus === "poll failed" || normalizedStatus === "poll_failed") {
    return "poll_failed";
  }

  return fallbackStatus;
}

function isTerminalSessionStatus(status: JobSessionStatus) {
  return status === "completed" || status === "failed" || status === "poll_failed";
}

function createSessionId() {
  if (typeof window !== "undefined" && typeof window.crypto?.randomUUID === "function") {
    return `session-${window.crypto.randomUUID()}`;
  }

  return `session-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function buildNewSession(codeSnapshot: string): JobSession {
  return {
    codeSnapshot,
    details: null,
    error: null,
    id: createSessionId(),
    isPolling: false,
    jobId: null,
    logs: "",
    result: null,
    status: "pending",
    submittedAt: new Date().toISOString(),
  };
}

function getPersistedState(state: WorkspaceState): PersistedWorkspaceState {
  return {
    activeTabId: state.activeTabId,
    jobOrder: state.jobOrder,
    jobsById: state.jobsById,
    openTabs: state.openTabs,
  };
}

function isJobSession(value: unknown): value is JobSession {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    (typeof value.jobId === "string" || value.jobId === null) &&
    typeof value.codeSnapshot === "string" &&
    typeof value.submittedAt === "string" &&
    typeof value.status === "string" &&
    typeof value.logs === "string" &&
    typeof value.isPolling === "boolean"
  );
}

function readStoredWorkspaceState(): PersistedWorkspaceState {
  if (typeof window === "undefined") {
    return getPersistedState(initialState);
  }

  try {
    const storedValue = window.localStorage.getItem(WORKSPACE_STORAGE_KEY);

    if (!storedValue) {
      return getPersistedState(initialState);
    }

    const parsedValue = JSON.parse(storedValue) as unknown;

    if (!isRecord(parsedValue)) {
      return getPersistedState(initialState);
    }

    const rawJobsById = isRecord(parsedValue.jobsById) ? parsedValue.jobsById : {};
    const jobsById = Object.fromEntries(
      Object.entries(rawJobsById).filter(([, value]) => isJobSession(value)),
    ) as Record<string, JobSession>;
    const jobOrder = Array.isArray(parsedValue.jobOrder)
      ? parsedValue.jobOrder.filter(
          (sessionId): sessionId is string =>
            typeof sessionId === "string" && Boolean(jobsById[sessionId]),
        )
      : [];
    const openTabsFromStorage = Array.isArray(parsedValue.openTabs)
      ? parsedValue.openTabs.filter(
          (tabId): tabId is string =>
            typeof tabId === "string" && (tabId === DRAFT_TAB_ID || Boolean(jobsById[tabId])),
        )
      : [];
    const openTabs = openTabsFromStorage.includes(DRAFT_TAB_ID)
      ? openTabsFromStorage
      : [DRAFT_TAB_ID, ...openTabsFromStorage];
    const activeTabId =
      typeof parsedValue.activeTabId === "string" && openTabs.includes(parsedValue.activeTabId)
        ? parsedValue.activeTabId
        : DRAFT_TAB_ID;

    const normalizedJobsById = Object.fromEntries(
      Object.entries(jobsById).map(([sessionId, session]) => {
        const fallbackStatus = session.jobId ? "running" : "failed";
        const normalizedStatus = normalizeSessionStatus(session.status, fallbackStatus);

        return [
          sessionId,
          {
            ...session,
            error:
              !session.jobId && !isTerminalSessionStatus(normalizedStatus)
                ? "This session was interrupted before the backend returned a job ID."
                : session.error,
            isPolling: session.jobId ? !isTerminalSessionStatus(normalizedStatus) : false,
            status:
              !session.jobId && !isTerminalSessionStatus(normalizedStatus)
                ? "failed"
                : normalizedStatus,
          },
        ];
      }),
    ) as Record<string, JobSession>;

    return {
      activeTabId,
      jobOrder,
      jobsById: normalizedJobsById,
      openTabs,
    };
  } catch {
    return getPersistedState(initialState);
  }
}

function upsertOpenTab(openTabs: string[], sessionId: string) {
  if (openTabs.includes(sessionId)) {
    return openTabs;
  }

  return [...openTabs, sessionId];
}

function getNextActiveTab(openTabs: string[], closedTabId: string) {
  const closedTabIndex = openTabs.indexOf(closedTabId);
  const remainingTabs = openTabs.filter((tabId) => tabId !== closedTabId);

  if (!remainingTabs.length) {
    return DRAFT_TAB_ID;
  }

  return remainingTabs[Math.max(0, closedTabIndex - 1)] ?? DRAFT_TAB_ID;
}

function extractLogs(job: DashboardJob, existingLogs: string) {
  if ("logs" in job || "log" in job) {
    return formatDisplayValue(job.logs ?? job.log, existingLogs || "No logs returned.");
  }

  return existingLogs;
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
  const [state, setState] = useState<WorkspaceState>(initialState);
  const [hasHydrated, setHasHydrated] = useState(false);
  const submitControllersRef = useRef<Map<string, AbortController>>(new Map());
  const pollControllersRef = useRef<Map<string, AbortController>>(new Map());
  const pollTimeoutsRef = useRef<Map<string, number>>(new Map());
  const ensurePollingRef = useRef<(sessionId: string, jobId: string) => void>(() => undefined);

  const clearAllRequests = () => {
    submitControllersRef.current.forEach((controller) => controller.abort());
    submitControllersRef.current.clear();

    pollControllersRef.current.forEach((controller) => controller.abort());
    pollControllersRef.current.clear();

    pollTimeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
    pollTimeoutsRef.current.clear();
  };

  const updateSession = (
    sessionId: string,
    updater: (session: JobSession) => JobSession,
  ) => {
    setState((currentState) => {
      const existingSession = currentState.jobsById[sessionId];

      if (!existingSession) {
        return currentState;
      }

      return {
        ...currentState,
        jobsById: {
          ...currentState.jobsById,
          [sessionId]: updater(existingSession),
        },
      };
    });
  };

  const pollJobUntilComplete = async (sessionId: string, jobId: string) => {
    const controller = new AbortController();
    pollControllersRef.current.set(sessionId, controller);

    try {
      const nextJob = await fetchJob(jobId, controller.signal);

      if (controller.signal.aborted) {
        return;
      }

      const nextStatus = normalizeSessionStatus(
        nextJob.status,
        isTerminalJobStatus(nextJob.status) ? "completed" : "running",
      );
      const isTerminal = isTerminalSessionStatus(nextStatus);

      updateSession(sessionId, (session) => ({
        ...session,
        details: nextJob,
        error: nextJob.error ?? session.error,
        isPolling: !isTerminal,
        jobId,
        logs: extractLogs(nextJob, session.logs),
        result: nextJob.result ?? session.result,
        status: nextStatus,
      }));

      pollControllersRef.current.delete(sessionId);

      if (isTerminal) {
        return;
      }

      const timeoutId = window.setTimeout(() => {
        pollTimeoutsRef.current.delete(sessionId);
        void pollJobUntilComplete(sessionId, jobId);
      }, POLL_INTERVAL_MS);

      pollTimeoutsRef.current.set(sessionId, timeoutId);
    } catch (error) {
      if (controller.signal.aborted) {
        return;
      }

      pollControllersRef.current.delete(sessionId);

      updateSession(sessionId, (session) => ({
        ...session,
        error: getErrorMessage(error, "Unable to refresh the latest job state."),
        isPolling: false,
        status: "poll_failed",
      }));
    }
  };

  const ensurePolling = (sessionId: string, jobId: string) => {
    if (pollControllersRef.current.has(sessionId) || pollTimeoutsRef.current.has(sessionId)) {
      return;
    }

    updateSession(sessionId, (session) => ({
      ...session,
      isPolling: true,
      status:
        session.status === "submitted" || session.status === "pending"
          ? "running"
          : session.status,
    }));

    void pollJobUntilComplete(sessionId, jobId);
  };

  ensurePollingRef.current = ensurePolling;

  const setActiveTab = (tabId: string) => {
    setState((currentState) => {
      if (tabId !== DRAFT_TAB_ID && !currentState.jobsById[tabId]) {
        return currentState;
      }

      if (currentState.activeTabId === tabId) {
        return currentState;
      }

      return {
        ...currentState,
        activeTabId: tabId,
      };
    });
  };

  const openJobTab = (sessionId: string) => {
    setState((currentState) => {
      if (!currentState.jobsById[sessionId]) {
        return currentState;
      }

      return {
        ...currentState,
        activeTabId: sessionId,
        openTabs: upsertOpenTab(currentState.openTabs, sessionId),
      };
    });
  };

  const closeTab = (tabId: string) => {
    if (tabId === DRAFT_TAB_ID) {
      return;
    }

    setState((currentState) => {
      if (!currentState.openTabs.includes(tabId)) {
        return currentState;
      }

      const nextOpenTabs = currentState.openTabs.filter((openTabId) => openTabId !== tabId);

      return {
        ...currentState,
        activeTabId:
          currentState.activeTabId === tabId
            ? getNextActiveTab(currentState.openTabs, tabId)
            : currentState.activeTabId,
        openTabs: nextOpenTabs.length ? nextOpenTabs : [DRAFT_TAB_ID],
      };
    });
  };

  const clearJobHistory = async () => {
    clearAllRequests();
    setState(initialState);
    await clearClientCache();
  };

  const runJob = async (payload: string) => {
    const nextSession = buildNewSession(payload);

    setState((currentState) => ({
      ...currentState,
      activeTabId: nextSession.id,
      isSubmitting: true,
      jobOrder: [nextSession.id, ...currentState.jobOrder],
      jobsById: {
        ...currentState.jobsById,
        [nextSession.id]: nextSession,
      },
      openTabs: upsertOpenTab(currentState.openTabs, nextSession.id),
    }));

    const controller = new AbortController();
    submitControllersRef.current.set(nextSession.id, controller);

    try {
      const { jobId } = await submitPythonJob(payload, controller.signal);

      if (controller.signal.aborted) {
        return;
      }

      submitControllersRef.current.delete(nextSession.id);

      updateSession(nextSession.id, (session) => ({
        ...session,
        details: {
          error: null,
          jobId,
          result: null,
          status: "submitted",
        },
        isPolling: true,
        jobId,
        status: "submitted",
      }));
      setState((currentState) => ({
        ...currentState,
        isSubmitting: false,
      }));

      ensurePolling(nextSession.id, jobId);
    } catch (error) {
      if (controller.signal.aborted) {
        return;
      }

      submitControllersRef.current.delete(nextSession.id);

      const errorMessage = getErrorMessage(error, "Unable to submit the job.");

      updateSession(nextSession.id, (session) => ({
        ...session,
        error: errorMessage,
        isPolling: false,
        status: "failed",
      }));
      setState((currentState) => ({
        ...currentState,
        isSubmitting: false,
      }));
    }
  };

  useEffect(() => {
    const restoredState = readStoredWorkspaceState();

    setState({
      ...restoredState,
      isSubmitting: false,
    });
    setHasHydrated(true);

    window.setTimeout(() => {
      restoredState.jobOrder.forEach((sessionId) => {
        const session = restoredState.jobsById[sessionId];

        if (session?.jobId && !isTerminalSessionStatus(session.status)) {
          ensurePollingRef.current(sessionId, session.jobId);
        }
      });
    }, 0);
  }, []);

  useEffect(() => {
    if (!hasHydrated || typeof window === "undefined") {
      return;
    }

    try {
      window.localStorage.setItem(
        WORKSPACE_STORAGE_KEY,
        JSON.stringify(getPersistedState(state)),
      );
    } catch {
      // Ignore storage write failures and keep the in-memory workspace state.
    }
  }, [hasHydrated, state]);

  useEffect(() => {
    return () => {
      clearAllRequests();
    };
  }, []);

  const jobHistory = state.jobOrder
    .map((sessionId) => state.jobsById[sessionId])
    .filter((session): session is JobSession => Boolean(session));
  const openSessionTabs = state.openTabs
    .filter((tabId) => tabId !== DRAFT_TAB_ID)
    .map((tabId) => state.jobsById[tabId])
    .filter((session): session is JobSession => Boolean(session));
  const activeSession =
    state.activeTabId === DRAFT_TAB_ID ? null : state.jobsById[state.activeTabId] ?? null;

  return {
    activeSession,
    activeTabId: state.activeTabId,
    clearJobHistory,
    closeTab,
    isSubmitting: state.isSubmitting,
    jobHistory,
    openJobTab,
    openSessionTabs,
    runJob,
    setActiveTab,
  };
}


