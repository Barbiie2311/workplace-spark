import { createFileRoute } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deleteHistory, TOOL_LABEL, useHistory, type HistoryEntry } from "@/lib/history";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "History — Workplace AI" },
      { name: "description", content: "Saved emails, summaries, plans, and research briefings." },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const entries = useHistory();
  const [selected, setSelected] = useState<HistoryEntry | null>(null);

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">History</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Saved outputs from your AI tools. Stored locally in this browser.
        </p>
      </header>

      {entries.length === 0 ? (
        <Card className="p-10 text-center text-sm text-muted-foreground">
          Nothing here yet. Save an output from any tool to see it in history.
        </Card>
      ) : (
        <Card className="divide-y">
          {entries.map((e) => (
            <div
              key={e.id}
              className="flex items-center gap-3 px-4 py-3 hover:bg-accent/40 cursor-pointer"
              onClick={() => setSelected(e)}
            >
              <div className="flex-1 min-w-0">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  {TOOL_LABEL[e.kind]}
                </div>
                <div className="truncate text-sm font-medium">{e.title}</div>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {new Date(e.createdAt).toLocaleString()}
              </span>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={(ev) => {
                  ev.stopPropagation();
                  deleteHistory(e.id);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </Card>
      )}

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selected?.title}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown>{selected.output}</ReactMarkdown>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
