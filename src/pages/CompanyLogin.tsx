import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Building2, Mail, Lock } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";

const schema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(6, "Min 6 characters").max(128),
});

export default function CompanyLogin() {
  const { companyLogin } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setLoading(true);
    try {
      await companyLogin(parsed.data.email, parsed.data.password);
      toast.success("Welcome back! 🏢");
      navigate("/company/dashboard");
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
          <div className="text-center mb-6">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-primary shadow-glow mb-3">
              <Building2 className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-black">Company Login</h1>
            <p className="text-muted-foreground mt-1">Access your EventSphere organizer dashboard</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Company Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  required
                  className="pl-9"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  required
                  className="pl-9"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>
            </div>

            <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Log in to Dashboard"}
            </Button>
          </form>

          {/* Demo accounts */}
          <div className="mt-6 rounded-xl bg-muted/60 p-3 text-xs space-y-1.5">
            <div className="font-semibold text-foreground">Demo company accounts (click to fill):</div>
            <button
              type="button"
              onClick={() => quickFill("company1@example.com", "Company@123")}
              className="block w-full text-left hover:text-primary transition-colors"
            >
              🏢 company1@example.com / Company@123 — TechEvents Inc. (Pro Plan)
            </button>
            <button
              type="button"
              onClick={() => quickFill("company2@example.com", "Company@123")}
              className="block w-full text-left hover:text-primary transition-colors"
            >
              🎵 company2@example.com / Company@123 — Vibe Productions (Premium Plan)
            </button>
          </div>

          <div className="mt-4 flex flex-col gap-2 text-sm text-center text-muted-foreground">
            <span>
              New company?{" "}
              <Link to="/company/register" className="text-primary font-semibold hover:underline">
                Register here
              </Link>
            </span>
            <span>
              Looking for user login?{" "}
              <Link to="/login" className="text-primary font-semibold hover:underline">
                User login
              </Link>
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
