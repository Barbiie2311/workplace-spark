import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { ToolShell, useAiError } from "@/components/tool-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { researchTopic } from "@/lib/ai.functions";
import { saveHistory } from "@/lib/history";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "Research Assistant — Workplace AI" },
      {
        name: "description",
        content: "Generate balanced briefings with insights, risks, and opportunities.",
      },
    ],
  }),
  component: ResearchPage,
});

function ResearchPage() {
  const fn = useServerFn(researchTopic);
  const onError = useAiError();
  const [topic, setTopic] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const run = async () => {
    if (topic.trim().length < 2) {
      toast.error("Enter a research topic.");
      return;
    }
    setLoading(true);
    try {
      const res = await fn({ data: { topic } });
      setOutput(res.text);
    } catch (e) {
      onError(e);
    } finally {
      setLoading(false);
    }
  };

  const save = () => {
    if (!output) return;
    saveHistory({
      kind: "research",
      title: topic.slice(0, 80),
      input: { topic },
      output,
    });
    toast.success("Saved to history");
  };

  return (
    <ToolShell
      title="AI Research Assistant"
      description="Get a structured briefing on any topic with insights, risks, and opportunities."
      icon={<Search className="h-5 w-5" />}
      loading={loading}
      output={output}
      onOutputChange={setOutput}
      onRegenerate={run}
      onSave={save}
      filename="research-brief.txt"
      emptyHint="Enter a research topic on the left and press Research."
      form={
        <>
          <div className="grid gap-2">
            <Label htmlFor="topic">Research topic</Label>
            <Input
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. AI adoption trends in B2B SaaS 2025"
              onKeyDown={(e) => {
                if (e.key === "Enter") run();
              }}
            />
            <p className="text-xs text-muted-foreground">
              Tip: be specific. Add a domain, timeframe, or audience.
            </p>
          </div>
          <Button onClick={run} disabled={loading} className="w-full">
            {loading ? "Researching…" : "Research topic"}
          </Button>
        </>
      }
    />
  );
}
