import { Copy, Download, RefreshCw, Save, Sparkles } from "lucide-react";
import { type ReactNode, useState } from "react";
import ReactMarkdown from "react-markdown";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface ToolShellProps {
  title: string;
  description: string;
  icon: ReactNode;
  form: ReactNode;
  loading: boolean;
  output: string;
  onOutputChange: (v: string) => void;
  onRegenerate: () => void;
  onSave?: () => void;
  filename: string;
  emptyHint: string;
}

export function ToolShell({
  title,
  description,
  icon,
  form,
  loading,
  output,
  onOutputChange,
  onRegenerate,
  onSave,
  filename,
  emptyHint,
}: ToolShellProps) {
  const [editing, setEditing] = useState(false);

  const copy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    toast.success("Copied to clipboard");
  };

  const download = () => {
    if (!output) return;
    const blob = new Blob([output], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
          {icon}
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        <Card className="p-5 h-fit">
          <div className="flex flex-col gap-4">{form}</div>
        </Card>

        <Card className="p-5 flex flex-col min-h-[520px]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Sparkles className="h-4 w-4 text-primary" />
              AI Output
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" onClick={() => setEditing((v) => !v)} disabled={!output}>
                {editing ? "Preview" : "Edit"}
              </Button>
              <Button variant="ghost" size="sm" onClick={copy} disabled={!output}>
                <Copy className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={download} disabled={!output}>
                <Download className="h-4 w-4" />
              </Button>
              {onSave && (
                <Button variant="ghost" size="sm" onClick={onSave} disabled={!output}>
                  <Save className="h-4 w-4" />
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={onRegenerate} disabled={loading}>
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>

          {loading && !output ? (
            <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <Sparkles className="h-4 w-4 animate-pulse text-primary" />
                Generating…
              </span>
            </div>
          ) : output ? (
            editing ? (
              <Textarea
                value={output}
                onChange={(e) => onOutputChange(e.target.value)}
                className="flex-1 min-h-[400px] font-mono text-sm resize-none"
              />
            ) : (
              <div className="flex-1 prose prose-sm max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-p:leading-relaxed prose-pre:bg-muted">
                <ReactMarkdown>{output}</ReactMarkdown>
              </div>
            )
          ) : (
            <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground text-center px-6">
              {emptyHint}
            </div>
          )}
        </Card>
      </div>

      <p className="text-xs text-muted-foreground border-t pt-3">
        AI-generated content may contain errors. Review and verify before using for business communication
        or decision-making.
      </p>
    </div>
  );
}

export function useAiError() {
  return (err: unknown) => {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("429")) toast.error("Rate limit reached. Please try again in a moment.");
    else if (msg.includes("402"))
      toast.error("AI credits exhausted. Add credits in your workspace billing.");
    else toast.error(msg || "Something went wrong.");
  };
}
