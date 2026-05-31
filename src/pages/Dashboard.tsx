import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar, Download, Loader2, Ticket, Users, TrendingUp,
  Plus, Trash2, MessageSquare, DollarSign, Clock, CheckCircle2,
  AlertCircle, Building2, Crown, ShieldCheck, ShieldX, Send,
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
import { api, type Booking, type Company, type CompanyPlan, type EventItem, type SupportTicket } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { generateTicketPdf, downloadPdf, generateQrDataUrl } from "@/lib/ticket";
import { toast } from "sonner";

const CATEGORIES = ["Tech", "Workshop", "Music", "Business", "Art", "Sports", "Other"];

const STATUS_CFG = {
  open:        { label: "Open",        icon: Clock,         color: "text-amber-500" },
  in_progress: { label: "In Progress", icon: AlertCircle,   color: "text-blue-500" },
  resolved:    { label: "Resolved",    icon: CheckCircle2,  color: "text-emerald-500" },
};

export default function Dashboard() {
  const { user } = useAuth();
  if (!user) return null;
  if (user.role === "admin")   return <AdminDashboard />;
  if (user.role === "company") {
    // Redirect company users to their own dashboard
    window.location.replace("/company/dashboard");
    return null;
  }
  return <UserDashboard />;
}

// ── Shared stat card ──────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, delay = 0, gradient = false }: {
  icon: React.ElementType; label: string; value: string | number; delay?: number; gradient?: boolean;
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
          <div className={`text-3xl font-black mt-1 ${gradient ? "gradient-text" : ""}`}>{value}</div>
        </div>
        <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-primary shadow-glow">
          <Icon className="h-6 w-6 text-primary-foreground" />
        </div>
      </div>
    </motion.div>
  );
}

// ── Admin Dashboard ───────────────────────────────────────────────────────────
function AdminDashboard() {
  const [stats, setStats]           = useState({ users: 0, events: 0, bookings: 0, revenue: 0, companies: 0 });
  const [recent, setRecent]         = useState<Booking[]>([]);
  const [events, setEvents]         = useState<EventItem[]>([]);
  const [companies, setCompanies]   = useState<Company[]>([]);
  const [planPurchases, setPlanPurchases] = useState<CompanyPlan[]>([]);
  const [support, setSupport]       = useState<SupportTicket[]>([]);
  const [loading, setLoading]       = useState(true);
  const [open, setOpen]             = useState(false);
  const [replyTicket, setReplyTicket] = useState<SupportTicket | null>(null);
  const [replyText, setReplyText]   = useState("");
  const [form, setForm] = useState({
    title: "", description: "", date: "", location: "", map_link: "",
    ticket_limit: 100, image: "", category: "Tech", price: 0,
  });

  const refresh = async () => {
    const [d, ev, cos, pps, sup] = await Promise.all([
      api.dashboard(),
      api.listEvents(),
      api.adminListCompanies(),
      api.adminListPlanPurchases(),
      api.allSupportTickets(),
    ]);
    setStats(d.stats);
    setRecent(d.recent_bookings);
    setEvents(ev);
    setCompanies(cos);
    setPlanPurchases(pps);
    setSupport(sup);
  };

  useEffect(() => { refresh().finally(() => setLoading(false)); }, []);

  const createEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.date || !form.location || !form.image) {
      toast.error("Fill all required fields"); return;
    }
    try {
      // Admin creates events without company ownership
      await api.createEvent({ ...form, company_id: undefined, company_name: "Admin" } as any);
      toast.success("Event created!");
      setOpen(false);
      setForm({ title: "", description: "", date: "", location: "", map_link: "", ticket_limit: 100, image: "", category: "Tech", price: 0 });
      refresh();
    } catch (err) { toast.error(err instanceof Error ? err.message : "Failed"); }
  };

  const toggleCompanyStatus = async (co: Company) => {
    const newStatus = co.status === "blocked" ? "active" : "blocked";
    await api.adminUpdateCompany(co.id, { status: newStatus });
    toast.success(`Company ${newStatus === "blocked" ? "blocked" : "unblocked"}`);
    refresh();
  };

  const sendReply = async () => {
    if (!replyTicket || !replyText.trim()) return;
    await api.updateSupportTicket(replyTicket.id, { status: "resolved", admin_reply: replyText });
    toast.success("Reply sent");
    setReplyTicket(null);
    setReplyText("");
    refresh();
  };

  const openTickets = support.filter((t) => t.status === "open").length;

  if (loading) return (
    <div className="min-h-screen mesh-bg">
      <Navbar />
      <div className="grid place-items-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
    </div>
  );

  return (
    <div className="min-h-screen mesh-bg">
      <Navbar />
      <div className="container py-10 space-y-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-black">Super Admin <span className="gradient-text">Panel</span></h1>
            <p className="text-muted-foreground mt-1">Full platform oversight.</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="hero" size="lg"><Plus className="h-4 w-4" /> New Event</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Create Event (Admin)</DialogTitle></DialogHeader>
              <form onSubmit={createEvent} className="space-y-4 pt-2">
                <div className="space-y-1"><Label>Title *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
                <div className="space-y-1"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="resize-none" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1"><Label>Date & Time *</Label><Input type="datetime-local" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
                  <div className="space-y-1">
                    <Label>Category</Label>
                    <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1"><Label>Location *</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
                <div className="space-y-1"><Label>Map Link</Label><Input value={form.map_link} onChange={(e) => setForm({ ...form, map_link: e.target.value })} placeholder="https://maps.google.com/..." /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1"><Label>Ticket Limit *</Label><Input type="number" min={1} value={form.ticket_limit} onChange={(e) => setForm({ ...form, ticket_limit: Number(e.target.value) })} /></div>
                  <div className="space-y-1"><Label>Price ($)</Label><Input type="number" min={0} value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} /></div>
                </div>
                <div className="space-y-1"><Label>Banner Image URL *</Label><Input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://..." /></div>
                {form.image && <img src={form.image} alt="preview" className="w-full h-28 object-cover rounded-xl" onError={(e) => (e.currentTarget.style.display = "none")} />}
                <Button type="submit" variant="hero" className="w-full">Create</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard icon={Users}     label="Users"     value={stats.users}     delay={0} />
          <StatCard icon={Building2} label="Companies" value={stats.companies} delay={0.04} />
          <StatCard icon={Calendar}  label="Events"    value={stats.events}    delay={0.08} />
          <StatCard icon={Ticket}    label="Bookings"  value={stats.bookings}  delay={0.12} />
          <StatCard icon={DollarSign} label="Revenue"  value={`$${stats.revenue}`} delay={0.16} gradient />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="companies">
          <TabsList className="glass flex-wrap h-auto gap-1">
            <TabsTrigger value="companies">Companies ({companies.length})</TabsTrigger>
            <TabsTrigger value="plans">Plan Purchases ({planPurchases.length})</TabsTrigger>
            <TabsTrigger value="events">Events ({events.length})</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="support" className="relative">
              Support
              {openTickets > 0 && (
                <span className="ml-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground text-xs font-bold">
                  {openTickets}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Companies */}
          <TabsContent value="companies">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl glass p-6 shadow-card space-y-3">
              {companies.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No companies registered yet.</p>
              ) : companies.map((co) => (
                <div key={co.id} className="flex items-center gap-3 rounded-xl p-4 bg-muted/40">
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-primary/10 shrink-0">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold">{co.name}</div>
                    <div className="text-xs text-muted-foreground">{co.email}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        <Crown className="h-3 w-3 mr-1" />
                        {co.plan_id ? co.plan_id.replace("plan_", "").toUpperCase() : "No Plan"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{co.events_created} events</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge className={co.status === "active" ? "bg-emerald-500 text-white" : co.status === "blocked" ? "bg-destructive text-white" : "bg-amber-500 text-white"}>
                      {co.status}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleCompanyStatus(co)}
                      title={co.status === "blocked" ? "Unblock" : "Block"}
                    >
                      {co.status === "blocked"
                        ? <ShieldCheck className="h-4 w-4 text-emerald-500" />
                        : <ShieldX className="h-4 w-4 text-destructive" />}
                    </Button>
                  </div>
                </div>
              ))}
            </motion.div>
          </TabsContent>

          {/* Plan Purchases */}
          <TabsContent value="plans">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl glass p-6 shadow-card space-y-3">
              {planPurchases.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No plan purchases yet.</p>
              ) : planPurchases.map((pp) => {
                const co = companies.find((c) => c.id === pp.company_id);
                return (
                  <div key={pp.id} className="flex items-center gap-3 rounded-xl p-4 bg-muted/40">
                    <div className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-primary/10 shrink-0">
                      <Crown className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold">{co?.name || pp.company_id}</div>
                      <div className="text-xs text-muted-foreground">
                        {pp.plan?.name} Plan · ${pp.plan?.price} · Purchased {new Date(pp.purchased_at).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Expires {new Date(pp.expires_at).toLocaleDateString()}
                      </div>
                    </div>
                    <Badge className={pp.status === "active" ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"}>
                      {pp.status}
                    </Badge>
                  </div>
                );
              })}
            </motion.div>
          </TabsContent>

          {/* Events */}
          <TabsContent value="events">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl glass p-6 shadow-card">
              <div className="space-y-2 max-h-[500px] overflow-auto">
                {events.map((e) => {
                  const pct = Math.round((e.tickets_sold / e.ticket_limit) * 100);
                  return (
                    <div key={e.id} className="flex items-center gap-3 rounded-xl p-3 hover:bg-muted/60 transition-colors">
                      <img src={e.image} alt={e.title} className="h-14 w-14 rounded-lg object-cover shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold truncate">{e.title}</div>
                        <div className="text-xs text-muted-foreground">{e.company_name || "Admin"} · {e.category}</div>
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
                      <Button variant="ghost" size="icon" onClick={() => api.deleteEvent(e.id).then(() => { toast.success("Deleted"); refresh(); })}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </TabsContent>

          {/* Bookings */}
          <TabsContent value="bookings">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl glass p-6 shadow-card">
              {recent.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No bookings yet.</p>
              ) : (
                <div className="space-y-2 max-h-[500px] overflow-auto">
                  {recent.map((b) => (
                    <div key={b.id} className="rounded-xl p-4 bg-muted/40 space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="font-semibold text-sm">{b.event?.title}</div>
                        <Badge className={b.status === "used" ? "bg-emerald-500 text-white" : ""}>{b.status}</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground font-mono">{b.qr_code}</div>
                      <div className="text-xs text-muted-foreground">{new Date(b.created_at).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </TabsContent>

          {/* Support */}
          <TabsContent value="support">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl glass p-6 shadow-card space-y-3">
              {support.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-10 w-10 mx-auto text-muted-foreground mb-3 opacity-40" />
                  <p className="text-muted-foreground">No support tickets yet.</p>
                </div>
              ) : support.map((t) => {
                const cfg = STATUS_CFG[t.status];
                const Icon = cfg.icon;
                return (
                  <div key={t.id} className="rounded-xl p-4 bg-muted/40 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold text-sm">{t.subject}</div>
                        <div className="text-xs text-muted-foreground">{t.user_name} · {t.user_email}</div>
                      </div>
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold shrink-0 ${cfg.color}`}>
                        <Icon className="h-3 w-3" /> {cfg.label}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{t.message}</p>
                    {t.admin_reply && (
                      <div className="rounded-lg bg-primary/5 border border-primary/10 p-3 text-sm">
                        <span className="font-semibold text-primary">Admin reply: </span>{t.admin_reply}
                      </div>
                    )}
                    {t.status !== "resolved" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => { setReplyTicket(t); setReplyText(""); }}
                      >
                        <Send className="h-3.5 w-3.5" /> Reply & Resolve
                      </Button>
                    )}
                  </div>
                );
              })}
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Reply dialog */}
      <Dialog open={!!replyTicket} onOpenChange={(o) => !o && setReplyTicket(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reply to Support Ticket</DialogTitle></DialogHeader>
          {replyTicket && (
            <div className="space-y-4">
              <div className="rounded-xl bg-muted/40 p-4 text-sm">
                <div className="font-semibold">{replyTicket.subject}</div>
                <p className="text-muted-foreground mt-1">{replyTicket.message}</p>
              </div>
              <div className="space-y-1">
                <Label>Your Reply</Label>
                <Textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} rows={4} placeholder="Type your reply..." className="resize-none" />
              </div>
              <Button variant="hero" className="w-full" onClick={sendReply} disabled={!replyText.trim()}>
                <Send className="h-4 w-4" /> Send Reply & Mark Resolved
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── User Dashboard ────────────────────────────────────────────────────────────
function UserDashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [qrMap, setQrMap] = useState<Record<string, string>>({});

  useEffect(() => {
    api.myBookings().then(async (bs) => {
      setBookings(bs);
      const entries = await Promise.all(bs.map(async (b) => [b.id, await generateQrDataUrl(b.qr_code)] as const));
      setQrMap(Object.fromEntries(entries));
    }).finally(() => setLoading(false));
  }, []);

  const downloadTicket = async (b: Booking) => {
    const pdf = await generateTicketPdf(b);
    downloadPdf(pdf, `ticket-${b.id}.pdf`);
    toast.success("PDF downloaded");
  };

  if (loading) return (
    <div className="min-h-screen mesh-bg">
      <Navbar />
      <div className="grid place-items-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
    </div>
  );

  return (
    <div className="min-h-screen mesh-bg">
      <Navbar />
      <div className="container py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-black">My <span className="gradient-text">Tickets</span></h1>
          <p className="text-muted-foreground mt-1">
            Hey {user?.name.split(" ")[0]}! You have {bookings.length} booking{bookings.length !== 1 ? "s" : ""}.
          </p>
        </motion.div>

        {bookings.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mt-4 text-center py-20 rounded-3xl glass">
            <Ticket className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-40" />
            <h3 className="text-xl font-bold">No tickets yet</h3>
            <p className="text-muted-foreground mt-2">Browse events and book your first ticket!</p>
            <Button asChild variant="hero" className="mt-6"><a href="/events">Browse Events</a></Button>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 gap-5">
            {bookings.map((b, i) => (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="rounded-2xl overflow-hidden shadow-elevated"
              >
                <div className="bg-gradient-hero p-5 text-primary-foreground">
                  <div className="text-xs uppercase tracking-widest opacity-80">{b.event?.category} · E-Ticket</div>
                  <div className="text-xl font-black mt-1 truncate">{b.event?.title}</div>
                  {b.event?.company_name && (
                    <div className="text-xs opacity-70 mt-0.5">by {b.event.company_name}</div>
                  )}
                </div>
                <div className="glass p-5 flex items-center gap-4">
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Date: </span>
                      <span className="font-medium">{b.event && new Date(b.event.date).toLocaleDateString(undefined, { dateStyle: "medium" })}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Venue: </span>
                      <span className="font-medium truncate">{b.event?.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        b.status === "used"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : "bg-primary/10 text-primary"
                      }`}>
                        {b.status === "used" ? <><CheckCircle2 className="h-3 w-3" /> Used</> : <><Ticket className="h-3 w-3" /> Active</>}
                      </span>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => downloadTicket(b)} className="mt-1">
                      <Download className="h-3.5 w-3.5" /> Download PDF
                    </Button>
                  </div>
                  {qrMap[b.id] && (
                    <img src={qrMap[b.id]} alt="QR" className="h-28 w-28 rounded-xl bg-white p-2 shrink-0" />
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
