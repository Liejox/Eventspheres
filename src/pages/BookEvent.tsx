import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar, MapPin, Users, Loader2, Download, PartyPopper,
  ArrowLeft, CreditCard, Lock, CheckCircle2, AlertCircle,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, type EventItem, type Booking } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { generateQrDataUrl, generateTicketPdf, downloadPdf } from "@/lib/ticket";

type Step = "details" | "payment" | "confirmation";

// Simulates a payment: 90% success, 10% failure for demo realism
function simulatePayment(cardNumber: string): Promise<{ success: boolean; message: string }> {
  return new Promise((resolve) =>
    setTimeout(() => {
      if (cardNumber.replace(/\s/g, "").endsWith("0000")) {
        resolve({ success: false, message: "Card declined. Please try another card." });
      } else {
        resolve({ success: true, message: "Payment successful!" });
      }
    }, 1800)
  );
}

function formatCard(val: string) {
  return val.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
}

export default function BookEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<Step>("details");
  const [booking, setBooking] = useState<Booking | null>(null);
  const [qrUrl, setQrUrl] = useState<string>("");

  // Payment form state
  const [card, setCard] = useState({ number: "", expiry: "", cvv: "", name: "" });
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState("");

  useEffect(() => {
    if (!id) return;
    api.getEvent(id)
      .then(setEvent)
      .catch((e) => { toast.error(e.message); navigate("/events"); })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleProceedToPayment = () => {
    if (!user) { navigate("/login"); return; }
    setStep("payment");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event || !user) return;
    if (card.number.replace(/\s/g, "").length < 16) {
      setPayError("Enter a valid 16-digit card number."); return;
    }
    if (!card.expiry || !card.cvv || !card.name) {
      setPayError("Please fill in all payment fields."); return;
    }
    setPayError("");
    setPaying(true);
    try {
      const result = await simulatePayment(card.number);
      if (!result.success) {
        setPayError(result.message);
        setPaying(false);
        return;
      }
      const b = await api.bookEvent(event.id);
      const qr = await generateQrDataUrl(b.qr_code);
      setQrUrl(qr);
      setBooking(b);
      setStep("confirmation");
      toast.success("Booking confirmed! 🎉");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setPayError(err instanceof Error ? err.message : "Booking failed");
    } finally {
      setPaying(false);
    }
  };

  const handleDownload = async () => {
    if (!booking) return;
    const pdf = await generateTicketPdf(booking);
    downloadPdf(pdf, `ticket-${booking.id}.pdf`);
    toast.success("PDF downloaded");
  };

  if (loading || !event) {
    return (
      <div className="min-h-screen mesh-bg">
        <Navbar />
        <div className="grid place-items-center py-32">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  const remaining = event.ticket_limit - event.tickets_sold;
  const date = new Date(event.date);

  return (
    <div className="min-h-screen mesh-bg">
      <Navbar />
      <div className="container py-10 max-w-3xl">
        <Button variant="ghost" size="sm" onClick={() => navigate(`/events/${event.id}`)} className="mb-6">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {(["details", "payment", "confirmation"] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-all ${
                step === s ? "bg-gradient-primary text-white shadow-glow" :
                (["details", "payment", "confirmation"].indexOf(step) > i)
                  ? "bg-emerald-500 text-white"
                  : "bg-muted text-muted-foreground"
              }`}>
                {(["details", "payment", "confirmation"].indexOf(step) > i) ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
              </div>
              <span className={`text-sm font-medium capitalize hidden sm:inline ${step === s ? "text-foreground" : "text-muted-foreground"}`}>{s}</span>
              {i < 2 && <div className="h-px w-8 bg-border" />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* STEP 1: Event Details */}
          {step === "details" && (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <div className="rounded-3xl overflow-hidden shadow-elevated">
                <img src={event.image} alt={event.title} className="w-full h-64 object-cover" />
              </div>

              <div className="rounded-2xl glass p-6 space-y-4">
                <div>
                  <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                    {event.category}
                  </span>
                  <h1 className="text-3xl font-black mt-2">{event.title}</h1>
                  <p className="text-muted-foreground mt-2 leading-relaxed">{event.description}</p>
                </div>

                <div className="grid sm:grid-cols-3 gap-3 pt-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-primary shrink-0" />
                    <span>{date.toLocaleDateString(undefined, { dateStyle: "medium" })}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-primary shrink-0" />
                    <span className="truncate">{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-primary shrink-0" />
                    <span>{remaining} seats left</span>
                  </div>
                </div>

                <div className="border-t pt-4 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-muted-foreground">Ticket price</div>
                    <div className="text-2xl font-black">
                      {event.price === 0 ? <span className="text-emerald-500">FREE</span> : <span className="gradient-text">${event.price}</span>}
                    </div>
                  </div>
                  <Button
                    variant="glow"
                    size="lg"
                    onClick={handleProceedToPayment}
                    disabled={remaining <= 0}
                    className="animate-pulse-glow"
                  >
                    {remaining <= 0 ? "Sold Out" : event.price === 0 ? "Register Free" : "Proceed to Payment"}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Payment */}
          {step === "payment" && (
            <motion.div
              key="payment"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Order summary */}
              <div className="rounded-2xl glass p-5 flex items-center gap-4">
                <img src={event.image} alt={event.title} className="h-16 w-16 rounded-xl object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-bold truncate">{event.title}</div>
                  <div className="text-sm text-muted-foreground">{date.toLocaleDateString(undefined, { dateStyle: "medium" })} · {event.location}</div>
                </div>
                <div className="text-xl font-black shrink-0">
                  {event.price === 0 ? <span className="text-emerald-500">FREE</span> : `$${event.price}`}
                </div>
              </div>

              {/* Demo notice */}
              <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 p-4 flex gap-3">
                <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="text-sm text-amber-700 dark:text-amber-400">
                  <strong>Demo mode:</strong> No real payment is processed. Use any card number.
                  To simulate a failure, end the card number with <code className="font-mono bg-amber-100 dark:bg-amber-900 px-1 rounded">0000</code>.
                </div>
              </div>

              {/* Payment form */}
              <form onSubmit={handlePayment} className="rounded-2xl glass p-6 space-y-5">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <h2 className="font-bold text-lg">Payment details</h2>
                  <Lock className="h-4 w-4 text-muted-foreground ml-auto" />
                  <span className="text-xs text-muted-foreground">Secure</span>
                </div>

                <div className="space-y-1">
                  <Label>Cardholder name</Label>
                  <Input
                    placeholder="John Doe"
                    value={card.name}
                    onChange={(e) => setCard({ ...card, name: e.target.value })}
                    className="h-11"
                  />
                </div>

                <div className="space-y-1">
                  <Label>Card number</Label>
                  <Input
                    placeholder="1234 5678 9012 3456"
                    value={card.number}
                    onChange={(e) => setCard({ ...card, number: formatCard(e.target.value) })}
                    className="h-11 font-mono tracking-widest"
                    maxLength={19}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label>Expiry date</Label>
                    <Input
                      placeholder="MM/YY"
                      value={card.expiry}
                      onChange={(e) => {
                        let v = e.target.value.replace(/\D/g, "").slice(0, 4);
                        if (v.length >= 3) v = v.slice(0, 2) + "/" + v.slice(2);
                        setCard({ ...card, expiry: v });
                      }}
                      className="h-11"
                      maxLength={5}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>CVV</Label>
                    <Input
                      placeholder="123"
                      value={card.cvv}
                      onChange={(e) => setCard({ ...card, cvv: e.target.value.replace(/\D/g, "").slice(0, 3) })}
                      className="h-11"
                      maxLength={3}
                      type="password"
                    />
                  </div>
                </div>

                {payError && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive"
                  >
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {payError}
                  </motion.div>
                )}

                <div className="border-t pt-4 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-muted-foreground">Total</div>
                    <div className="text-2xl font-black">
                      {event.price === 0 ? <span className="text-emerald-500">FREE</span> : `$${event.price}`}
                    </div>
                  </div>
                  <Button type="submit" variant="glow" size="lg" disabled={paying} className="min-w-36">
                    {paying ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</>
                    ) : (
                      <><Lock className="h-4 w-4" /> {event.price === 0 ? "Confirm" : `Pay $${event.price}`}</>
                    )}
                  </Button>
                </div>
              </form>

              <Button variant="ghost" size="sm" onClick={() => setStep("details")} className="w-full">
                ← Back to event details
              </Button>
            </motion.div>
          )}

          {/* STEP 3: Confirmation */}
          {step === "confirmation" && booking && (
            <motion.div
              key="confirmation"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="space-y-6"
            >
              {/* Success banner */}
              <div className="rounded-3xl bg-gradient-hero p-8 text-primary-foreground shadow-elevated text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                  className="grid h-20 w-20 place-items-center rounded-full bg-white/20 mx-auto mb-4"
                >
                  <PartyPopper className="h-10 w-10" />
                </motion.div>
                <h2 className="text-3xl font-black">You're in! 🎉</h2>
                <p className="opacity-90 mt-2">Your ticket has been confirmed. See you there!</p>
              </div>

              {/* Ticket card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="rounded-2xl glass shadow-elevated overflow-hidden"
              >
                {/* Ticket header */}
                <div className="bg-gradient-primary p-5 text-primary-foreground">
                  <div className="text-xs uppercase tracking-widest opacity-80">Student Event Portal · E-Ticket</div>
                  <div className="text-2xl font-black mt-1">{event.title}</div>
                </div>

                {/* Ticket body */}
                <div className="p-6 grid md:grid-cols-[1fr_auto] gap-6 items-center">
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wide">Date</div>
                        <div className="font-semibold">{date.toLocaleDateString(undefined, { dateStyle: "long" })}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wide">Time</div>
                        <div className="font-semibold">{date.toLocaleTimeString(undefined, { timeStyle: "short" })}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wide">Venue</div>
                        <div className="font-semibold">{event.location}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wide">Attendee</div>
                        <div className="font-semibold">{booking.event ? (booking as any).user_name || "You" : "You"}</div>
                      </div>
                    </div>
                    <div className="border-t pt-3">
                      <div className="text-xs text-muted-foreground uppercase tracking-wide">Booking ID</div>
                      <div className="font-mono text-sm font-semibold">{booking.id}</div>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <Button variant="glow" onClick={handleDownload}>
                        <Download className="h-4 w-4" /> Download PDF
                      </Button>
                      <Button variant="outline" onClick={() => navigate("/dashboard")}>
                        My Tickets
                      </Button>
                    </div>
                  </div>

                  {qrUrl && (
                    <motion.div
                      initial={{ scale: 0, rotate: -10 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.5, type: "spring" }}
                      className="flex flex-col items-center gap-2"
                    >
                      <img src={qrUrl} alt="QR Code" className="h-44 w-44 rounded-2xl bg-white p-3 shadow-glow" />
                      <span className="text-xs text-muted-foreground">Scan at entry</span>
                    </motion.div>
                  )}
                </div>

                {/* Ticket footer */}
                <div className="bg-muted/40 px-6 py-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Status: <span className="text-emerald-500 font-semibold">Active</span></span>
                  <span className="font-mono">{booking.qr_code}</span>
                </div>
              </motion.div>

              <Button variant="ghost" className="w-full" onClick={() => navigate("/events")}>
                Browse more events
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
