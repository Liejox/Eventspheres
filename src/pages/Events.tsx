import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Search, SlidersHorizontal } from "lucide-react";
import Navbar from "@/components/Navbar";
import EventCard from "@/components/EventCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api, type EventItem } from "@/lib/api";
import { toast } from "sonner";

const CATEGORIES = ["All", "Tech", "Workshop", "Music", "Business", "Art"];

export default function Events() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("All");

  useEffect(() => {
    api.listEvents()
      .then(setEvents)
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = events.filter((e) => {
    const matchesQ =
      e.title.toLowerCase().includes(q.toLowerCase()) ||
      e.location.toLowerCase().includes(q.toLowerCase()) ||
      e.category.toLowerCase().includes(q.toLowerCase());
    const matchesCat = category === "All" || e.category === category;
    return matchesQ && matchesCat;
  });

  return (
    <div className="min-h-screen mesh-bg">
      <Navbar />
      <div className="container py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-black">
            Upcoming <span className="gradient-text">events</span>
          </h1>
          <p className="text-muted-foreground mt-2">Find your next favorite experience on campus.</p>
        </motion.div>

        {/* Search */}
        <div className="max-w-md mx-auto mb-6 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search events, venues, categories..."
            className="pl-9 h-12 rounded-full glass border-0 shadow-card"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        {/* Category filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap items-center justify-center gap-2 mb-10"
        >
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          {CATEGORIES.map((cat) => (
            <Button
              key={cat}
              variant={category === cat ? "hero" : "outline"}
              size="sm"
              onClick={() => setCategory(cat)}
              className={`rounded-full transition-all ${category === cat ? "shadow-glow" : "glass border-0"}`}
            >
              {cat}
            </Button>
          ))}
        </motion.div>

        {loading ? (
          <div className="grid place-items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 rounded-3xl glass"
          >
            <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-40" />
            <p className="text-muted-foreground text-lg font-medium">No events match your search.</p>
            <Button variant="ghost" className="mt-4" onClick={() => { setQ(""); setCategory("All"); }}>
              Clear filters
            </Button>
          </motion.div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-4 text-center">
              Showing {filtered.length} event{filtered.length !== 1 ? "s" : ""}
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((e, i) => <EventCard key={e.id} event={e} index={i} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
