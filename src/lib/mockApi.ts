/**
 * Mock API — Multi-tenant SaaS Event Platform
 * All data lives in localStorage. Mirrors the real Express contract.
 */
import type { Booking, Company, CompanyPlan, EventItem, Plan, SupportTicket, User } from "./api";
import { companyStore, tokenStore, userStore } from "./api";

const LS_USERS     = "sep_mock_users";
const LS_COMPANIES = "sep_mock_companies";
const LS_EVENTS    = "sep_mock_events";
const LS_BOOKINGS  = "sep_mock_bookings";
const LS_SUPPORT   = "sep_mock_support";
const LS_PLANS     = "sep_mock_plans";
const LS_CO_PLANS  = "sep_mock_company_plans"; // purchased plans

interface StoredUser extends User { password: string; }
interface StoredCompany extends Company { password: string; }

const uid  = () => Math.random().toString(36).slice(2, 10);
const read = <T>(key: string): T => JSON.parse(localStorage.getItem(key) || "[]");
const write = (key: string, val: unknown) => localStorage.setItem(key, JSON.stringify(val));
const delay = <T>(v: T, ms = 400) => new Promise<T>((r) => setTimeout(() => r(v), ms));
const fakeJwt = (u: User) => `mock.${btoa(JSON.stringify(u))}.sig`;

// ── Seed data ────────────────────────────────────────────────────────────────
function seed() {
  // Plans
  if (!localStorage.getItem(LS_PLANS)) {
    const plans: Plan[] = [
      {
        id: "plan_basic",
        name: "Basic",
        event_limit: 1,
        price: 29,
        description: "Perfect for trying out the platform",
        features: ["1 Event", "Up to 100 attendees/event", "QR ticket generation", "Basic analytics"],
      },
      {
        id: "plan_pro",
        name: "Pro",
        event_limit: 5,
        price: 79,
        description: "For growing event organizers",
        features: ["5 Events", "Up to 500 attendees/event", "QR ticket generation", "Advanced analytics", "Priority support"],
      },
      {
        id: "plan_premium",
        name: "Premium",
        event_limit: -1,
        price: 149,
        description: "Unlimited events for power users",
        features: ["Unlimited Events", "Unlimited attendees", "QR ticket generation", "Full analytics suite", "Dedicated support", "Custom branding"],
      },
    ];
    write(LS_PLANS, plans);
  }

  // Users
  if (!localStorage.getItem(LS_USERS)) {
    const users: StoredUser[] = [
      { id: "u_admin", name: "Super Admin",  email: "admin@example.com",  password: "Admin@123", role: "admin" },
      { id: "u_1",     name: "Alex Carter",  email: "user1@example.com",  password: "User@123",  role: "attendee" },
      { id: "u_2",     name: "Jamie Lin",    email: "user2@example.com",  password: "User@123",  role: "attendee" },
    ];
    write(LS_USERS, users);
  }

  // Companies
  if (!localStorage.getItem(LS_COMPANIES)) {
    const companies: StoredCompany[] = [
      {
        id: "co_1",
        name: "TechEvents Inc.",
        email: "company1@example.com",
        password: "Company@123",
        description: "Leading tech event organizer on campus",
        logo: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?auto=format&fit=crop&w=200&q=80",
        status: "active",
        plan_id: "plan_pro",
        plan_expires: new Date(Date.now() + 90 * 86400000).toISOString(),
        events_created: 2,
        created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
      },
      {
        id: "co_2",
        name: "Vibe Productions",
        email: "company2@example.com",
        password: "Company@123",
        description: "Music and entertainment events",
        logo: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=200&q=80",
        status: "active",
        plan_id: "plan_premium",
        plan_expires: new Date(Date.now() + 60 * 86400000).toISOString(),
        events_created: 2,
        created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
      },
    ];
    write(LS_COMPANIES, companies);
  }

  // Company plan purchases
  if (!localStorage.getItem(LS_CO_PLANS)) {
    const coPlans: CompanyPlan[] = [
      {
        id: "cp_1",
        company_id: "co_1",
        plan_id: "plan_pro",
        purchased_at: new Date(Date.now() - 30 * 86400000).toISOString(),
        expires_at: new Date(Date.now() + 90 * 86400000).toISOString(),
        status: "active",
      },
      {
        id: "cp_2",
        company_id: "co_2",
        plan_id: "plan_premium",
        purchased_at: new Date(Date.now() - 20 * 86400000).toISOString(),
        expires_at: new Date(Date.now() + 60 * 86400000).toISOString(),
        status: "active",
      },
    ];
    write(LS_CO_PLANS, coPlans);
  }

  // Events (owned by companies)
  if (!localStorage.getItem(LS_EVENTS)) {
    const events: EventItem[] = [
      {
        id: "e_1",
        title: "Tech Fest 2025",
        description: "The biggest student-led tech festival of the year. Join us for 3 days of hackathons, inspiring talks from industry leaders, cutting-edge demos, and an epic after-party. Network with top companies, win prizes, and be part of the future of tech.",
        date: "2025-11-22T10:00:00",
        location: "Main Auditorium, Block A",
        map_link: "https://maps.google.com/?q=Main+Auditorium+Block+A",
        ticket_limit: 300,
        tickets_sold: 142,
        image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80",
        category: "Tech",
        price: 25,
        company_id: "co_1",
        company_name: "TechEvents Inc.",
      },
      {
        id: "e_2",
        title: "AI Workshop: Build with LLMs",
        description: "Hands-on workshop on building with Large Language Models, AI agents, and modern AI tooling. Learn prompt engineering, fine-tuning, and how to integrate AI into your projects. Bring your laptop and get ready to code.",
        date: "2025-12-05T14:00:00",
        location: "Innovation Lab, Floor 3",
        map_link: "https://maps.google.com/?q=Innovation+Lab+Floor+3",
        ticket_limit: 80,
        tickets_sold: 61,
        image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80",
        category: "Workshop",
        price: 15,
        company_id: "co_1",
        company_name: "TechEvents Inc.",
      },
      {
        id: "e_3",
        title: "Music Night: Live Bands & Headliner",
        description: "Live performances from the best student bands on campus, plus a surprise headliner you won't want to miss. Food trucks, drinks, and good vibes all night long.",
        date: "2025-12-15T19:00:00",
        location: "Open Air Stage, Quad",
        map_link: "https://maps.google.com/?q=Open+Air+Stage+Quad",
        ticket_limit: 500,
        tickets_sold: 318,
        image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1200&q=80",
        category: "Music",
        price: 20,
        company_id: "co_2",
        company_name: "Vibe Productions",
      },
      {
        id: "e_4",
        title: "Startup Pitch Competition",
        description: "Watch the next generation of entrepreneurs pitch their ideas to a panel of VCs and industry experts. $50K in prizes up for grabs.",
        date: "2025-11-30T16:00:00",
        location: "Business School Auditorium",
        map_link: "https://maps.google.com/?q=Business+School+Auditorium",
        ticket_limit: 200,
        tickets_sold: 87,
        image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=1200&q=80",
        category: "Business",
        price: 0,
        company_id: "co_1",
        company_name: "TechEvents Inc.",
      },
      {
        id: "e_5",
        title: "Photography Exhibition: Campus Life",
        description: "A stunning visual journey through campus life, captured by our talented student photographers. Free entry. Refreshments provided.",
        date: "2025-12-10T11:00:00",
        location: "Art Gallery, Student Center",
        map_link: "https://maps.google.com/?q=Art+Gallery+Student+Center",
        ticket_limit: 150,
        tickets_sold: 42,
        image: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1200&q=80",
        category: "Art",
        price: 0,
        company_id: "co_2",
        company_name: "Vibe Productions",
      },
      {
        id: "e_6",
        title: "Coding Bootcamp: Web Dev Crash Course",
        description: "Learn to build modern web apps from scratch in just one weekend. HTML, CSS, JavaScript, React—we'll cover it all. Perfect for beginners.",
        date: "2025-12-20T09:00:00",
        location: "Computer Lab, Engineering Building",
        map_link: "https://maps.google.com/?q=Computer+Lab+Engineering+Building",
        ticket_limit: 60,
        tickets_sold: 58,
        image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80",
        category: "Workshop",
        price: 30,
        company_id: "co_1",
        company_name: "TechEvents Inc.",
      },
    ];
    write(LS_EVENTS, events);
  }

  if (!localStorage.getItem(LS_BOOKINGS)) write(LS_BOOKINGS, []);
  if (!localStorage.getItem(LS_SUPPORT))  write(LS_SUPPORT, []);
}
seed();

// ── Helpers ──────────────────────────────────────────────────────────────────
function getActivePlan(company_id: string): CompanyPlan | null {
  const plans = read<Plan[]>(LS_PLANS);
  const coPlans = read<CompanyPlan[]>(LS_CO_PLANS);
  const cp = coPlans.find((p) => p.company_id === company_id && p.status === "active");
  if (!cp) return null;
  const plan = plans.find((p) => p.id === cp.plan_id);
  return { ...cp, plan };
}

// ── Mock API ─────────────────────────────────────────────────────────────────
export const mockApi = {
  // ── User auth ──────────────────────────────────────────────────────────────
  async register(p: { name: string; email: string; password: string }) {
    const users = read<StoredUser[]>(LS_USERS);
    const companies = read<StoredCompany[]>(LS_COMPANIES);
    if (users.find((u) => u.email === p.email) || companies.find((c) => c.email === p.email)) {
      throw new Error("Email already registered");
    }
    const user: StoredUser = { id: uid(), name: p.name, email: p.email, password: p.password, role: "attendee" };
    users.push(user);
    write(LS_USERS, users);
    const { password, ...safe } = user;
    return delay({ token: fakeJwt(safe), user: safe });
  },

  async login(p: { email: string; password: string }) {
    const users = read<StoredUser[]>(LS_USERS);
    const u = users.find((x) => x.email === p.email && x.password === p.password);
    if (!u) throw new Error("Invalid email or password");
    const { password, ...safe } = u;
    return delay({ token: fakeJwt(safe), user: safe });
  },

  // ── Company auth ───────────────────────────────────────────────────────────
  async companyRegister(p: { name: string; email: string; password: string; description?: string }) {
    const users = read<StoredUser[]>(LS_USERS);
    const companies = read<StoredCompany[]>(LS_COMPANIES);
    if (users.find((u) => u.email === p.email) || companies.find((c) => c.email === p.email)) {
      throw new Error("Email already registered");
    }
    const company: StoredCompany = {
      id: uid(),
      name: p.name,
      email: p.email,
      password: p.password,
      description: p.description || "",
      status: "active",
      events_created: 0,
      created_at: new Date().toISOString(),
    };
    companies.push(company);
    write(LS_COMPANIES, companies);
    const { password, ...safeCompany } = company;
    // Company gets a user token with role="company" for auth
    const userProxy: User = { id: company.id, name: company.name, email: company.email, role: "company" };
    return delay({ token: fakeJwt(userProxy), user: userProxy, company: safeCompany });
  },

  async companyLogin(p: { email: string; password: string }) {
    const companies = read<StoredCompany[]>(LS_COMPANIES);
    const c = companies.find((x) => x.email === p.email && x.password === p.password);
    if (!c) throw new Error("Invalid email or password");
    if (c.status === "blocked") throw new Error("Your company account has been blocked. Contact support.");
    const { password, ...safeCompany } = c;
    const userProxy: User = { id: c.id, name: c.name, email: c.email, role: "company" };
    return delay({ token: fakeJwt(userProxy), user: userProxy, company: safeCompany });
  },

  // ── Plans ──────────────────────────────────────────────────────────────────
  async listPlans(): Promise<Plan[]> {
    return delay(read<Plan[]>(LS_PLANS));
  },

  async purchasePlan(plan_id: string): Promise<CompanyPlan> {
    const user = userStore.get();
    if (!user || user.role !== "company") throw new Error("Company login required");
    const plans = read<Plan[]>(LS_PLANS);
    const plan = plans.find((p) => p.id === plan_id);
    if (!plan) throw new Error("Plan not found");

    // Expire any existing active plan
    const coPlans = read<CompanyPlan[]>(LS_CO_PLANS);
    coPlans.forEach((cp) => { if (cp.company_id === user.id) cp.status = "expired"; });

    const newPlan: CompanyPlan = {
      id: uid(),
      company_id: user.id,
      plan_id,
      purchased_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 90 * 86400000).toISOString(),
      status: "active",
      plan,
    };
    coPlans.push(newPlan);
    write(LS_CO_PLANS, coPlans);

    // Update company record
    const companies = read<StoredCompany[]>(LS_COMPANIES);
    const idx = companies.findIndex((c) => c.id === user.id);
    if (idx !== -1) {
      companies[idx].plan_id = plan_id;
      companies[idx].plan_expires = newPlan.expires_at;
      write(LS_COMPANIES, companies);
      const { password, ...safe } = companies[idx];
      companyStore.set(safe);
    }
    return delay(newPlan, 1200);
  },

  async myPlan(): Promise<CompanyPlan | null> {
    const user = userStore.get();
    if (!user) return null;
    return delay(getActivePlan(user.id));
  },

  // ── Events ─────────────────────────────────────────────────────────────────
  async listEvents(): Promise<EventItem[]> {
    return delay(read<EventItem[]>(LS_EVENTS));
  },

  async getEvent(id: string): Promise<EventItem> {
    const e = read<EventItem[]>(LS_EVENTS).find((x) => x.id === id);
    if (!e) throw new Error("Event not found");
    return delay(e);
  },

  async createEvent(payload: Omit<EventItem, "id" | "tickets_sold" | "company_id" | "company_name">): Promise<EventItem> {
    const user = userStore.get();
    if (!user || user.role !== "company") throw new Error("Company login required");

    // Check plan limits
    const activePlan = getActivePlan(user.id);
    if (!activePlan) throw new Error("No active plan. Please purchase a plan first.");
    const plans = read<Plan[]>(LS_PLANS);
    const plan = plans.find((p) => p.id === activePlan.plan_id);
    if (!plan) throw new Error("Plan not found");

    const companies = read<StoredCompany[]>(LS_COMPANIES);
    const company = companies.find((c) => c.id === user.id);
    if (!company) throw new Error("Company not found");

    if (plan.event_limit !== -1 && company.events_created >= plan.event_limit) {
      throw new Error(`Your ${plan.name} plan allows only ${plan.event_limit} event(s). Upgrade to create more.`);
    }

    const events = read<EventItem[]>(LS_EVENTS);
    const e: EventItem = {
      ...payload,
      id: uid(),
      tickets_sold: 0,
      company_id: user.id,
      company_name: company.name,
    };
    events.push(e);
    write(LS_EVENTS, events);

    // Increment events_created
    const idx = companies.findIndex((c) => c.id === user.id);
    companies[idx].events_created += 1;
    write(LS_COMPANIES, companies);
    const { password, ...safe } = companies[idx];
    companyStore.set(safe);

    return delay(e);
  },

  async updateEvent(id: string, payload: Partial<EventItem>): Promise<EventItem> {
    const user = userStore.get();
    const events = read<EventItem[]>(LS_EVENTS);
    const idx = events.findIndex((e) => e.id === id);
    if (idx === -1) throw new Error("Event not found");
    // Only owner company or admin can update
    if (user?.role === "company" && events[idx].company_id !== user.id) {
      throw new Error("Not authorized to edit this event");
    }
    events[idx] = { ...events[idx], ...payload };
    write(LS_EVENTS, events);
    return delay(events[idx]);
  },

  async deleteEvent(id: string) {
    const user = userStore.get();
    const events = read<EventItem[]>(LS_EVENTS);
    const event = events.find((e) => e.id === id);
    if (!event) throw new Error("Event not found");
    if (user?.role === "company" && event.company_id !== user.id) {
      throw new Error("Not authorized to delete this event");
    }
    // Decrement events_created for the owning company
    if (event.company_id) {
      const companies = read<StoredCompany[]>(LS_COMPANIES);
      const idx = companies.findIndex((c) => c.id === event.company_id);
      if (idx !== -1 && companies[idx].events_created > 0) {
        companies[idx].events_created -= 1;
        write(LS_COMPANIES, companies);
      }
    }
    write(LS_EVENTS, events.filter((e) => e.id !== id));
    return delay({ ok: true as const });
  },

  async myCompanyEvents(): Promise<EventItem[]> {
    const user = userStore.get();
    if (!user) return [];
    return delay(read<EventItem[]>(LS_EVENTS).filter((e) => e.company_id === user.id));
  },

  // ── Bookings ───────────────────────────────────────────────────────────────
  async bookEvent(event_id: string): Promise<Booking> {
    const user = userStore.get();
    if (!user) throw new Error("Please log in first");
    if (user.role === "company") throw new Error("Companies cannot book tickets");
    const events = read<EventItem[]>(LS_EVENTS);
    const event = events.find((e) => e.id === event_id);
    if (!event) throw new Error("Event not found");
    const bookings = read<Booking[]>(LS_BOOKINGS);
    if (bookings.find((b) => b.user_id === user.id && b.event_id === event_id && b.status === "active")) {
      throw new Error("You already booked this event");
    }
    if (event.tickets_sold >= event.ticket_limit) throw new Error("Event is fully booked");
    event.tickets_sold += 1;
    write(LS_EVENTS, events);
    const booking: Booking = {
      id: uid(),
      user_id: user.id,
      event_id,
      qr_code: `SEP-${event_id}-${user.id}-${uid()}`.toUpperCase(),
      status: "active",
      created_at: new Date().toISOString(),
      event,
    };
    bookings.push(booking);
    write(LS_BOOKINGS, bookings);
    return delay(booking, 600);
  },

  async myBookings(): Promise<Booking[]> {
    const user = userStore.get();
    if (!user) return [];
    const bookings = read<Booking[]>(LS_BOOKINGS).filter((b) => b.user_id === user.id);
    const events = read<EventItem[]>(LS_EVENTS);
    return delay(bookings.map((b) => ({ ...b, event: events.find((e) => e.id === b.event_id) })));
  },

  // ── Dashboards ─────────────────────────────────────────────────────────────
  async dashboard() {
    const users = read<StoredUser[]>(LS_USERS);
    const companies = read<StoredCompany[]>(LS_COMPANIES);
    const events = read<EventItem[]>(LS_EVENTS);
    const bookings = read<Booking[]>(LS_BOOKINGS);
    const enriched = bookings.map((b) => ({ ...b, event: events.find((e) => e.id === b.event_id) }));
    const revenue = bookings.reduce((sum, b) => {
      const evt = events.find((e) => e.id === b.event_id);
      return sum + (evt?.price || 0);
    }, 0);
    return delay({
      stats: { users: users.length, events: events.length, bookings: bookings.length, revenue, companies: companies.length },
      recent_bookings: enriched.slice(-5).reverse(),
    });
  },

  async companyDashboard() {
    const user = userStore.get();
    if (!user) throw new Error("Not authenticated");
    const events = read<EventItem[]>(LS_EVENTS).filter((e) => e.company_id === user.id);
    const bookings = read<Booking[]>(LS_BOOKINGS).filter((b) =>
      events.some((e) => e.id === b.event_id)
    );
    const revenue = bookings.reduce((sum, b) => {
      const evt = events.find((e) => e.id === b.event_id);
      return sum + (evt?.price || 0);
    }, 0);
    const enriched = bookings.map((b) => ({ ...b, event: events.find((e) => e.id === b.event_id) }));
    const plan = getActivePlan(user.id);
    return delay({
      stats: {
        events: events.length,
        bookings: bookings.length,
        revenue,
        seats_sold: bookings.length,
      },
      events,
      recent_bookings: enriched.slice(-5).reverse(),
      plan,
    });
  },

  // ── Ticket validation ──────────────────────────────────────────────────────
  async validateTicket(qr_code: string): Promise<{ valid: boolean; booking?: Booking; message: string }> {
    const bookings = read<Booking[]>(LS_BOOKINGS);
    const b = bookings.find((x) => x.qr_code === qr_code);
    if (!b) return delay({ valid: false, message: "Invalid QR code" });
    if (b.status === "used") return delay({ valid: false, booking: b, message: "Ticket already used" });
    b.status = "used";
    write(LS_BOOKINGS, bookings);
    return delay({ valid: true, booking: b, message: "Entry granted" });
  },

  // ── Support ────────────────────────────────────────────────────────────────
  async submitSupportTicket(payload: { subject: string; message: string }): Promise<SupportTicket> {
    const user = userStore.get();
    if (!user) throw new Error("Please log in first");
    const tickets = read<SupportTicket[]>(LS_SUPPORT);
    const ticket: SupportTicket = {
      id: uid(),
      user_id: user.id,
      user_name: user.name,
      user_email: user.email,
      subject: payload.subject,
      message: payload.message,
      status: "open",
      created_at: new Date().toISOString(),
    };
    tickets.push(ticket);
    write(LS_SUPPORT, tickets);
    return delay(ticket);
  },

  async mySupportTickets(): Promise<SupportTicket[]> {
    const user = userStore.get();
    if (!user) return [];
    return delay(read<SupportTicket[]>(LS_SUPPORT).filter((t) => t.user_id === user.id));
  },

  async allSupportTickets(): Promise<SupportTicket[]> {
    return delay(read<SupportTicket[]>(LS_SUPPORT));
  },

  async updateSupportTicket(id: string, payload: { status?: SupportTicket["status"]; admin_reply?: string }): Promise<SupportTicket> {
    const tickets = read<SupportTicket[]>(LS_SUPPORT);
    const idx = tickets.findIndex((t) => t.id === id);
    if (idx === -1) throw new Error("Ticket not found");
    tickets[idx] = { ...tickets[idx], ...payload, updated_at: new Date().toISOString() };
    write(LS_SUPPORT, tickets);
    return delay(tickets[idx]);
  },

  // ── Admin ──────────────────────────────────────────────────────────────────
  async adminListCompanies(): Promise<Company[]> {
    const companies = read<StoredCompany[]>(LS_COMPANIES);
    return delay(companies.map(({ password, ...safe }) => safe));
  },

  async adminUpdateCompany(id: string, payload: Partial<Company>): Promise<Company> {
    const companies = read<StoredCompany[]>(LS_COMPANIES);
    const idx = companies.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error("Company not found");
    companies[idx] = { ...companies[idx], ...payload };
    write(LS_COMPANIES, companies);
    const { password, ...safe } = companies[idx];
    return delay(safe);
  },

  async adminListPlanPurchases(): Promise<CompanyPlan[]> {
    const coPlans = read<CompanyPlan[]>(LS_CO_PLANS);
    const plans = read<Plan[]>(LS_PLANS);
    return delay(coPlans.map((cp) => ({ ...cp, plan: plans.find((p) => p.id === cp.plan_id) })));
  },
};

export function _resetMockData() {
  [LS_USERS, LS_COMPANIES, LS_EVENTS, LS_BOOKINGS, LS_SUPPORT, LS_PLANS, LS_CO_PLANS].forEach((k) =>
    localStorage.removeItem(k)
  );
  tokenStore.clear();
  companyStore.clear();
  seed();
}
