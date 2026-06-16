## AI Workplace Productivity Assistant

A clean, Notion-inspired SaaS dashboard with 5 AI-powered tools. No login, all data saved in the browser.

### Stack & backend
- TanStack Start + Tailwind + shadcn
- Lovable AI Gateway (`google/gemini-3-flash-preview`) via server functions — no API key needed from user
- Chat streaming via `/api/chat` route with AI Elements
- All history (chats, generated emails, summaries, plans, research) saved in `localStorage`

### Routes
- `/` — Dashboard (stat cards: emails, summaries, plans, research counts + recent activity)
- `/email` — Smart Email Generator
- `/summarizer` — Meeting Notes Summarizer
- `/planner` — AI Task Planner
- `/research` — AI Research Assistant
- `/chat` — AI Chatbot (single conversation, localStorage)
- `/history` — All saved outputs across tools
- `/settings` — Theme toggle, clear all data, responsible-AI disclaimer

### Shared layout
- Collapsible shadcn Sidebar (icon mode on collapse, hamburger sheet on mobile)
- Header with sidebar trigger + page title
- Two-column workspace pattern on tool pages: inputs left, editable AI output right with Copy / Regenerate / Save / Download (txt) buttons
- Responsible AI disclaimer banner in footer of each tool page

### Tool pages (same shape, different prompts)
Each tool has:
- Zod-validated form on the left
- Server function `generate*` calling Lovable AI (one-shot `generateText`) with the structured prompt from the brief
- Editable textarea/markdown output on the right
- Save → localStorage history; toast on rate-limit (429) / credits (402) errors

### Chatbot
- AI Elements (`conversation`, `message`, `prompt-input`, `shimmer`)
- `useChat` with `DefaultChatTransport` → `/api/chat` streaming route
- Single conversation persisted to localStorage; "New conversation" button clears
- Textarea auto-focused; `message.parts` rendering; markdown via MessageResponse

### Design (Notion-clean light)
- Background `#ffffff` / surface `#f7f7f5`, text `#2f3437`, accent `#2383e2`
- Typography: Inter-alternative pairing — using "outfit-figtree" style (clean sans), generous spacing, subtle borders, no gradients
- Card-based dashboard, soft shadows, rounded-lg

### Out of scope (per user choices)
- No auth, no database, no PDF/DOCX export (TXT only), no cross-device sync
