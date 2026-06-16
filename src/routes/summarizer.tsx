import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { FileText } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { ToolShell, useAiError } from "@/components/tool-shell";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { summarizeMeeting } from "@/lib/ai.functions";
import { saveHistory } from "@/lib/history";

export const Route = createFileRoute("/summarizer")({
  head: () => ({
    meta: [
      { title: "Meeting Summarizer — Workplace AI" },
      {
        name: "description",
        content: "Convert long meeting notes into a clear summary with decisions and action items.",
      },
    ],
  }),
  component: SummarizerPage,
});

function SummarizerPage() {
  const fn = useServerFn(summarizeMeeting);
  const onError = useAiError();
  const [notes, setNotes] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const run = async () => {
    if (notes.trim().length < 10) {
      toast.error("Paste your meeting notes first.");
      return;
    }
    setLoading(true);
    try {
      const res = await fn({ data: { notes } });
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
      kind: "summarizer",
      title: notes.slice(0, 80).replace(/\s+/g, " ").trim() || "Meeting summary",
      input: { notes },
      output,
    });
    toast.success("Saved to history");
  };

  return (
    <ToolShell
      title="Meeting Notes Summarizer"
      description="Paste raw meeting notes or a transcript. Get a clean summary, decisions, and actions."
      icon={<FileText className="h-5 w-5" />}
      loading={loading}
      output={output}
      onOutputChange={setOutput}
      onRegenerate={run}
      onSave={save}
      filename="meeting-summary.txt"
      emptyHint="Paste meeting notes on the left and press Summarize."
      form={
        <>
          <div className="grid gap-2">
            <Label htmlFor="notes">Meeting notes or transcript</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Paste your raw notes or transcript here…"
              rows={16}
              className="font-mono text-xs"
            />
          </div>
          <Button onClick={run} disabled={loading} className="w-full">
            {loading ? "Summarizing…" : "Summarize"}
          </Button>
        </>
      }
    />
  );
}
