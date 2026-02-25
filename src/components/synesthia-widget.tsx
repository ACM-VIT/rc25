"use client";

import { useEffect } from "react";

type SynesthesiaWidgetApi = {
  init: (options?: {
    floating?: boolean;
    draggable?: boolean;
    width?: string;
    height?: string;
    position?: { right?: string; bottom?: string };
    roomCode?: string;
    baseUrl?: string;
  }) => void;
  destroy: () => void;
};

declare global {
  interface Window {
    Synesthesia?: SynesthesiaWidgetApi;
  }
}

const DEFAULT_BASE_URL = "https://synesthesia-topaz.vercel.app";
const DEFAULT_ROOM_CODE = "9RJ9H1";

function getBaseUrl() {
  const configured = process.env.NEXT_PUBLIC_SYNESTHESIA_BASE_URL;
  return (configured ?? DEFAULT_BASE_URL).replace(/\/+$/, "");
}

function getScriptUrl(baseUrl: string) {
  return (
    process.env.NEXT_PUBLIC_SYNESTHESIA_WIDGET_SCRIPT_URL ??
    `${baseUrl}/widget.js`
  );
}

function getRoomCode() {
  const configured = process.env.NEXT_PUBLIC_SYNESTHESIA_ROOM_CODE;
  return (configured ?? DEFAULT_ROOM_CODE).trim().toUpperCase();
}

export default function SynesthesiaWidget() {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_SYNESTHESIA_WIDGET_ENABLED === "false") {
      return;
    }

    const baseUrl = getBaseUrl();
    const scriptUrl = getScriptUrl(baseUrl);

    const initWidget = () => {
      if (!window.Synesthesia) {
        return;
      }

      window.Synesthesia.destroy();
      window.Synesthesia.init({
        floating: true,
        draggable: true,
        baseUrl,
        roomCode: getRoomCode(),
        width: "400px",
        height: "650px",
        position: { right: "24px", bottom: "96px" },
      });
    };

    if (window.Synesthesia) {
      initWidget();
      return () => {
        window.Synesthesia?.destroy();
      };
    }

    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[data-synesthesia-widget="true"]',
    );

    const script = existingScript ?? document.createElement("script");
    const onLoad = () => initWidget();

    script.addEventListener("load", onLoad);
    if (!existingScript) {
      script.src = scriptUrl;
      script.async = true;
      script.defer = true;
      script.dataset.synesthesiaWidget = "true";
      document.body.appendChild(script);
    } else {
      initWidget();
    }

    return () => {
      script.removeEventListener("load", onLoad);
      window.Synesthesia?.destroy();
    };
  }, []);

  return null;
}
