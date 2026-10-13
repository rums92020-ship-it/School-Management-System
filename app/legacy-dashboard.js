"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

let appScriptPromise;

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => {
      script.remove();
      reject(new Error(`Could not load ${src}.`));
    };
    document.body.appendChild(script);
  });
}

function loadDashboardScripts() {
  if (!appScriptPromise) {
    appScriptPromise = (async () => {
      window.QRCode = QRCode;
      await loadScript("/legacy-app.js");
    })().catch((error) => {
      appScriptPromise = undefined;
      throw error;
    });
  }

  return appScriptPromise;
}

export default function LegacyDashboard({ markup, timeZone }) {
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let active = true;
    window.APP_TIMEZONE = timeZone;

    loadDashboardScripts().catch((error) => {
      console.error("Could not start the school management dashboard.", error);
      if (active) {
        setLoadError("The dashboard could not start. Refresh the page and try again.");
      }
    });

    return () => {
      active = false;
    };
  }, [timeZone]);

  return (
    <>
      {loadError ? <p role="alert">{loadError}</p> : null}
      <div suppressHydrationWarning dangerouslySetInnerHTML={{ __html: markup }} />
    </>
  );
}
