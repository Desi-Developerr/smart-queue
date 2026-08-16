import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../lib/supabaseClient";

export default function AdminQueueMonitor() {
  const router = useRouter();
  const { id: serviceId } = router.query;
  const [service, setService] = useState(null);
  const [waitingTokens, setWaitingTokens] = useState([]);
  const [calledToken, setCalledToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!serviceId) return;

    const { data: serviceData } = await supabase.from("services").select("*").eq("id", serviceId).single();
    setService(serviceData);

    const { data: waiting } = await supabase
      .from("tokens")
      .select("*")
      .eq("service_id", serviceId)
      .eq("status", "waiting")
      .order("created_at", { ascending: true });
    setWaitingTokens(waiting || []);

    const { data: called } = await supabase
      .from("tokens")
      .select("*")
      .eq("service_id", serviceId)
      .eq("status", "called")
      .order("called_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    setCalledToken(called);

    setLoading(false);
  }, [serviceId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!serviceId) return;
    const channel = supabase
      .channel(`admin-queue-${serviceId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tokens", filter: `service_id=eq.${serviceId}` },
        () => loadData()
      )
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [serviceId, loadData]);

  async function handleCallNext() {
    if (waitingTokens.length === 0) return;
    const next = waitingTokens[0];
    await supabase.from("tokens").update({ status: "called", called_at: new Date().toISOString() }).eq("id", next.id);
  }

  async function handleSkip(id) {
    await supabase.from("tokens").update({ status: "skipped" }).eq("id", id);
  }

  async function handleComplete(id) {
    await supabase.from("tokens").update({ status: "served", completed_at: new Date().toISOString() }).eq("id", id);
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-white/50">Loading...</div>;

  return (
    <div className="min-h-screen px-4 py-10 max-w-3xl mx-auto">
      <button className="text-white/50 text-sm mb-6" onClick={() => router.push("/admin")}>← Back to dashboard</button>

      <h1 className="font-display text-2xl font-semibold mb-1">{service?.name}</h1>
      <p className="text-white/50 text-sm mb-8">Live queue monitor</p>

      <div className="card mb-6">
        <p className="text-white/50 text-sm mb-2">Currently serving</p>
        {calledToken ? (
          <div className="flex items-center justify-between">
            <p className="font-display text-3xl font-bold text-amber-400">Token #{calledToken.token_number}</p>
            <button className="btn-primary" onClick={() => handleComplete(calledToken.id)}>Mark complete</button>
          </div>
        ) : (
          <p className="text-white/30">No one is currently being served.</p>
        )}
      </div>

      <button className="btn-primary w-full mb-8" onClick={handleCallNext} disabled={waitingTokens.length === 0 || !!calledToken}>
        Call next {calledToken ? "(complete current token first)" : ""}
      </button>

      <h2 className="font-display text-lg font-medium mb-3">Waiting ({waitingTokens.length})</h2>
      <div className="space-y-2">
        {waitingTokens.map((t, i) => (
          <div key={t.id} className="card flex items-center justify-between !p-4">
            <div className="flex items-center gap-3">
              <span className="text-white/30 font-mono text-sm w-6">{i + 1}</span>
              <span className="font-medium">Token #{t.token_number}</span>
            </div>
            <button className="btn-danger" onClick={() => handleSkip(t.id)}>Skip</button>
          </div>
        ))}
        {waitingTokens.length === 0 && <p className="text-white/30 text-sm">Queue is empty.</p>}
      </div>
    </div>
  );
}
