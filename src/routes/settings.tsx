import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { clearAllHistory } from "@/lib/history";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Workplace AI" },
      { name: "description", content: "Theme preferences and data controls." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem("awpa.theme") === "dark";
    setDark(stored);
    document.documentElement.classList.toggle("dark", stored);
  }, []);

  const toggle = (v: boolean) => {
    setDark(v);
    document.documentElement.classList.toggle("dark", v);
    window.localStorage.setItem("awpa.theme", v ? "dark" : "light");
  };

  const clearAll = () => {
    if (!confirm("Delete all saved history and chat? This cannot be undone.")) return;
    clearAllHistory();
    toast.success("All data cleared.");
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Preferences and data controls.</p>
      </header>

      <Card className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base">Dark mode</Label>
            <p className="text-sm text-muted-foreground mt-1">Switch the interface theme.</p>
          </div>
          <Switch checked={dark} onCheckedChange={toggle} />
        </div>
      </Card>

      <Card className="p-5">
        <Label className="text-base">Your data</Label>
        <p className="text-sm text-muted-foreground mt-1">
          All saved outputs and chat history are stored only in this browser. No account, no server
          storage.
        </p>
        <Button variant="destructive" className="mt-4" onClick={clearAll}>
          Clear all saved data
        </Button>
      </Card>

      <Card className="p-5">
        <Label className="text-base">Responsible AI</Label>
        <div className="mt-2 text-sm text-muted-foreground space-y-2">
          <p>
            AI-generated content may contain errors, inaccuracies, or incomplete information. Always
            review outputs before sending or using them in official documentation.
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Do not share confidential information.</li>
            <li>Verify AI-generated facts.</li>
            <li>Maintain human oversight.</li>
            <li>Review outputs before sending.</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}
