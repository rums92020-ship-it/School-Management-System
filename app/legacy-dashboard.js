"use client";

import { useEffect, useState } from "react";

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
      try {
        await loadScript("https://cdn.jsdelivr.net/npm/qrcode@1.5.4/build/qrcode.min.js");
      } catch (error) {
        console.error("Could not preload the QR code library.", error);
      }
      await loadScript("/legacy-app.js");
    })().catch((error) => {
      appScriptPromise = undefined;
      throw error;
    });
  }

  return appScriptPromise;
}

export default function LegacyDashboard({ markup }) {
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let active = true;

    loadDashboardScripts().catch((error) => {
      console.error("Could not start the school management dashboard.", error);
      if (active) {
        setLoadError("The dashboard could not start. Refresh the page and try again.");
      }
    });

    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      {loadError ? <p role="alert">{loadError}</p> : null}
      <div suppressHydrationWarning dangerouslySetInnerHTML={{ __html: markup }} />
    </>
  );
}
