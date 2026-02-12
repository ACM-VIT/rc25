"use client";

import { useEffect, useRef } from "react";
import {
  type ClientEventName,
  type ClientEventPayloadMap,
  subscribeClientEvent,
} from "@/lib/client-events";

export function useClientEvent<T extends ClientEventName>(
  eventName: T,
  handler: (payload: ClientEventPayloadMap[T]) => void,
): void {
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    return subscribeClientEvent(eventName, (payload) => {
      handlerRef.current(payload);
    });
  }, [eventName]);
}
