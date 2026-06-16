import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Mail } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { ToolShell, useAiError } from "@/components/tool-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { generateEmail } from "@/lib/ai.functions";
import { saveHistory } from "@/lib/history";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Email Generator — Workplace AI" },
      {
        name: "description",
        content: "Generate professional workplace emails with selectable tone.",
      },
    ],
  }),
  component: EmailPage,
});

type Tone = "Formal" | "Friendly" | "Persuasive";

function EmailPage() {
  const fn = useServerFn(generateEmail);
  const onError = useAiError();
  const [recipient, setRecipient] = useState("");
  const [purpose, setPurpose] = useState("");
  const [tone, setTone] = useState<Tone>("Formal");
  const [details, setDetails] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const run = async () => {
    if (!recipient.trim() || !purpose.trim()) {
      toast.error("Recipient and purpose are required.");
      return;
    }
    setLoading(true);
    try {
      const res = await fn({ data: { recipient, purpose, tone, details } });
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
      kind: "email",
      title: `Email to ${recipient || "recipient"} — ${purpose.slice(0, 60)}`,
      input: { recipient, purpose, tone, details },
      output,
    });
    toast.success("Saved to history");
  };

  return (
    <ToolShell
      title="Smart Email Generator"
      description="Draft professional workplace emails with the right tone in seconds."
      icon={<Mail className="h-5 w-5" />}
      loading={loading}
      output={output}
      onOutputChange={setOutput}
      onRegenerate={run}
      onSave={save}
      filename="email.txt"
      emptyHint="Fill in the form on the left and press Generate to draft an email."
      form={
        <>
          <div className="grid gap-2">
            <Label htmlFor="recipient">Recipient name</Label>
            <Input
              id="recipient"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="e.g. Sarah Chen"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="purpose">Email purpose</Label>
            <Input
              id="purpose"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="e.g. Request a project status update"
            />
          </div>
          <div className="grid gap-2">
            <Label>Tone</Label>
            <Select value={tone} onValueChange={(v) => setTone(v as Tone)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Formal">Formal</SelectItem>
                <SelectItem value="Friendly">Friendly</SelectItem>
                <SelectItem value="Persuasive">Persuasive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="details">Key information</Label>
            <Textarea
              id="details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Bullet points, context, deadlines, etc."
              rows={6}
            />
          </div>
          <Button onClick={run} disabled={loading} className="w-full">
            {loading ? "Generating…" : "Generate email"}
          </Button>
        </>
      }
    />
  );
}
