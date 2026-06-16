import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Mail,
  FileText,
  ListChecks,
  Search,
  MessageCircle,
  ArrowRight,
  Sparkles,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useHistory, TOOL_LABEL } from "@/lib/history";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Workplace AI" },
      {
        name: "description",
        content:
          "Your AI productivity command center. Generate emails, summarize meetings, plan tasks, and research topics in seconds.",
      },
    ],
  }),
  component: Dashboard,
});

const tools = [
  {
    href: "/email",
    title: "Smart Email Generator",
    description: "Draft polished workplace emails in any tone.",
    icon: Mail,
  },
  {
    href: "/summarizer",
    title: "Meeting Summarizer",
    description: "Turn long notes into decisions, actions, and deadlines.",
    icon: FileText,
  },
  {
    href: "/planner",
    title: "AI Task Planner",
    description: "Convert goals into structured daily and weekly plans.",
    icon: ListChecks,
  },
  {
    href: "/research",
    title: "Research Assistant",
    description: "Generate insight briefings on any topic.",
    icon: Search,
  },
  {
    href: "/chat",
    title: "AI Chatbot",
    description: "Ask anything, brainstorm, or get advice.",
    icon: MessageCircle,
  },
] as const;

function Dashboard() {
  const history = useHistory();
  const counts = {
    email: history.filter((h) => h.kind === "email").length,
    summarizer: history.filter((h) => h.kind === "summarizer").length,
    planner: history.filter((h) => h.kind === "planner").length,
    research: history.filter((h) => h.kind === "research").length,
  };
  const recent = history.slice(0, 5);

  return (
    <div className="flex flex-col gap-8">
      <header>
        <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-2.5 py-1 text-xs text-muted-foreground">
          <Sparkles className="h-3 w-3 text-primary" />
          Powered by Lovable AI
        </div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Good to see you.</h1>
        <p className="mt-1 text-muted-foreground">
          Pick a tool below to automate routine workplace tasks with AI.
        </p>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Emails generated" value={counts.email} />
        <StatCard label="Meetings summarized" value={counts.summarizer} />
        <StatCard label="Plans created" value={counts.planner} />
        <StatCard label="Research briefs" value={counts.research} />
      </section>

      <section>
        <h2 className="text-sm font-medium text-muted-foreground mb-3">Tools</h2>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {tools.map((t) => (
            <Link key={t.href} to={t.href} className="group">
              <Card className="p-5 h-full transition-colors hover:border-primary/40 hover:bg-accent/40">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-accent text-accent-foreground">
                    <t.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{t.title}</h3>
                      <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{t.description}</p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-muted-foreground">Recent activity</h2>
          {recent.length > 0 && (
            <Button variant="ghost" size="sm" asChild>
              <Link to="/history">View all</Link>
            </Button>
          )}
        </div>
        {recent.length === 0 ? (
          <Card className="p-8 text-center text-sm text-muted-foreground">
            No saved outputs yet. Generate something with a tool to see it here.
          </Card>
        ) : (
          <Card className="divide-y">
            {recent.map((h) => (
              <Link
                key={h.id}
                to="/history"
                className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-accent/40"
              >
                <div className="min-w-0">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">
                    {TOOL_LABEL[h.kind]}
                  </div>
                  <div className="truncate text-sm">{h.title}</div>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {new Date(h.createdAt).toLocaleString()}
                </span>
              </Link>
            ))}
          </Card>
        )}
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card className="p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-semibold tracking-tight">{value}</div>
    </Card>
  );
}
