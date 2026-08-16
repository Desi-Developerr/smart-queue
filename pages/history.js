import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";

export default function History() {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data } = await supabase
        .from("tokens")
        .select("*, services(name)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setTokens(data || []);
      setLoading(false);
    }
    load();
  }, [router]);

  const statusColor = {
    waiting: "text-brand-300",
    called: "text-amber-400",
    served: "text-white/50",
    skipped: "text-white/30",
    cancelled: "text-white/30",
  };

  return (
    <div className="min-h-screen px-4 py-10 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-2xl font-semibold">My tokens</h1>
        <button className="btn-secondary" onClick={() => router.push("/")}>Browse services</button>
      </div>

      {loading && <p className="text-white/50">Loading...</p>}
      {!loading && tokens.length === 0 && <p className="text-white/50">No tokens booked yet.</p>}

      <div className="space-y-3">
        {tokens.map((t) => (
          <div key={t.id} className="card flex items-center justify-between">
            <div>
              <p className="font-medium">{t.services?.name}</p>
              <p className="text-white/40 text-xs font-mono">Token #{t.token_number} · {new Date(t.created_at).toLocaleString()}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className={`text-sm font-medium capitalize ${statusColor[t.status]}`}>{t.status}</span>
              {t.status === "waiting" && (
                <button className="btn-secondary" onClick={() => router.push(`/queue/${t.id}`)}>
                  View
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
