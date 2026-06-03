<div align="center">
  <h1>🪐 EventSpheres</h1>
  <p><i>The next-generation platform for discovering, creating, and experiencing unforgettable events.</i></p>
</div>

---

## 🚀 What is EventSpheres?

**EventSpheres** is a modern digital ecosystem designed to bridge the gap between event organizers and attendees. Whether it's a local tech meetup, a massive music festival, or a virtual webinar, EventSpheres provides an intuitive and vibrant space to make it happen flawlessly.

## ✨ Core Highlights

- 🎟️ **Frictionless Ticketing:** Quick RSVPs, secure checkouts, and easy ticket management.
- 📊 **Organizer Hub:** A powerful dashboard for tracking registrations, analytics, and event metrics.
- 🔍 **Smart Discovery:** Advanced search and filtering to find the perfect events based on your interests.
- 📱 **Mobile-First Experience:** A highly responsive design that looks and feels native on any device.

## 💻 Under the Hood

We built EventSpheres prioritizing speed, scalability, and an exceptional developer experience:

- **Frontend Core:** React, TypeScript, Vite
- **UI & Styling:** Tailwind CSS, shadcn/ui 
- **Routing:** TanStack Router
- **Package Manager:** Bun 

## 📂 Directory Layout

```text
Eventspheres/
├── public/          # Static assets (favicons, etc.)
├── src/
│   ├── assets/      # Media files and global stylesheets
│   ├── components/  # Modular UI components (Cards, Modals, Navbar)
│   ├── pages/       # Route-specific views (Home, Dashboard, Event Details)
│   ├── hooks/       # Reusable React logic
│   ├── lib/         # API integrations and utility functions
│   └── main.tsx     # Application entry point
├── tailwind.config.js
└── package.json

```
⚡ Quick Start Guide
Want to run EventSpheres on your local machine? Just follow these steps:

1. Clone the repository
git clone [https://github.com/Liejox/Eventspheres.git](https://github.com/Liejox/Eventspheres.git)

2. Navigate into the project directory
cd Eventspheres

3. Install the dependencies (Bun is recommended for speed!)
bun install

4. Fire up the development server
bun run dev

Boom! 💥 Your app is now live at http://localhost:5173.

🌍 Ready to Ship?
When you are ready to take your project live, build the optimized production bundle:

bun run build
bun run preview

You can deploy the generated dist/ directory to platforms like Vercel, Cloudflare Pages, or Netlify in seconds.

🤝 Get Involved
Got an idea to make EventSpheres even better? Contributions are always welcome!

Fork the repo.

Create a feature branch (git checkout -b feature/AmazingIdea).

Commit your changes.

Open a Pull Request!

Built with ❤️ for the event community.
