import { NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LogOut, LayoutDashboard, Calendar, ScanLine,
  HelpCircle, Building2, Crown,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";

export default function Navbar() {
  const { user, company, logout } = useAuth();
  const navigate = useNavigate();

  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors hover:text-primary ${isActive ? "text-primary" : "text-muted-foreground"}`;

  const handleLogout = () => { logout(); navigate("/"); };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 glass border-b"
    >
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Logo size="md" />

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-7">
          <NavLink to="/events" className={linkCls}>
            <span className="inline-flex items-center gap-1.5"><Calendar className="h-4 w-4" />Events</span>
          </NavLink>

          {/* Company nav */}
          {user?.role === "company" && (
            <>
              <NavLink to="/company/dashboard" className={linkCls}>
                <span className="inline-flex items-center gap-1.5"><LayoutDashboard className="h-4 w-4" />Dashboard</span>
              </NavLink>
              <NavLink to="/company/plans" className={linkCls}>
                <span className="inline-flex items-center gap-1.5"><Crown className="h-4 w-4" />Plans</span>
              </NavLink>
            </>
          )}

          {/* User / Admin nav */}
          {user && user.role !== "company" && (
            <NavLink to="/dashboard" className={linkCls}>
              <span className="inline-flex items-center gap-1.5"><LayoutDashboard className="h-4 w-4" />Dashboard</span>
            </NavLink>
          )}
          {user?.role === "admin" && (
            <NavLink to="/validate" className={linkCls}>
              <span className="inline-flex items-center gap-1.5"><ScanLine className="h-4 w-4" />Validate</span>
            </NavLink>
          )}

          <NavLink to="/support" className={linkCls}>
            <span className="inline-flex items-center gap-1.5"><HelpCircle className="h-4 w-4" />Support</span>
          </NavLink>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <span className="hidden sm:inline text-sm text-muted-foreground">
                {user.role === "company" && <Building2 className="inline h-3.5 w-3.5 mr-1 text-primary" />}
                Hey, <span className="font-semibold text-foreground">
                  {user.role === "company" ? (company?.name || user.name).split(" ")[0] : user.name.split(" ")[0]}
                </span>
              </span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>Log in</Button>
              <Button variant="outline" size="sm" onClick={() => navigate("/company/login")}>
                <Building2 className="h-3.5 w-3.5" /> Company
              </Button>
              <Button variant="hero" size="sm" onClick={() => navigate("/register")}>Sign up</Button>
            </>
          )}
        </div>
      </div>
    </motion.header>
  );
}
