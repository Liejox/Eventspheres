import { useState } from "react";
import { motion } from "framer-motion";
import { ScanLine, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { toast } from "sonner";

export default function Validate() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ valid: boolean; message: string; meta?: string } | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const r = await api.validateTicket(code.trim());
      setResult({
        valid: r.valid,
        message: r.message,
        meta: r.booking?.event?.title,
      });
      r.valid ? toast.success(r.message) : toast.error(r.message);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen mesh-bg">
      <Navbar />
      <div className="container py-12 max-w-xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-black">Entry <span className="gradient-text">validation</span></h1>
          <p className="text-muted-foreground mt-1">Scan or paste a ticket QR code to admit.</p>
        </motion.div>

        <motion.form
          onSubmit={submit}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="mt-8 rounded-2xl glass p-6 shadow-card space-y-4"
        >
          <div className="grid place-items-center h-32 rounded-xl bg-gradient-primary/10 border-2 border-dashed border-primary/30">
            <ScanLine className="h-12 w-12 text-primary" />
          </div>
          <Input placeholder="Paste QR code here…" value={code} onChange={(e) => setCode(e.target.value)} className="font-mono" />
          <Button type="submit" variant="hero" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Validate ticket"}
          </Button>
        </motion.form>

        {result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className={`mt-6 rounded-2xl p-6 shadow-elevated flex items-center gap-4 ${
              result.valid ? "bg-success/10 border border-success/30" : "bg-destructive/10 border border-destructive/30"
            }`}
          >
            {result.valid
              ? <CheckCircle2 className="h-12 w-12 text-success" />
              : <XCircle className="h-12 w-12 text-destructive" />}
            <div>
              <div className="font-bold text-lg">{result.message}</div>
              {result.meta && <div className="text-sm text-muted-foreground">{result.meta}</div>}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
