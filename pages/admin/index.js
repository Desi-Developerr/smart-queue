import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../lib/supabaseClient";

export default function AdminDashboard() {
  const [services, setServices] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const router = useRouter();

  async function loadServices(orgId) {
    const { data } = await supabase
      .from("services")
      .select("*")
      .eq("organization_id", orgId)
      .order("created_at", { ascending: false });
    setServices(data || []);
  }

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!profileData || profileData.role !== "admin") {
        router.push("/");
        return;
      }

      setProfile(profileData);
      await loadServices(profileData.organization_id);
      setLoading(false);
    }
    init();
  }, [router]);

  async function handleCreateService(e) {
    e.preventDefault();
    await supabase.from("services").insert({
      organization_id: profile.organization_id,
      name: newName,
      description: newDesc,
    });
    setNewName("");
    setNewDesc("");
    setShowForm(false);
    loadServices(profile.organization_id);
  }

  async function handleDelete(id) {
    if (!confirm("Delete this service queue?")) return;
    await supabase.from("services").delete().eq("id", id);
    loadServices(profile.organization_id);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-white/50">Loading...</div>;

  return (
    <div className="min-h-screen px-4 py-10 max-w-4xl mx-auto">
      <header className="flex items-center justify-between mb-10">
        <div>
          <h1 className="font-display text-2xl font-semibold">Admin Dashboard</h1>
          <p className="text-white/50 text-sm">Manage your queues</p>
        </div>
        <button className="btn-secondary" onClick={handleLogout}>Log out</button>
      </header>

      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-lg font-medium">Your service queues</h2>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ New queue"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreateService} className="card mb-6 space-y-3">
          <input className="input" placeholder="Service name (e.g. OPD Consultation)" value={newName} onChange={(e) => setNewName(e.target.value)} required />
          <input className="input" placeholder="Short description" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} />
          <button type="submit" className="btn-primary">Create queue</button>
        </form>
      )}

      <div className="space-y-3">
        {services.map((s) => (
          <div key={s.id} className="card flex items-center justify-between">
            <div>
              <p className="font-medium">{s.name}</p>
              <p className="text-white/40 text-sm">{s.description}</p>
            </div>
            <div className="flex gap-2">
              <button className="btn-secondary" onClick={() => router.push(`/admin/${s.id}`)}>
                Manage live queue
              </button>
              <button className="btn-secondary" onClick={() => router.push(`/admin/analytics/${s.id}`)}>
                Analytics
              </button>
              <button className="btn-danger" onClick={() => handleDelete(s.id)}>Delete</button>
            </div>
          </div>
        ))}
        {services.length === 0 && <p className="text-white/50">No queues yet — create your first one above.</p>}
      </div>
    </div>
  );
}
