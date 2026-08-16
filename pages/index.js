import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";

export default function Home() {
  const [services, setServices] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      const { data, error } = await supabase
        .from("services")
        .select("id, name, description, avg_service_minutes, organizations(name)")
        .eq("is_active", true);

      if (!error) setServices(data || []);
      setLoading(false);
    }
    load();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div className="min-h-screen px-4 py-10 max-w-5xl mx-auto">
      <header className="flex items-center justify-between mb-10">
        <div>
          <h1 className="font-display text-3xl font-semibold">Smart Queue</h1>
          <p className="text-white/50 text-sm">Book a token. Skip the physical line.</p>
        </div>
        <div className="flex gap-3">
          {user ? (
            <>
              <a href="/history" className="btn-secondary">My tokens</a>
              <button onClick={handleLogout} className="btn-secondary">Log out</button>
            </>
          ) : (
            <a href="/login" className="btn-primary">Log in</a>
          )}
        </div>
      </header>

      <h2 className="font-display text-xl font-medium mb-4">Available services</h2>

      {loading && <p className="text-white/50">Loading services...</p>}

      {!loading && services.length === 0 && (
        <p className="text-white/50">No services available yet — check back soon.</p>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        {services.map((service) => (
          <div key={service.id} className="card">
            <p className="text-brand-300 text-xs font-mono uppercase tracking-wide mb-1">
              {service.organizations?.name}
            </p>
            <h3 className="font-display text-lg font-semibold mb-1">{service.name}</h3>
            <p className="text-white/50 text-sm mb-4">{service.description || "No description provided."}</p>
            <p className="text-white/40 text-xs mb-4">~{service.avg_service_minutes} min per person</p>
            <button
              className="btn-primary"
              onClick={() => user ? router.push(`/book/${service.id}`) : router.push("/login")}
            >
              Book a token
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
