import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../lib/supabaseClient";

export default function QueueStatus() {
  const router = useRouter();
  const { tokenId } = router.query;
  const [token, setToken] = useState(null);
  const [service, setService] = useState(null);
  const [position, setPosition] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadTokenAndPosition = useCallback(async () => {
    if (!tokenId) return;

    const { data: tokenData } = await supabase
      .from("tokens")
      .select("*, services(name, avg_service_minutes)")
      .eq("id", tokenId)
      .single();

    if (!tokenData) return;
    setToken(tokenData);
    setService(tokenData.services);

    if (tokenData.status === "waiting") {
      const { count } = await supabase
        .from("tokens")
        .select("*", { count: "exact", head: true })
        .eq("service_id", tokenData.service_id)
        .eq("status", "waiting")
        .lt("created_at", tokenData.created_at);

      setPosition(count || 0);
    }
    setLoading(false);
  }, [tokenId]);

  useEffect(() => {
    loadTokenAndPosition();
  }, [loadTokenAndPosition]);

  useEffect(() => {
    if (!token?.service_id) return;

    const channel = supabase
      .channel(`queue-${token.service_id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tokens", filter: `service_id=eq.${token.service_id}` },
        () => {
          loadTokenAndPosition();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [token?.service_id, loadTokenAndPosition]);

  async function handleCancel() {
    await supabase.from("tokens").update({ status: "cancelled" }).eq("id", tokenId);
    router.push("/history");
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-white/50">Loading...</div>;
  if (!token) return <div className="min-h-screen flex items-center justify-center text-white/50">Token not found.</div>;

  const statusLabel = {
    waiting: "Waiting",
    called: "It's your turn!",
    served: "Completed",
    skipped: "Skipped",
    cancelled: "Cancelled",
  }[token.status];

  const estWait = position !== null ? position * (service?.avg_service_minutes || 5) : null;

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="card w-full max-w-md text-center">
        <p className="text-white/50 text-sm mb-1">{service?.name}</p>
        <p className="font-mono text-white/30 text-xs mb-6">Token #{token.token_number}</p>

        {token.status === "waiting" && (
          <>
            <p className="text-white/50 text-sm mb-2">People ahead of you</p>
            <p className="font-display text-6xl font-bold text-brand-300 mb-4">{position}</p>
            <p className="text-white/40 text-sm mb-8">Estimated wait: ~{estWait} min</p>
            {position <= 2 && (
              <p className="text-amber-400 text-sm font-medium mb-6">Your turn is approaching — please be ready.</p>
            )}
            <button className="btn-danger" onClick={handleCancel}>Cancel this token</button>
          </>
        )}

        {token.status === "called" && (
          <p className="font-display text-2xl font-semibold text-brand-300 mb-4">
            🔔 It's your turn — please proceed to the counter.
          </p>
        )}

        {token.status === "served" && (
          <p className="font-display text-xl font-semibold text-white/70">✅ Service completed. Thank you.</p>
        )}

        {(token.status === "skipped" || token.status === "cancelled") && (
          <p className="font-display text-xl font-semibold text-white/50">{statusLabel}</p>
        )}

        <button className="btn-secondary w-full mt-8" onClick={() => router.push("/history")}>
          Back to my tokens
        </button>
      </div>
    </div>
  );
}
