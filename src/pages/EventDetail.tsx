import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Calendar, MapPin, Users, Loader2, ArrowLeft,
  Tag, ExternalLink, Clock, Ticket,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api, type EventItem } from "@/lib/api";
import { toast } from "sonner";

const CATEGORY_COLORS: Record<string, string> = {
  Tech: "bg-blue-500/10 text-blue-600 border-blue-200",
  Workshop: "bg-purple-500/10 text-purple-600 border-purple-200",
  Music: "bg-pink-500/10 text-pink-600 border-pink-200",
  Business: "bg-amber-500/10 text-amber-600 border-amber-200",
  Art: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
};

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    api.getEvent(id)
      .then(setEvent)
      .catch((e) => { toast.error(e.message); navigate("/events"); })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen mesh-bg">
        <Navbar />
        <div className="grid place-items-center py-32">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!event) return null;

  const remaining = event.ticket_limit - event.tickets_sold;
  const pct = Math.round((event.tickets_sold / event.ticket_limit) * 100);
  const date = new Date(event.date);
  const soldOut = remaining <= 0;
  const almostFull = !soldOut && pct >= 80;
  const catColor = CATEGORY_COLORS[event.category] || "bg-primary/10 text-primary border-primary/20";

  return (
    <div className="min-h-screen mesh-bg">
      <Navbar />

      {/* Banner */}
      <div className="relative h-72 md:h-96 overflow-hidden">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 container pb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/events")}
            className="mb-4 glass text-foreground hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" /> Back to events
          </Button>
        </div>
      </div>

      <div className="container max-w-5xl pb-20 -mt-4">
        <div className="grid lg:grid-cols-[1fr_340px] gap-8">
          {/* Left: Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${catColor}`}>
                <Tag className="h-3 w-3" /> {event.category}
              </span>
              {soldOut && (
                <Badge variant="destructive">Sold Out</Badge>
              )}
              {almostFull && (
                <Badge className="bg-amber-500 text-white hover:bg-amber-600">Almost Full!</Badge>
              )}
            </div>

            <h1 className="text-4xl md:text-5xl font-black leading-tight">{event.title}</h1>

            {/* Meta info */}
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-3 rounded-xl glass p-3">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Date</div>
                  <div className="font-semibold text-sm">
                    {date.toLocaleDateString(undefined, { dateStyle: "long" })}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl glass p-3">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Time</div>
                  <div className="font-semibold text-sm">
                    {date.toLocaleTimeString(undefined, { timeStyle: "short" })}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl glass p-3">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-muted-foreground">Location</div>
                  <div className="font-semibold text-sm truncate">{event.location}</div>
                  {event.map_link && (
                    <a
                      href={event.map_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary flex items-center gap-1 hover:underline mt-0.5"
                    >
                      View on map <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl glass p-3">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Availability</div>
                  <div className="font-semibold text-sm">
                    {soldOut ? "Sold out" : `${remaining} of ${event.ticket_limit} left`}
                  </div>
                </div>
              </div>
            </div>

            {/* Seats progress */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{event.tickets_sold} booked</span>
                <span>{pct}% filled</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(pct, 100)}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className={`h-full rounded-full ${soldOut ? "bg-destructive" : almostFull ? "bg-amber-500" : "bg-gradient-to-r from-primary to-secondary"}`}
                />
              </div>
            </div>

            {/* Description */}
            <div className="rounded-2xl glass p-6 space-y-3">
              <h2 className="font-bold text-lg">About this event</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{event.description}</p>
            </div>
          </motion.div>

          {/* Right: Booking card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="lg:sticky lg:top-24 h-fit"
          >
            <div className="rounded-2xl glass shadow-elevated p-6 space-y-5">
              <div className="text-center">
                <div className="text-3xl font-black">
                  {event.price === 0 ? (
                    <span className="text-emerald-500">FREE</span>
                  ) : (
                    <span className="gradient-text">${event.price}</span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground mt-1">per ticket</div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span className="font-medium">{date.toLocaleDateString(undefined, { dateStyle: "medium" })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time</span>
                  <span className="font-medium">{date.toLocaleTimeString(undefined, { timeStyle: "short" })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Seats left</span>
                  <span className={`font-medium ${soldOut ? "text-destructive" : almostFull ? "text-amber-500" : "text-emerald-500"}`}>
                    {soldOut ? "Sold out" : remaining}
                  </span>
                </div>
              </div>

              <div className="border-t pt-4">
                {soldOut ? (
                  <Button disabled className="w-full" size="lg">Sold Out</Button>
                ) : (
                  <Button asChild variant="glow" size="lg" className="w-full animate-pulse-glow">
                    <Link to={`/book/${event.id}`}>
                      <Ticket className="h-5 w-5" />
                      Book Ticket
                    </Link>
                  </Button>
                )}
                <p className="text-xs text-center text-muted-foreground mt-3">
                  Secure booking · Instant QR ticket
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
