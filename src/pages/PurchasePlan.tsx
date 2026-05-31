import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check, Loader2, CreditCard, Lock, AlertCircle,
  Zap, Star, Crown, ArrowRight, CheckCircle2,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, type Plan, type CompanyPlan } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const PLAN_ICONS = { Basic: Zap, Pro: Star, Premium: Crown };
const PLAN_GRADIENTS = {
  Basic:   "from-blue-500 to-cyan-500",
  Pro:     "from-violet-500 to-purple-600",
  Premium: "from-amber-500 to-orange-500",
};

function formatCard(val: string) {
  return val.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
}

export default function PurchasePlan() {
  const { user, refreshCompany } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentPlan, setCurrentPlan] = useState<CompanyPlan | null>(null);
  const [selected, setSelected] = useState<Plan | null>(null);
  const [step, setStep] = useState<"select" | "payment" | "success">("select");
  const [card, setCard] = useState({ number: "", expiry: "", cvv: "", name: "" });
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== "company") { navigate("/company/login"); return; }
    Promise.all([api.listPlans(), api.myPlan()])
      .then(([p, cp]) => { setPlans(p); setCurrentPlan(cp); })
      .finally(() => setLoading(false));
  }, [user, navigate]);

  const handleSelectPlan = (plan: Plan) => {
    setSelected(plan);
    setStep("payment");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    if (card.number.replace(/\s/g, "").length < 16) { setPayError("Enter a valid 16-digit card number."); return; }
    if (!card.expiry || !card.cvv || !card.name) { setPayError("Please fill in all payment fields."); return; }
    setPayError("");
    setPaying(true);
    try {
      // Simulate payment (cards ending 0000 = fail)
      await new Promise<void>((res, rej) =>
        setTimeout(() => {
          card.number.replace(/\s/g, "").endsWith("0000")
            ? rej(new Error("Card declined. Try another card."))
            : res();
        }, 1800)
      );
      await api.purchasePlan(selected.id);
      refreshCompany();
      setStep("success");
      toast.success(`${selected.name} plan activated! 🎉`);
    } catch (err) {
      setPayError(err instanceof Error ? err.message : "Payment failed");
    } finally {
      setPaying(false);
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

  return (
    <div className="min-h-screen mesh-bg">
      <Navbar />
      <div className="container py-12 max-w-5xl">
        <AnimatePresence mode="wait">
          {/* STEP 1: Plan selection */}
          {step === "select" && (
            <motion.div key="select" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="text-center mb-10">
                <h1 className="text-4xl md:text-5xl font-black">
                  Choose Your <span className="gradient-text">Plan</span>
                </h1>
                <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
                  Purchase a plan to start hosting events. Upgrade anytime.
                </p>
                {currentPlan && (
                  <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-sm font-medium">
                    <CheckCircle2 className="h-4 w-4" />
                    Current plan: <strong>{currentPlan.plan?.name}</strong> — expires {new Date(currentPlan.expires_at).toLocaleDateString()}
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {plans.map((plan, i) => {
                  const Icon = PLAN_ICONS[plan.name as keyof typeof PLAN_ICONS] || Zap;
                  const gradient = PLAN_GRADIENTS[plan.name as keyof typeof PLAN_GRADIENTS] || "from-primary to-secondary";
                  const isCurrent = currentPlan?.plan_id === plan.id;
                  const isPopular = plan.name === "Pro";

                  return (
                    <motion.div
                      key={plan.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      whileHover={{ y: -6 }}
                      className={`relative rounded-3xl overflow-hidden shadow-card hover:shadow-elevated transition-shadow ${
                        isPopular ? "ring-2 ring-primary" : "glass"
                      }`}
                    >
                      {isPopular && (
                        <div className="absolute top-0 left-0 right-0 bg-gradient-primary text-primary-foreground text-xs font-bold text-center py-1.5 tracking-widest uppercase">
                          Most Popular
                        </div>
                      )}
                      <div className={`bg-gradient-to-br ${gradient} p-6 text-white ${isPopular ? "pt-10" : ""}`}>
                        <div className="flex items-center gap-3">
                          <div className="grid h-12 w-12 place-items-center rounded-xl bg-white/20">
                            <Icon className="h-6 w-6" />
                          </div>
                          <div>
                            <div className="font-black text-xl">{plan.name}</div>
                            <div className="text-white/80 text-sm">{plan.description}</div>
                          </div>
                        </div>
                        <div className="mt-4">
                          <span className="text-4xl font-black">${plan.price}</span>
                          <span className="text-white/70 text-sm"> / 90 days</span>
                        </div>
                      </div>

                      <div className="p-6 space-y-4 bg-card">
                        <ul className="space-y-2">
                          {plan.features.map((f) => (
                            <li key={f} className="flex items-center gap-2 text-sm">
                              <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                              {f}
                            </li>
                          ))}
                        </ul>
                        <Button
                          variant={isCurrent ? "outline" : "hero"}
                          className="w-full"
                          onClick={() => handleSelectPlan(plan)}
                          disabled={isCurrent}
                        >
                          {isCurrent ? "Current Plan" : <>Get {plan.name} <ArrowRight className="h-4 w-4" /></>}
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* STEP 2: Payment */}
          {step === "payment" && selected && (
            <motion.div key="payment" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="max-w-lg mx-auto space-y-6">
              <div className="text-center">
                <h2 className="text-3xl font-black">Complete Payment</h2>
                <p className="text-muted-foreground mt-1">Activate your {selected.name} plan</p>
              </div>

              {/* Order summary */}
              <div className={`rounded-2xl bg-gradient-to-br ${PLAN_GRADIENTS[selected.name as keyof typeof PLAN_GRADIENTS] || "from-primary to-secondary"} p-5 text-white`}>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-white/80 text-sm">Plan</div>
                    <div className="text-2xl font-black">{selected.name}</div>
                    <div className="text-white/80 text-sm mt-1">Valid for 90 days</div>
                  </div>
                  <div className="text-right">
                    <div className="text-white/80 text-sm">Total</div>
                    <div className="text-3xl font-black">${selected.price}</div>
                  </div>
                </div>
              </div>

              {/* Demo notice */}
              <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 p-4 flex gap-3">
                <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="text-sm text-amber-700 dark:text-amber-400">
                  <strong>Demo mode:</strong> No real payment. Use any card. Cards ending in{" "}
                  <code className="font-mono bg-amber-100 dark:bg-amber-900 px-1 rounded">0000</code> will be declined.
                </div>
              </div>

              <form onSubmit={handlePayment} className="rounded-2xl glass p-6 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <span className="font-bold">Payment Details</span>
                  <Lock className="h-4 w-4 text-muted-foreground ml-auto" />
                  <span className="text-xs text-muted-foreground">Secure</span>
                </div>

                <div className="space-y-1">
                  <Label>Cardholder Name</Label>
                  <Input placeholder="John Doe" value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} className="h-11" />
                </div>
                <div className="space-y-1">
                  <Label>Card Number</Label>
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
                    <Label>Expiry</Label>
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

                <Button type="submit" variant="glow" size="lg" className="w-full" disabled={paying}>
                  {paying ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</>
                  ) : (
                    <><Lock className="h-4 w-4" /> Pay ${selected.price}</>
                  )}
                </Button>
              </form>

              <Button variant="ghost" className="w-full" onClick={() => setStep("select")}>
                ← Back to plans
              </Button>
            </motion.div>
          )}

          {/* STEP 3: Success */}
          {step === "success" && selected && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="max-w-lg mx-auto text-center space-y-6"
            >
              <div className="rounded-3xl bg-gradient-hero p-10 text-primary-foreground shadow-elevated">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                  className="grid h-24 w-24 place-items-center rounded-full bg-white/20 mx-auto mb-4"
                >
                  <CheckCircle2 className="h-12 w-12" />
                </motion.div>
                <h2 className="text-3xl font-black">Plan Activated! 🎉</h2>
                <p className="opacity-90 mt-2">Your {selected.name} plan is now active.</p>
                <div className="mt-4 rounded-2xl bg-white/10 p-4 text-left space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="opacity-80">Plan</span>
                    <span className="font-bold">{selected.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="opacity-80">Events allowed</span>
                    <span className="font-bold">{selected.event_limit === -1 ? "Unlimited" : selected.event_limit}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="opacity-80">Valid for</span>
                    <span className="font-bold">90 days</span>
                  </div>
                </div>
              </div>

              <Button variant="glow" size="lg" className="w-full" onClick={() => navigate("/company/dashboard")}>
                Go to Dashboard <ArrowRight className="h-5 w-5" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
