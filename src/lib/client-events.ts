import type { EvalEnum } from "@/db/schema";

export const CLIENT_EVENTS = {
  SUBMISSION_CREATED: "submission:created",
  SUBMISSION_CREATION_FAILED: "submission:creation-failed",
  SUBMISSION_EVALUATED: "submission:evaluated",
  SUBMISSION_EVALUATION_ERROR: "submission:evaluation-error",
} as const;

export type ClientEventName = (typeof CLIENT_EVENTS)[keyof typeof CLIENT_EVENTS];

export interface ClientEventPayloadMap {
  [CLIENT_EVENTS.SUBMISSION_CREATED]: {
    submissionId: string;
    problemId: string;
  };
  [CLIENT_EVENTS.SUBMISSION_CREATION_FAILED]: {
    problemId: string;
    message: string;
  };
  [CLIENT_EVENTS.SUBMISSION_EVALUATED]: {
    submissionId: string;
    problemId: string;
    evaluationStatus: EvalEnum | null;
    passed: number;
    total: number;
  };
  [CLIENT_EVENTS.SUBMISSION_EVALUATION_ERROR]: {
    submissionId: string;
    problemId: string;
    evaluationStatus: EvalEnum | null;
    message: string;
  };
}

const getEventName = (name: ClientEventName) => `rc25:${name}`;

export function emitClientEvent<T extends ClientEventName>(
  name: T,
  detail: ClientEventPayloadMap[T],
): void {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent<ClientEventPayloadMap[T]>(getEventName(name), { detail }),
  );
}

export function subscribeClientEvent<T extends ClientEventName>(
  name: T,
  listener: (detail: ClientEventPayloadMap[T]) => void,
): () => void {
  if (typeof window === "undefined") return () => undefined;

  const wrappedListener = (event: Event) => {
    const customEvent = event as CustomEvent<ClientEventPayloadMap[T]>;
    listener(customEvent.detail);
  };

  window.addEventListener(getEventName(name), wrappedListener);

  return () => {
    window.removeEventListener(getEventName(name), wrappedListener);
  };
}
