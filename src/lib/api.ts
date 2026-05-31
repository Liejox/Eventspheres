/**
 * API Client — Production SaaS Event Platform
 * Roles: admin | attendee | company
 */
import { mockApi } from "./mockApi";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
const MODE = (import.meta.env.VITE_API_MODE || "mock") as "mock" | "real";

export type Role = "admin" | "attendee" | "company";
export type EventStatus = "pending" | "approved" | "rejected";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface Company {
  id: string;
  name: string;
  email: string;
  description?: string;
  logo?: string;
  status: "active" | "blocked" | "pending";
  plan_id?: string;
  plan_expires?: string;
  events_created: number;
  created_at: string;
}

export interface Plan {
  id: string;
  name: string;
  event_limit: number; // -1 = unlimited
  price: number;
  description: string;
  features: string[];
}

export interface CompanyPlan {
  id: string;
  company_id: string;
  plan_id: string;
  plan?: Plan;
  purchased_at: string;
  expires_at: string;
  status: "active" | "expired";
}

export interface EventItem {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  map_link?: string;
  ticket_limit: number;
  tickets_sold: number;
  image: string;
  category: string;
  price: number;
  company_id?: string;
  company_name?: string;
  approval_status: EventStatus;
  rejection_reason?: string;
  avg_rating?: number;
  review_count?: number;
  bookmarks?: number;
}

export interface Booking {
  id: string;
  user_id: string;
  event_id: string;
  qr_code: string;
  status: "active" | "used" | "cancelled";
  created_at: string;
  event?: EventItem;
  pdf_url?: string;
  coupon_used?: string;
  amount_paid?: number;
}

export interface Review {
  id: string;
  event_id: string;
  user_id: string;
  user_name: string;
  rating: number; // 1-5
  comment: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string; // admin id, company id, or user id
  type: "event_approved" | "event_rejected" | "new_booking" | "new_company" | "plan_purchased" | "event_pending" | "plan_expiring" | "event_updated";
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  link?: string;
}

export interface Coupon {
  id: string;
  company_id: string;
  code: string;
  discount_type: "percent" | "flat";
  discount_value: number;
  max_uses: number;
  used_count: number;
  expires_at: string;
  active: boolean;
}

export interface SupportTicket {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  subject: string;
  message: string;
  status: "open" | "in_progress" | "resolved";
  admin_reply?: string;
  created_at: string;
  updated_at?: string;
}

// ── Storage keys ──────────────────────────────────────────────
const TOKEN_KEY = "sep_token";
const USER_KEY  = "sep_user";
const CO_KEY    = "sep_company";

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t: string) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(CO_KEY);
  },
};

export const userStore = {
  get: (): User | null => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },
  set: (u: User) => localStorage.setItem(USER_KEY, JSON.stringify(u)),
};

export const companyStore = {
  get: (): Company | null => {
    const raw = localStorage.getItem(CO_KEY);
    return raw ? JSON.parse(raw) : null;
  },
  set: (c: Company) => localStorage.setItem(CO_KEY, JSON.stringify(c)),
  clear: () => localStorage.removeItem(CO_KEY),
};

async function http<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const token = tokenStore.get();
  const res = await fetch(`${API_BASE}${path}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts.headers || {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || "Request failed");
  }
  return res.json();
}

export const api = {
  // ── Auth ──────────────────────────────────────────────────
  async register(payload: { name: string; email: string; password: string }) {
    if (MODE === "mock") return mockApi.register(payload);
    return http<{ token: string; user: User }>("/auth/register", { method: "POST", body: JSON.stringify(payload) });
  },
  async login(payload: { email: string; password: string }) {
    if (MODE === "mock") return mockApi.login(payload);
    return http<{ token: string; user: User }>("/auth/login", { method: "POST", body: JSON.stringify(payload) });
  },
  async companyRegister(payload: { name: string; email: string; password: string; description?: string }) {
    if (MODE === "mock") return mockApi.companyRegister(payload);
    return http<{ token: string; user: User; company: Company }>("/company/register", { method: "POST", body: JSON.stringify(payload) });
  },
  async companyLogin(payload: { email: string; password: string }) {
    if (MODE === "mock") return mockApi.companyLogin(payload);
    return http<{ token: string; user: User; company: Company }>("/company/login", { method: "POST", body: JSON.stringify(payload) });
  },

  // ── Plans ─────────────────────────────────────────────────
  async listPlans(): Promise<Plan[]> {
    if (MODE === "mock") return mockApi.listPlans();
    return http("/plans");
  },
  async purchasePlan(plan_id: string): Promise<CompanyPlan> {
    if (MODE === "mock") return mockApi.purchasePlan(plan_id);
    return http("/company/purchase-plan", { method: "POST", body: JSON.stringify({ plan_id }) });
  },
  async myPlan(): Promise<CompanyPlan | null> {
    if (MODE === "mock") return mockApi.myPlan();
    return http("/company/my-plan");
  },

  // ── Events ────────────────────────────────────────────────
  async listEvents(filters?: { category?: string; minPrice?: number; maxPrice?: number; dateFrom?: string }): Promise<EventItem[]> {
    if (MODE === "mock") return mockApi.listEvents(filters);
    return http("/events");
  },
  async getEvent(id: string): Promise<EventItem> {
    if (MODE === "mock") return mockApi.getEvent(id);
    return http(`/events/${id}`);
  },
  async createEvent(payload: Omit<EventItem, "id" | "tickets_sold" | "company_id" | "company_name" | "approval_status" | "avg_rating" | "review_count" | "bookmarks">): Promise<EventItem> {
    if (MODE === "mock") return mockApi.createEvent(payload);
    return http("/events", { method: "POST", body: JSON.stringify(payload) });
  },
  async updateEvent(id: string, payload: Partial<EventItem>): Promise<EventItem> {
    if (MODE === "mock") return mockApi.updateEvent(id, payload);
    return http(`/events/${id}`, { method: "PUT", body: JSON.stringify(payload) });
  },
  async deleteEvent(id: string): Promise<{ ok: true }> {
    if (MODE === "mock") return mockApi.deleteEvent(id);
    return http(`/events/${id}`, { method: "DELETE" });
  },
  async myCompanyEvents(): Promise<EventItem[]> {
    if (MODE === "mock") return mockApi.myCompanyEvents();
    return http("/company/events");
  },
  async approveEvent(id: string): Promise<EventItem> {
    if (MODE === "mock") return mockApi.approveEvent(id);
    return http(`/admin/events/${id}/approve`, { method: "POST" });
  },
  async rejectEvent(id: string, reason: string): Promise<EventItem> {
    if (MODE === "mock") return mockApi.rejectEvent(id, reason);
    return http(`/admin/events/${id}/reject`, { method: "POST", body: JSON.stringify({ reason }) });
  },
  async adminListAllEvents(): Promise<EventItem[]> {
    if (MODE === "mock") return mockApi.adminListAllEvents();
    return http("/admin/events");
  },

  // ── Bookings ──────────────────────────────────────────────
  async bookEvent(event_id: string, coupon_code?: string): Promise<Booking> {
    if (MODE === "mock") return mockApi.bookEvent(event_id, coupon_code);
    return http("/bookings", { method: "POST", body: JSON.stringify({ event_id, coupon_code }) });
  },
  async myBookings(): Promise<Booking[]> {
    if (MODE === "mock") return mockApi.myBookings();
    return http("/bookings/me");
  },

  // ── Reviews ───────────────────────────────────────────────
  async getReviews(event_id: string): Promise<Review[]> {
    if (MODE === "mock") return mockApi.getReviews(event_id);
    return http(`/events/${event_id}/reviews`);
  },
  async submitReview(event_id: string, payload: { rating: number; comment: string }): Promise<Review> {
    if (MODE === "mock") return mockApi.submitReview(event_id, payload);
    return http(`/events/${event_id}/reviews`, { method: "POST", body: JSON.stringify(payload) });
  },

  // ── Coupons ───────────────────────────────────────────────
  async validateCoupon(code: string, event_id: string): Promise<{ valid: boolean; coupon?: Coupon; discounted_price?: number; message: string }> {
    if (MODE === "mock") return mockApi.validateCoupon(code, event_id);
    return http("/coupons/validate", { method: "POST", body: JSON.stringify({ code, event_id }) });
  },
  async createCoupon(payload: Omit<Coupon, "id" | "company_id" | "used_count">): Promise<Coupon> {
    if (MODE === "mock") return mockApi.createCoupon(payload);
    return http("/coupons", { method: "POST", body: JSON.stringify(payload) });
  },
  async myCoupons(): Promise<Coupon[]> {
    if (MODE === "mock") return mockApi.myCoupons();
    return http("/company/coupons");
  },
  async deleteCoupon(id: string): Promise<{ ok: true }> {
    if (MODE === "mock") return mockApi.deleteCoupon(id);
    return http(`/coupons/${id}`, { method: "DELETE" });
  },

  // ── Bookmarks ─────────────────────────────────────────────
  async toggleBookmark(event_id: string): Promise<{ bookmarked: boolean }> {
    if (MODE === "mock") return mockApi.toggleBookmark(event_id);
    return http(`/bookmarks/${event_id}`, { method: "POST" });
  },
  async myBookmarks(): Promise<string[]> {
    if (MODE === "mock") return mockApi.myBookmarks();
    return http("/bookmarks");
  },

  // ── Notifications ─────────────────────────────────────────
  async myNotifications(): Promise<Notification[]> {
    if (MODE === "mock") return mockApi.myNotifications();
    return http("/notifications");
  },
  async markNotificationRead(id: string): Promise<void> {
    if (MODE === "mock") return mockApi.markNotificationRead(id);
    return http(`/notifications/${id}/read`, { method: "POST" });
  },
  async markAllNotificationsRead(): Promise<void> {
    if (MODE === "mock") return mockApi.markAllNotificationsRead();
    return http("/notifications/read-all", { method: "POST" });
  },

  // ── Dashboards ────────────────────────────────────────────
  async dashboard() {
    if (MODE === "mock") return mockApi.dashboard();
    return http<{
      stats: { users: number; events: number; bookings: number; revenue: number; companies: number; pending_events: number };
      recent_bookings: Booking[];
      company_stats: Array<{ company: Company; events: number; bookings: number; revenue: number }>;
    }>("/dashboard");
  },
  async companyDashboard() {
    if (MODE === "mock") return mockApi.companyDashboard();
    return http<{
      stats: { events: number; bookings: number; revenue: number; seats_sold: number; pending: number; approved: number; rejected: number };
      events: EventItem[];
      recent_bookings: Booking[];
      plan: CompanyPlan | null;
    }>("/company/dashboard");
  },

  // ── Ticket validation ─────────────────────────────────────
  async validateTicket(qr_code: string) {
    if (MODE === "mock") return mockApi.validateTicket(qr_code);
    return http<{ valid: boolean; booking?: Booking; message: string }>("/bookings/validate", {
      method: "POST",
      body: JSON.stringify({ qr_code }),
    });
  },

  // ── Support ───────────────────────────────────────────────
  async submitSupportTicket(payload: { subject: string; message: string }): Promise<SupportTicket> {
    if (MODE === "mock") return mockApi.submitSupportTicket(payload);
    return http("/support", { method: "POST", body: JSON.stringify(payload) });
  },
  async mySupportTickets(): Promise<SupportTicket[]> {
    if (MODE === "mock") return mockApi.mySupportTickets();
    return http("/support/me");
  },
  async allSupportTickets(): Promise<SupportTicket[]> {
    if (MODE === "mock") return mockApi.allSupportTickets();
    return http("/support");
  },
  async updateSupportTicket(id: string, payload: { status?: SupportTicket["status"]; admin_reply?: string }): Promise<SupportTicket> {
    if (MODE === "mock") return mockApi.updateSupportTicket(id, payload);
    return http(`/support/${id}`, { method: "PUT", body: JSON.stringify(payload) });
  },

  // ── Admin ─────────────────────────────────────────────────
  async adminListCompanies(): Promise<Company[]> {
    if (MODE === "mock") return mockApi.adminListCompanies();
    return http("/admin/companies");
  },
  async adminUpdateCompany(id: string, payload: Partial<Company>): Promise<Company> {
    if (MODE === "mock") return mockApi.adminUpdateCompany(id, payload);
    return http(`/admin/companies/${id}`, { method: "PUT", body: JSON.stringify(payload) });
  },
  async adminListPlanPurchases(): Promise<CompanyPlan[]> {
    if (MODE === "mock") return mockApi.adminListPlanPurchases();
    return http("/admin/plan-purchases");
  },
};
