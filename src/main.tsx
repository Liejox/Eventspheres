import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Migrate: clear old event data so new richer seed (with price, map_link) loads
const SEED_VERSION = "v3";
if (localStorage.getItem("sep_seed_version") !== SEED_VERSION) {
  localStorage.removeItem("sep_mock_events");
  localStorage.removeItem("sep_mock_support");
  localStorage.removeItem("sep_mock_companies");
  localStorage.removeItem("sep_mock_plans");
  localStorage.removeItem("sep_mock_company_plans");
  localStorage.removeItem("sep_mock_users");
  localStorage.setItem("sep_seed_version", SEED_VERSION);
}

createRoot(document.getElementById("root")!).render(<App />);
