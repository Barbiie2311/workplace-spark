import { useEffect, useState } from "react";

export type ToolKind = "email" | "summarizer" | "planner" | "research";

export interface HistoryEntry {
  id: string;
  kind: ToolKind;
  title: string;
  input: Record<string, string>;
  output: string;
  createdAt: number;
}

const KEY = "awpa.history.v1";

function read(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as HistoryEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(entries: HistoryEntry[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(entries));
  window.dispatchEvent(new Event("awpa-history-changed"));
}

export function saveHistory(entry: Omit<HistoryEntry, "id" | "createdAt">) {
  const next: HistoryEntry = {
    ...entry,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
  };
  const entries = [next, ...read()].slice(0, 200);
  write(entries);
  return next;
}

export function deleteHistory(id: string) {
  write(read().filter((e) => e.id !== id));
}

export function clearAllHistory() {
  write([]);
  if (typeof window !== "undefined") {
    window.localStorage.removeItem("awpa.chat.v1");
    window.dispatchEvent(new Event("awpa-chat-cleared"));
  }
}

export function useHistory() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  useEffect(() => {
    const refresh = () => setEntries(read());
    refresh();
    window.addEventListener("awpa-history-changed", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("awpa-history-changed", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);
  return entries;
}

export const TOOL_LABEL: Record<ToolKind, string> = {
  email: "Email",
  summarizer: "Meeting Summary",
  planner: "Task Plan",
  research: "Research Brief",
};
