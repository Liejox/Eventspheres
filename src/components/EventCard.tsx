import { motion } from "framer-motion";
import { Calendar, MapPin, Users, Tag } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { EventItem } from "@/lib/api";

export default function EventCard({ event, index = 0 }: { event: EventItem; index?: number }) {
  const pct = Math.round((event.tickets_sold / event.ticket_limit) * 100);
  const remaining = event.ticket_limit - event.tickets_sold;
  const date = new Date(event.date);
  const soldOut = remaining <= 0;
  const almostFull = !soldOut && pct >= 80;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4, ease: "easeOut" }}
      whileHover={{ y: -6 }}
      className="group relative overflow-hidden rounded-2xl bg-card shadow-card hover:shadow-elevated transition-shadow"
    >
      <Link to={`/events/${event.id}`} className="block">
        <div className="relative h-48 overflow-hidden">
          <img
            src={event.image}
            alt={event.title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

          {/* Category badge */}
          <Badge className="absolute top-3 left-3 bg-white/90 text-foreground hover:bg-white">
            {event.category}
          </Badge>

          {/* Price badge */}
          <div className="absolute top-3 right-3">
            {soldOut ? (
              <Badge className="bg-destructive text-destructive-foreground">Sold out</Badge>
            ) : (
              <Badge className={`font-bold ${event.price === 0 ? "bg-emerald-500 text-white" : "bg-gradient-primary text-white border-0"}`}>
                {event.price === 0 ? "FREE" : `$${event.price}`}
              </Badge>
            )}
          </div>

          {almostFull && !soldOut && (
            <div className="absolute bottom-3 left-3">
              <Badge className="bg-amber-500 text-white text-xs">🔥 Almost Full</Badge>
            </div>
          )}
        </div>
      </Link>

      <div className="p-5 space-y-3">
        <Link to={`/events/${event.id}`}>
          <h3 className="text-lg font-bold leading-tight line-clamp-1 hover:text-primary transition-colors">
            {event.title}
          </h3>
        </Link>
        <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">{event.description}</p>

        <div className="space-y-1.5 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary shrink-0" />
            {date.toLocaleDateString(undefined, { dateStyle: "medium" })} · {date.toLocaleTimeString(undefined, { timeStyle: "short" })}
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary shrink-0" />
            {soldOut ? <span className="text-destructive font-medium">Sold out</span> : `${remaining} of ${event.ticket_limit} left`}
          </div>
        </div>

        {/* Seats progress bar */}
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full transition-all rounded-full ${soldOut ? "bg-destructive" : almostFull ? "bg-amber-500" : "bg-gradient-primary"}`}
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>

        <Button asChild variant={soldOut ? "outline" : "hero"} className="w-full mt-2" disabled={soldOut}>
          <Link to={`/events/${event.id}`}>
            {soldOut ? "Sold out" : "View & Book"}
          </Link>
        </Button>
      </div>
    </motion.div>
  );
}
