import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";

import { CHAT_MODEL, createLovableAiGatewayProvider } from "./ai-gateway.server";

function getGateway() {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY");
  return createLovableAiGatewayProvider(key);
}

async function runPrompt(system: string, prompt: string) {
  const gateway = getGateway();
  const { text } = await generateText({
    model: gateway(CHAT_MODEL),
    system,
    prompt,
  });
  return { text };
}

const EmailInput = z.object({
  recipient: z.string().min(1).max(120),
  purpose: z.string().min(1).max(500),
  tone: z.enum(["Formal", "Friendly", "Persuasive"]),
  details: z.string().max(2000).optional().default(""),
});

export const generateEmail = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => EmailInput.parse(d))
  .handler(async ({ data }) => {
    const prompt = `Generate a professional workplace email.

Recipient: ${data.recipient}
Purpose: ${data.purpose}
Tone: ${data.tone}
Key Information: ${data.details || "(none provided)"}

Requirements:
- Professional structure
- Appropriate greeting
- Clear, well-organized message
- Professional closing
- Include a subject line on the first line prefixed with "Subject: "`;
    return runPrompt(
      "You are an expert business communication assistant who writes clear, polished workplace emails.",
      prompt,
    );
  });

const SummarizeInput = z.object({
  notes: z.string().min(10).max(20000),
});

export const summarizeMeeting = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => SummarizeInput.parse(d))
  .handler(async ({ data }) => {
    const prompt = `Summarize the following meeting notes.

Provide the result in clear markdown with these sections:
## Executive Summary
## Key Decisions
## Action Items (with owners if mentioned)
## Deadlines

Meeting Notes:
${data.notes}`;
    return runPrompt(
      "You are a meticulous executive assistant who turns raw meeting notes into crisp, actionable summaries.",
      prompt,
    );
  });

const PlannerInput = z.object({
  goal: z.string().min(1).max(500),
  priority: z.enum(["Low", "Medium", "High"]),
  deadline: z.string().min(1).max(100),
});

export const planTasks = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => PlannerInput.parse(d))
  .handler(async ({ data }) => {
    const prompt = `Create a structured task plan.

Goal: ${data.goal}
Priority: ${data.priority}
Deadline: ${data.deadline}

Return markdown with:
## Overview
A 1-2 sentence framing.

## Tasks
A numbered checklist (use "- [ ] Task — ~estimated duration — priority"). Order by what should be done first.

## Suggested Schedule
A short day-by-day or week-by-week schedule fitting the deadline.

## Risks & Tips
2-3 brief notes.`;
    return runPrompt(
      "You are a productivity coach who builds realistic, prioritized task plans for busy professionals.",
      prompt,
    );
  });

const ResearchInput = z.object({
  topic: z.string().min(2).max(500),
});

export const researchTopic = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => ResearchInput.parse(d))
  .handler(async ({ data }) => {
    const prompt = `Research the following topic and produce a professional briefing.

Topic: ${data.topic}

Return markdown with:
## Summary
## Key Insights (bullets)
## Recommendations (bullets)
## Risks (bullets)
## Opportunities (bullets)

Keep it factual, balanced, and concise.`;
    return runPrompt(
      "You are a senior research analyst who produces balanced, structured topic briefings.",
      prompt,
    );
  });
