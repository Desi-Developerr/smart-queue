import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../../lib/supabaseClient";

export default function Analytics() {
  const router = useRouter();
  const { serviceId } = router.query;
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!serviceId) return;
    async function load() {
      const { data: allTokens } = await supabase
        .from("tokens")
        .select("*")
        .eq("service_id", serviceId);

      if (!allTokens) {
        setLoading(false);
        return;
      }

      const served = allTokens.filter((t) => t.status === "served" && t.called_at && t.completed_at);
      const skipped = allTokens.filter((t) => t.status === "skipped").length;
      const total = allTokens.length;

      const avgWaitMinutes =
        served.length > 0
          ? served.reduce((sum, t) => {
              const wait = (new Date(t.called_at) - new Date(t.created_at)) / 60000;
              return sum + wait;
            }, 0) / served.length
          : 0;

      const hourCounts = {};
      allTokens.forEach((t) => {
        const hour = new Date(t.created_at).getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      });
      const peakHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0];

      setStats({
        total,
        served: served.length,
        skipped,
        noShowRate: total > 0 ? ((skipped / total) * 100).toFixed(1) : 0,
        avgWaitMinutes: avgWaitMinutes.toFixed(1),
        peakHour: peakHour ? `${peakHour[0]}:00 - ${Number(peakHour[0]) + 1}:00` : "N/A",
      });
      setLoading(false);
    }
    load();
  }, [serviceId]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-white/50">Loading...</div>;

  return (
    <div className="min-h-screen px-4 py-10 max-w-3xl mx-auto">
      <button className="text-white/50 text-sm mb-6" onClick={() => router.push("/admin")}>← Back to dashboard</button>
      <h1 className="font-display text-2xl font-semibold mb-8">Queue Analytics</h1>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="card">
          <p className="text-white/50 text-sm mb-1">Total tokens issued</p>
          <p className="font-display text-3xl font-bold">{stats.total}</p>
        </div>
        <div className="card">
          <p className="text-white/50 text-sm mb-1">Served</p>
          <p className="font-display text-3xl font-bold text-brand-300">{stats.served}</p>
        </div>
        <div className="card">
          <p className="text-white/50 text-sm mb-1">Average wait time</p>
          <p className="font-display text-3xl font-bold">{stats.avgWaitMinutes} min</p>
        </div>
        <div className="card">
          <p className="text-white/50 text-sm mb-1">No-show rate</p>
          <p className="font-display text-3xl font-bold text-amber-400">{stats.noShowRate}%</p>
        </div>
        <div className="card sm:col-span-2">
          <p className="text-white/50 text-sm mb-1">Peak hour</p>
          <p className="font-display text-2xl font-bold">{stats.peakHour}</p>
        </div>
      </div>
    </div>
  );
}
