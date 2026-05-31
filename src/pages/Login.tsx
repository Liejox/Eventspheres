import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Mail, Lock, Building2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";

const schema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(6, "Min 6 characters").max(128),
});

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation() as { state?: { from?: { pathname?: string } } };
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) { toast.error(parsed.error.errors[0].message); return; }
    setLoading(true);
    try {
      await login(parsed.data.email, parsed.data.password);
      toast.success("Welcome back! 🎉");
      navigate(location.state?.from?.pathname || "/dashboard");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const quickFill = (email: string, password: string) => setForm({ email, password });

  return (
    <div className="min-h-screen mesh-bg">
      <Navbar />
      <div className="container py-16 grid place-items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md rounded-3xl glass p-8 shadow-elevated"
        >
          <div className="mb-5 text-center">
            <span className="font-black text-2xl gradient-text">EventSphere</span>
          </div>
          <h1 className="text-3xl font-black">Welcome back 👋</h1>
          <p className="text-muted-foreground mt-1">Log in to your EventSphere account.</p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="email" type="email" required className="pl-9" value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="password" type="password" required className="pl-9" value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })} />
              </div>
            </div>
            <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Log in"}
            </Button>
          </form>

          {/* Demo accounts */}
          <div className="mt-6 rounded-xl bg-muted/60 p-3 text-xs space-y-1.5">
            <div className="font-semibold text-foreground">Demo accounts (click to fill):</div>
            <button type="button" onClick={() => quickFill("admin@example.com", "Admin@123")}
              className="block w-full text-left hover:text-primary transition-colors">
              👑 admin@example.com / Admin@123 — Super Admin
            </button>
            <button type="button" onClick={() => quickFill("user1@example.com", "User@123")}
              className="block w-full text-left hover:text-primary transition-colors">
              🎓 user1@example.com / User@123 — Attendee
            </button>
            <button type="button" onClick={() => quickFill("user2@example.com", "User@123")}
              className="block w-full text-left hover:text-primary transition-colors">
              🎓 user2@example.com / User@123 — Attendee
            </button>
          </div>

          {/* Company login CTA */}
          <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-3 flex items-center gap-3">
            <Building2 className="h-5 w-5 text-primary shrink-0" />
            <div className="flex-1 text-sm">
              <span className="text-muted-foreground">Are you a company? </span>
              <Link to="/company/login" className="text-primary font-semibold hover:underline">
                Company Login →
              </Link>
            </div>
          </div>

          <p className="mt-4 text-sm text-center text-muted-foreground">
            New here? <Link to="/register" className="text-primary font-semibold hover:underline">Create an account</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
