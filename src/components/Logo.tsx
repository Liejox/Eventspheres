import { Link } from "react-router-dom";
import { BRAND } from "@/lib/brand";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  linkTo?: string;
  className?: string;
}

const SIZE = {
  sm: { wrap: "h-7 w-7", icon: 14, text: "text-base" },
  md: { wrap: "h-9 w-9", icon: 18, text: "text-lg" },
  lg: { wrap: "h-14 w-14", icon: 28, text: "text-3xl" },
};

function LogoIcon({ wrapClass }: { wrapClass: string }) {
  return (
    <span className={`grid place-items-center rounded-xl bg-gradient-primary shadow-glow shrink-0 ${wrapClass}`}>
      {/* Ticket SVG icon */}
      <svg viewBox="0 0 20 20" fill="none" className="w-[55%] h-[55%]">
        <path
          d="M3 7a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v1.5a1.5 1.5 0 0 0 0 3V13a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-1.5a1.5 1.5 0 0 0 0-3V7z"
          fill="white"
          opacity="0.95"
        />
        <line x1="8" y1="6" x2="8" y2="14" stroke="#7c3aed" strokeWidth="1.2" strokeDasharray="1.5 1.5" />
      </svg>
    </span>
  );
}

export function LogoWordmark({ size = "md", className = "" }: { size?: "sm" | "md" | "lg"; className?: string }) {
  const s = SIZE[size];
  return (
    <span className={`flex items-center gap-2 font-black ${s.text} ${className}`}>
      <LogoIcon wrapClass={s.wrap} />
      <span className="gradient-text">{BRAND.name}</span>
    </span>
  );
}

export default function Logo({ size = "md", linkTo = "/", className = "" }: LogoProps) {
  return (
    <Link to={linkTo} className={`flex items-center gap-2 font-black ${SIZE[size].text} ${className}`}>
      <LogoIcon wrapClass={SIZE[size].wrap} />
      <span className="gradient-text">{BRAND.name}</span>
    </Link>
  );
}
