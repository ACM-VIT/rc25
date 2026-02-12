"use client";

import { useMemo, useRef } from "react";
import {
  CLIENT_EVENTS,
  type ClientEventName,
  type ClientEventPayloadMap,
} from "@/lib/client-events";
import { useClientEvent } from "@/hooks/useClientEvent";

const DEFAULT_EVENT_SOUNDS: Partial<Record<ClientEventName, string>> = {
  [CLIENT_EVENTS.SUBMISSION_CREATED]: "/sounds/f1-radio.mp3",
};
const ZERO_TESTCASES_SOUND = "/sounds/i-am-stupid-leclarc.mp3";

export type SubmissionEventSoundMap = Partial<
  Record<ClientEventName, string | null>
>;

interface SubmissionEventEffectsOptions {
  soundMap?: SubmissionEventSoundMap;
  onSubmissionCreated?: (
    payload: ClientEventPayloadMap[typeof CLIENT_EVENTS.SUBMISSION_CREATED],
  ) => void;
  onSubmissionCreationFailed?: (
    payload: ClientEventPayloadMap[typeof CLIENT_EVENTS.SUBMISSION_CREATION_FAILED],
  ) => void;
  onSubmissionEvaluated?: (
    payload: ClientEventPayloadMap[typeof CLIENT_EVENTS.SUBMISSION_EVALUATED],
  ) => void;
  onSubmissionEvaluationError?: (
    payload: ClientEventPayloadMap[typeof CLIENT_EVENTS.SUBMISSION_EVALUATION_ERROR],
  ) => void;
}

export function useSubmissionEventEffects(
  options: SubmissionEventEffectsOptions = {},
): void {
  const audioCacheRef = useRef<Map<string, HTMLAudioElement>>(new Map());

  const effectiveSoundMap = useMemo(
    () => ({ ...DEFAULT_EVENT_SOUNDS, ...(options.soundMap ?? {}) }),
    [options.soundMap],
  );

  const playEventSound = (eventName: ClientEventName) => {
    const soundSrc = effectiveSoundMap[eventName];
    if (!soundSrc) return;
    playSound(soundSrc);
  };

  const playSound = (soundSrc: string) => {
    if (!soundSrc || typeof Audio === "undefined") return;

    let audio = audioCacheRef.current.get(soundSrc);
    if (!audio) {
      audio = new Audio(soundSrc);
      audio.preload = "auto";
      audioCacheRef.current.set(soundSrc, audio);
    }

    audio.currentTime = 0;
    void audio.play().catch(() => undefined);
  };

  useClientEvent(CLIENT_EVENTS.SUBMISSION_CREATED, (payload) => {
    playEventSound(CLIENT_EVENTS.SUBMISSION_CREATED);
    options.onSubmissionCreated?.(payload);
  });

  useClientEvent(CLIENT_EVENTS.SUBMISSION_CREATION_FAILED, (payload) => {
    options.onSubmissionCreationFailed?.(payload);
  });

  useClientEvent(CLIENT_EVENTS.SUBMISSION_EVALUATED, (payload) => {
    if (payload.passed === 0 && payload.total > 0) {
      playSound(ZERO_TESTCASES_SOUND);
    }
    options.onSubmissionEvaluated?.(payload);
  });

  useClientEvent(CLIENT_EVENTS.SUBMISSION_EVALUATION_ERROR, (payload) => {
    options.onSubmissionEvaluationError?.(payload);
  });
}
