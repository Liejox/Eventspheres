import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  MessageSquare, ChevronDown, Send, Loader2,
  CheckCircle2, Clock, AlertCircle, HelpCircle,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api, type SupportTicket } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const FAQS = [
  {
    q: "How do I book a ticket?",
    a: "Browse events on the Events page, click on an event to view details, then click 'Book Ticket'. You'll go through a quick checkout flow and receive a QR-coded ticket instantly.",
  },
  {
    q: "Can I cancel or refund my ticket?",
    a: "Currently, tickets are non-refundable once booked. If you have a special circumstance, please raise a support ticket and our team will review your case.",
  },
  {
    q: "How do I access my ticket after booking?",
    a: "Your tickets are available in the Dashboard under 'My Tickets'. You can also download a PDF version for offline access.",
  },
  {
    q: "What happens if an event is cancelled?",
    a: "If an event is cancelled by the organizer, all ticket holders will be notified via email and refunds will be processed automatically within 5-7 business days.",
  },
  {
    q: "Can I book multiple tickets for the same event?",
    a: "Currently, each account can book one ticket per event to ensure fair access for all students. For group bookings, please contact support.",
  },
  {
    q: "How does the QR code work at entry?",
    a: "Show your QR code (from the app or PDF) to the event staff. They'll scan it using the Validate page. Each QR code can only be scanned once.",
  },
  {
    q: "I forgot my password. What do I do?",
    a: "On the login page, click 'Forgot password' and enter your registered email. You'll receive a reset link within a few minutes.",
  },
];

const STATUS_CONFIG = {
  open: { label: "Open", icon: Clock, color: "text-amber-500 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800" },
  in_progress: { label: "In Progress", icon: AlertCircle, color: "text-blue-500 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800" },
  resolved: { label: "Resolved", icon: CheckCircle2, color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800" },
};

export default function Support() {
  const { user } = useAuth();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [form, setForm] = useState({ name: user?.name || "", email: user?.email || "", subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [myTickets, setMyTickets] = useState<SupportTicket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLoadingTickets(true);
    api.mySupportTickets()
      .then(setMyTickets)
      .catch(() => {})
      .finally(() => setLoadingTickets(false));
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.message.trim()) {
      toast.error("Please fill in subject and message.");
      return;
    }
    if (!user) {
      toast.error("Please log in to raise a support ticket.");
      return;
    }
    setSubmitting(true);
    try {
      const ticket = await api.submitSupportTicket({ subject: form.subject, message: form.message });
      setMyTickets((prev) => [ticket, ...prev]);
      setForm((f) => ({ ...f, subject: "", message: "" }));
      toast.success("Support ticket raised! We'll get back to you soon.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to submit ticket");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen mesh-bg">
      <Navbar />
      <div className="container py-12 max-w-4xl space-y-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-sm font-medium mb-4">
            <HelpCircle className="h-4 w-4 text-primary" />
            Support Center
          </div>
          <h1 className="text-4xl md:text-5xl font-black">
            How can we <span className="gradient-text">help you?</span>
          </h1>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
            Browse our FAQ or raise a ticket and our team will get back to you within 24 hours.
          </p>
        </motion.div>

        {/* FAQ */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-2xl font-bold mb-5 flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-primary" /> Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-2xl glass overflow-hidden"
              >
                <button
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-muted/30 transition-colors"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="font-semibold pr-4">{faq.q}</span>
                  <motion.div
                    animate={{ rotate: openFaq === i ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="shrink-0"
                  >
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  </motion.div>
                </button>
                <motion.div
                  initial={false}
                  animate={{ height: openFaq === i ? "auto" : 0, opacity: openFaq === i ? 1 : 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5 text-muted-foreground leading-relaxed">{faq.a}</div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Raise a ticket */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold mb-5 flex items-center gap-2">
            <Send className="h-6 w-6 text-primary" /> Raise a Support Ticket
          </h2>
          <form onSubmit={handleSubmit} className="rounded-2xl glass p-6 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Your name</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="John Doe"
                  disabled={!!user}
                  className="h-11"
                />
              </div>
              <div className="space-y-1">
                <Label>Email address</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  disabled={!!user}
                  className="h-11"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Subject</Label>
              <Input
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                placeholder="Brief description of your issue"
                className="h-11"
              />
            </div>
            <div className="space-y-1">
              <Label>Message</Label>
              <Textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Describe your issue in detail..."
                rows={5}
                className="resize-none"
              />
            </div>
            {!user && (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                ⚠️ You need to be logged in to raise a support ticket.
              </p>
            )}
            <Button
              type="submit"
              variant="glow"
              size="lg"
              disabled={submitting || !user}
              className="w-full sm:w-auto"
            >
              {submitting ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</>
              ) : (
                <><Send className="h-4 w-4" /> Submit Ticket</>
              )}
            </Button>
          </form>
        </motion.section>

        {/* Previous tickets */}
        {user && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-2xl font-bold mb-5">My Previous Tickets</h2>
            {loadingTickets ? (
              <div className="grid place-items-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : myTickets.length === 0 ? (
              <div className="rounded-2xl glass p-10 text-center text-muted-foreground">
                <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-40" />
                <p>No support tickets yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {myTickets.map((ticket, i) => {
                  const cfg = STATUS_CONFIG[ticket.status];
                  const Icon = cfg.icon;
                  return (
                    <motion.div
                      key={ticket.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="rounded-2xl glass p-5 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-semibold">{ticket.subject}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {new Date(ticket.created_at).toLocaleDateString(undefined, { dateStyle: "medium" })}
                          </div>
                        </div>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.color}`}>
                          <Icon className="h-3 w-3" /> {cfg.label}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{ticket.message}</p>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.section>
        )}
      </div>
    </div>
  );
}
