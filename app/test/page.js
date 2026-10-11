"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../lib/supabase/client";

export default function SupabaseTestPage() {
  const [result, setResult] = useState({ loading: true, data: null, error: null });

  useEffect(() => {
    let active = true;

    async function loadStudents() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.from("students").select("*").limit(50);
        if (error) throw error;
        if (active) setResult({ loading: false, data, error: null });
      } catch (error) {
        if (active) {
          setResult({
            loading: false,
            data: null,
            error: error instanceof Error ? error.message : "Could not load students.",
          });
        }
      }
    }

    loadStudents();
    return () => {
      active = false;
    };
  }, []);

  return (
    <main>
      <h1>Supabase students test</h1>
      {result.loading && <p>Loading students…</p>}
      {result.error && <p role="alert">Could not load students: {result.error}</p>}
      {result.data && (
        result.data.length
          ? <pre>{JSON.stringify(result.data, null, 2)}</pre>
          : <p>No student rows are visible to this client.</p>
      )}
    </main>
  );
}
