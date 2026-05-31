import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowRight, Sparkles, Ticket, ShieldCheck, QrCode, Zap,
  Building2, Globe, Star,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/brand";

const features = [
  { icon: Ticket,     title: "One-tap booking",    desc: "Reserve your spot in seconds. No more endless forms or queues." },
  { icon: QrCode,     title: "QR-coded tickets",   desc: "Unique, secure QR for every ticket. Scan & enter instantly." },
  { icon: ShieldCheck,title: "Anti-overbooking",   desc: "Real-time seat limits so every booking is guaranteed." },
  { icon: Zap,        title: "Instant PDF ticket", desc: "Beautiful tickets generated and downloaded on the spot." },
];

const stats = [
  { value: "50+", label: "Live events" },
  { value: "10K+", label: "Tickets booked" },
  { value: "100%", label: "Free signup" },
];

const forWhom = [
  {
    icon: Ticket,
    title: "For Attendees",
    desc: "Browse events, book tickets in seconds, and carry your QR pass right in your pocket.",
    cta: "Browse Events",
    href: "/events",
  },
  {
    icon: Building2,
    title: "For Organizers",
    desc: "Register your company, pick a plan, and start selling tickets to your events today.",
    cta: "Register Company",
    href: "/company/register",
  },
  {
    icon: Globe,
    title: "For Admins",
    desc: "Full platform oversight — approve events, manage companies, and monitor revenue.",
    cta: "Admin Login",
    href: "/login",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen mesh-bg flex flex-col">
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden flex-1">
        <div className="container relative pt-20 pb-28 md:pt-28 md:pb-40">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center space-y-7"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-sm font-medium"
            >
              <Sparkles className="h-4 w-4 text-primary" />
              The modern event ticketing platform
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-black leading-[1.05] tracking-tight">
              Your world of <br className="hidden md:block" />
              <span className="gradient-text">events starts here</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              {BRAND.description}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Button asChild size="xl" variant="glow" className="animate-pulse-glow">
                <Link to="/events">Browse events <ArrowRight className="h-5 w-5" /></Link>
              </Button>
              <Button asChild size="xl" variant="glass">
                <Link to="/register">Create account</Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-center gap-8 pt-6 text-sm text-muted-foreground">
              {stats.map((s, i) => (
                <div key={s.label} className="flex items-center gap-8">
                  {i > 0 && <div className="h-6 w-px bg-border" />}
                  <div>
                    <span className="font-bold text-foreground text-lg">{s.value}</span>{" "}
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Floating ticket mock */}
          <motion.div
            initial={{ opacity: 0, y: 60, rotate: -8 }}
            animate={{ opacity: 1, y: 0, rotate: -6 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="hidden lg:block absolute right-8 top-32 w-72 animate-float"
          >
            <div className="rounded-3xl bg-gradient-hero p-6 shadow-elevated text-primary-foreground">
              <div className="text-xs uppercase tracking-widest opacity-80">VIP Pass</div>
              <div className="text-2xl font-bold mt-1">Tech Fest 2025</div>
              <div className="text-sm opacity-90 mt-1">Nov 22 · 10:00 AM</div>
              <div className="mt-4 text-xs opacity-70 flex items-center gap-1">
                <Star className="h-3 w-3 fill-current" /> Powered by EventSphere
              </div>
              <div className="mt-4 grid place-items-center rounded-2xl bg-white/95 p-4">
                <div className="grid grid-cols-8 gap-0.5">
                  {Array.from({ length: 64 }).map((_, i) => (
                    <div key={i} className={`h-2 w-2 rounded-sm ${Math.random() > 0.5 ? "bg-foreground" : "bg-transparent"}`} />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FOR WHOM ─────────────────────────────────────────── */}
      <section className="container pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold">Built for everyone</h2>
          <p className="text-muted-foreground mt-3">Whether you're attending, organizing, or managing — EventSphere has you covered.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {forWhom.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className="rounded-2xl glass p-6 shadow-card flex flex-col gap-4"
            >
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-primary shadow-glow">
                <item.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-bold text-lg">{item.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
              </div>
              <Button asChild variant="outline" size="sm" className="mt-auto w-fit">
                <Link to={item.href}>{item.cta} <ArrowRight className="h-3.5 w-3.5" /></Link>
              </Button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────── */}
      <section className="container pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold">Everything you need, nothing you don't</h2>
          <p className="text-muted-foreground mt-3">Lean. Fast. Built for the way people actually move.</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className="rounded-2xl glass p-6 shadow-card"
            >
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-primary shadow-glow">
                <f.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="mt-4 font-bold text-lg">{f.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="container pb-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="rounded-3xl bg-gradient-hero p-10 md:p-16 text-center text-primary-foreground shadow-elevated relative overflow-hidden"
        >
          <div
            className="absolute inset-0 opacity-20"
            style={{ backgroundImage: "radial-gradient(circle at 30% 20%, white 0, transparent 40%), radial-gradient(circle at 70% 80%, white 0, transparent 40%)" }}
          />
          <div className="relative">
            <h2 className="text-3xl md:text-5xl font-black">Ready to get started?</h2>
            <p className="mt-3 opacity-90 max-w-xl mx-auto">
              Join thousands of event-goers and organizers on {BRAND.name}. Sign up free in seconds.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
              <Button asChild size="xl" variant="glass">
                <Link to="/register">Get started free <ArrowRight className="h-5 w-5" /></Link>
              </Button>
              <Button asChild size="xl" variant="glass">
                <Link to="/company/register">Register as organizer</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer className="border-t py-10 mt-auto">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Brand */}
            <div className="flex flex-col items-center md:items-start gap-1">
              <span className="font-black text-lg gradient-text">{BRAND.name}</span>
              <span className="text-xs text-muted-foreground">{BRAND.tagline}</span>
            </div>

            {/* Links */}
            <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <Link to="/events" className="hover:text-primary transition-colors">Events</Link>
              <Link to="/company/register" className="hover:text-primary transition-colors">For Organizers</Link>
              <Link to="/support" className="hover:text-primary transition-colors">Support</Link>
              <Link to="/login" className="hover:text-primary transition-colors">Login</Link>
            </nav>

            {/* Copyright */}
            <p className="text-xs text-muted-foreground text-center md:text-right">
              © {BRAND.year} {BRAND.name}. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
