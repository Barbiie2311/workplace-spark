import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ListChecks } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { ToolShell, useAiError } from "@/components/tool-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { planTasks } from "@/lib/ai.functions";
import { saveHistory } from "@/lib/history";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "Task Planner — Workplace AI" },
      {
        name: "description",
        content: "Turn a goal and deadline into a prioritized, structured plan.",
      },
    ],
  }),
  component: PlannerPage,
});

type Priority = "Low" | "Medium" | "High";

function PlannerPage() {
  const fn = useServerFn(planTasks);
  const onError = useAiError();
  const [goal, setGoal] = useState("");
  const [priority, setPriority] = useState<Priority>("Medium");
  const [deadline, setDeadline] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const run = async () => {
    if (!goal.trim() || !deadline.trim()) {
      toast.error("Goal and deadline are required.");
      return;
    }
    setLoading(true);
    try {
      const res = await fn({ data: { goal, priority, deadline } });
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
      kind: "planner",
      title: goal.slice(0, 80),
      input: { goal, priority, deadline },
      output,
    });
    toast.success("Saved to history");
  };

  return (
    <ToolShell
      title="AI Task Planner"
      description="Describe a goal and deadline. Get a prioritized schedule with estimates."
      icon={<ListChecks className="h-5 w-5" />}
      loading={loading}
      output={output}
      onOutputChange={setOutput}
      onRegenerate={run}
      onSave={save}
      filename="task-plan.txt"
      emptyHint="Describe a goal on the left and press Plan."
      form={
        <>
          <div className="grid gap-2">
            <Label htmlFor="goal">Goal</Label>
            <Textarea
              id="goal"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g. Launch the new pricing page"
              rows={4}
            />
          </div>
          <div className="grid gap-2">
            <Label>Priority</Label>
            <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="deadline">Deadline</Label>
            <Input
              id="deadline"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              placeholder="e.g. Next Friday, or 2 weeks"
            />
          </div>
          <Button onClick={run} disabled={loading} className="w-full">
            {loading ? "Planning…" : "Generate plan"}
          </Button>
        </>
      }
    />
  );
}
