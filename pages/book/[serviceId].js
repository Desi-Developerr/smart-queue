import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../lib/supabaseClient";

export default function BookToken() {
  const router = useRouter();
  const { serviceId } = router.query;
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!serviceId) return;
    async function loadService() {
      const { data } = await supabase
        .from("services")
        .select("*, organizations(name)")
        .eq("id", serviceId)
        .single();
      setService(data);
    }
    loadService();
  }, [serviceId]);

  async function handleBook() {
    setLoading(true);
    setError("");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    const { data, error: insertError } = await supabase
      .from("tokens")
      .insert({ service_id: serviceId, user_id: user.id, status: "waiting" })
      .select()
      .single();

    setLoading(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    router.push(`/queue/${data.id}`);
  }

  if (!service) return <div className="min-h-screen flex items-center justify-center text-white/50">Loading...</div>;

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="card w-full max-w-md text-center">
        <p className="text-brand-300 text-xs font-mono uppercase tracking-wide mb-2">
          {service.organizations?.name}
        </p>
        <h1 className="font-display text-2xl font-semibold mb-2">{service.name}</h1>
        <p className="text-white/50 text-sm mb-8">{service.description}</p>

        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        <button className="btn-primary w-full" onClick={handleBook} disabled={loading}>
          {loading ? "Booking..." : "Confirm & book token"}
        </button>
        <button className="btn-secondary w-full mt-3" onClick={() => router.push("/")}>
          Cancel
        </button>
      </div>
    </div>
  );
}
