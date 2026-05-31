import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Loader2, Plus, Trash2, Calendar, Ticket, TrendingUp,
  Users, Crown, AlertTriangle, BarChart3, Edit2, CheckCircle2,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { api, type Booking, type CompanyPlan, type EventItem } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const CATEGORIES = ["Tech", "Workshop", "Music", "Business", "Art", "Sports", "Other"];

const EMPTY_FORM = {
  title: "", description: "", date: "", location: "", map_link: "",
  ticket_limit: 100, image: "", category: "Tech", price: 0,
};

function StatCard({ icon: Icon, label, value, sub, delay = 0 }: {
  icon: React.ElementType; label: string; value: string | number; sub?: string; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="rounded-2xl glass p-6 shadow-card"
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-muted-foreground">{label}</div>
          <div className="text-3xl font-black mt-1">{value}</div>
          {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
        </div>
        <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-primary shadow-glow">
          <Icon className="h-6 w-6 text-primary-foreground" />
        </div>
      </div>
    </motion.div>
  );
}

export default function CompanyDashboard() {
  const { user, company } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ events: 0, bookings: 0, revenue: 0, seats_sold: 0 });
  const [events, setEvents] = useState<EventItem[]>([]);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [plan, setPlan] = useState<CompanyPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user || user.role !== "company") { navigate("/company/login"); return; }
    refresh().finally(() => setLoading(false));
  }, [user, navigate]);

  const refresh = async () => {
    const d = await api.companyDashboard();
    setStats(d.stats);
    setEvents(d.events);
    setRecentBookings(d.recent_bookings);
    setPlan(d.plan);
  };

  const createEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.date || !form.location || !form.image) {
      toast.error("Fill all required fields"); return;
    }
    setSubmitting(true);
    try {
      await api.createEvent(form);
      toast.success("Event created! 🎉");
      setOpen(false);
      setForm(EMPTY_FORM);
      refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create event");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteEvent = async (id: string) => {
    if (!confirm("Delete this event? This cannot be undone.")) return;
    try {
      await api.deleteEvent(id);
      toast.success("Event deleted");
      refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen mesh-bg">
        <Navbar />
        <div className="grid place-items-center py-32"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>
      </div>
    );
  }

  const planName = plan?.plan?.name || "No Plan";
  const eventLimit = plan?.plan?.event_limit ?? 0;
  const eventsUsed = stats.events;
  const canCreate = plan && (eventLimit === -1 || eventsUsed < eventLimit);
  const usagePct = eventLimit === -1 ? 0 : Math.round((eventsUsed / eventLimit) * 100);

  return (
    <div className="min-h-screen mesh-bg">
      <Navbar />
      <div className="container py-10 space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-black">
              <span className="gradient-text">{company?.name || user?.name}</span>
            </h1>
            <p className="text-muted-foreground mt-1">Company Dashboard</p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/company/plans">
              <Button variant="outline" size="sm">
                <Crown className="h-4 w-4" /> {planName} Plan
              </Button>
            </Link>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="hero" disabled={!canCreate}>
                  <Plus className="h-4 w-4" /> New Event
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader><DialogTitle>Create New Event</DialogTitle></DialogHeader>
                <form onSubmit={createEvent} className="space-y-4 pt-2">
                  <div className="space-y-1">
                    <Label>Title *</Label>
                    <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Event title" />
                  </div>
                  <div className="space-y-1">
                    <Label>Description</Label>
                    <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="resize-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label>Date & Time *</Label>
                      <Input type="datetime-local" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                      <Label>Category</Label>
                      <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label>Location *</Label>
                    <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <Label>Map Link (optional)</Label>
                    <Input value={form.map_link} onChange={(e) => setForm({ ...form, map_link: e.target.value })} placeholder="https://maps.google.com/..." />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label>Ticket Limit *</Label>
                      <Input type="number" min={1} value={form.ticket_limit} onChange={(e) => setForm({ ...form, ticket_limit: Number(e.target.value) })} />
                    </div>
                    <div className="space-y-1">
                      <Label>Price ($) — 0 = Free</Label>
                      <Input type="number" min={0} value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label>Banner Image URL *</Label>
                    <Input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://..." />
                  </div>
                  {form.image && (
                    <img src={form.image} alt="preview" className="w-full h-28 object-cover rounded-xl" onError={(e) => (e.currentTarget.style.display = "none")} />
                  )}
                  <Button type="submit" variant="hero" className="w-full" disabled={submitting}>
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Event"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Plan status banner */}
        {!plan ? (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 p-5 flex items-center gap-4"
          >
            <AlertTriangle className="h-8 w-8 text-amber-500 shrink-0" />
            <div className="flex-1">
              <div className="font-bold text-amber-700 dark:text-amber-400">No Active Plan</div>
              <div className="text-sm text-amber-600 dark:text-amber-500">Purchase a plan to start creating events.</div>
            </div>
            <Button asChild variant="hero" size="sm">
              <Link to="/company/plans">Buy a Plan</Link>
            </Button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl glass p-5 flex items-center gap-4"
          >
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-primary shadow-glow shrink-0">
              <Crown className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <div className="font-bold">{planName} Plan — Active</div>
              <div className="text-sm text-muted-foreground">
                Expires {new Date(plan.expires_at).toLocaleDateString(undefined, { dateStyle: "long" })}
              </div>
              {eventLimit !== -1 && (
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{eventsUsed} of {eventLimit} events used</span>
                    <span>{usagePct}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${usagePct >= 100 ? "bg-destructive" : usagePct >= 80 ? "bg-amber-500" : "bg-gradient-primary"}`}
                      style={{ width: `${Math.min(usagePct, 100)}%` }}
                    />
                  </div>
                </div>
              )}
              {eventLimit === -1 && (
                <div className="flex items-center gap-1 text-xs text-emerald-500 mt-1">
                  <CheckCircle2 className="h-3 w-3" /> Unlimited events
                </div>
              )}
            </div>
            <Button asChild variant="outline" size="sm">
              <Link to="/company/plans">Upgrade</Link>
            </Button>
          </motion.div>
        )}

        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Calendar} label="My Events" value={stats.events} delay={0} />
          <StatCard icon={Ticket} label="Tickets Sold" value={stats.seats_sold} delay={0.05} />
          <StatCard icon={TrendingUp} label="Revenue" value={`$${stats.revenue}`} delay={0.1} />
          <StatCard icon={Users} label="Total Bookings" value={stats.bookings} delay={0.15} />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="events">
          <TabsList className="glass">
            <TabsTrigger value="events">My Events ({events.length})</TabsTrigger>
            <TabsTrigger value="bookings">Recent Bookings</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="events">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl glass p-6 shadow-card">
              {events.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-3 opacity-40" />
                  <p className="text-muted-foreground font-medium">No events yet.</p>
                  {canCreate ? (
                    <Button variant="hero" className="mt-4" onClick={() => setOpen(true)}>
                      <Plus className="h-4 w-4" /> Create your first event
                    </Button>
                  ) : (
                    <Button asChild variant="hero" className="mt-4">
                      <Link to="/company/plans">Purchase a Plan</Link>
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-auto">
                  {events.map((e) => {
                    const pct = Math.round((e.tickets_sold / e.ticket_limit) * 100);
                    return (
                      <div key={e.id} className="flex items-center gap-3 rounded-xl p-3 hover:bg-muted/60 transition-colors">
                        <img src={e.image} alt={e.title} className="h-14 w-14 rounded-lg object-cover shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold truncate">{e.title}</div>
                          <div className="text-xs text-muted-foreground">{e.category} · {new Date(e.date).toLocaleDateString()}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                              <div className="h-full bg-gradient-primary rounded-full" style={{ width: `${Math.min(pct, 100)}%` }} />
                            </div>
                            <span className="text-xs text-muted-foreground shrink-0">{e.tickets_sold}/{e.ticket_limit}</span>
                          </div>
                        </div>
                        <div className="text-sm font-bold shrink-0">
                          {e.price === 0 ? <span className="text-emerald-500">Free</span> : `$${e.price}`}
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" asChild>
                            <Link to={`/events/${e.id}`}><Edit2 className="h-4 w-4 text-muted-foreground" /></Link>
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => deleteEvent(e.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </TabsContent>

          <TabsContent value="bookings">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl glass p-6 shadow-card">
              {recentBookings.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No bookings yet.</p>
              ) : (
                <div className="space-y-2 max-h-[500px] overflow-auto">
                  {recentBookings.map((b) => (
                    <div key={b.id} className="rounded-xl p-4 bg-muted/40 space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="font-semibold text-sm">{b.event?.title}</div>
                        <Badge variant={b.status === "used" ? "default" : "secondary"} className={b.status === "used" ? "bg-emerald-500" : ""}>
                          {b.status}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground font-mono">{b.qr_code}</div>
                      <div className="text-xs text-muted-foreground">{new Date(b.created_at).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </TabsContent>

          <TabsContent value="analytics">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl glass p-6 shadow-card">
              <div className="flex items-center gap-2 mb-6">
                <BarChart3 className="h-5 w-5 text-primary" />
                <h3 className="font-bold text-lg">Event Performance</h3>
              </div>
              {events.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No events to analyze yet.</p>
              ) : (
                <div className="space-y-4">
                  {events.map((e) => {
                    const pct = Math.round((e.tickets_sold / e.ticket_limit) * 100);
                    const revenue = e.tickets_sold * e.price;
                    return (
                      <div key={e.id} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium truncate max-w-[60%]">{e.title}</span>
                          <span className="text-muted-foreground shrink-0">{e.tickets_sold} sold · ${revenue}</span>
                        </div>
                        <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(pct, 100)}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className={`h-full rounded-full ${pct >= 80 ? "bg-amber-500" : "bg-gradient-primary"}`}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{pct}% capacity</span>
                          <span>{e.ticket_limit - e.tickets_sold} seats remaining</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
