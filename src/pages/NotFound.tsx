import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/brand";

export default function NotFound() {
  return (
    <div className="min-h-screen mesh-bg flex flex-col items-center justify-center text-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6 max-w-md"
      >
        {/* Logo mark */}
        <div className="grid h-20 w-20 place-items-center rounded-2xl bg-gradient-primary shadow-glow mx-auto">
          <Ticket className="h-10 w-10 text-primary-foreground" />
        </div>

        <div>
          <h1 className="text-8xl font-black gradient-text">404</h1>
          <h2 className="text-2xl font-bold mt-2">Page not found</h2>
          <p className="text-muted-foreground mt-2">
            Looks like this ticket doesn't exist. The page you're looking for has been moved or deleted.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button asChild variant="hero" size="lg">
            <Link to="/"><ArrowLeft className="h-4 w-4" /> Back to {BRAND.name}</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/events">Browse Events</Link>
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          © {BRAND.year} {BRAND.name}. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
}
