import { createFileRoute } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { Plus, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "AI Chatbot — Workplace AI" },
      {
        name: "description",
        content: "Chat with your AI workplace copilot for drafts, brainstorming, and advice.",
      },
    ],
  }),
  component: ChatPage,
});

const STORAGE_KEY = "awpa.chat.v1";

function loadMessages(): UIMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as UIMessage[]) : [];
  } catch {
    return [];
  }
}

function ChatPage() {
  const [initial, setInitial] = useState<UIMessage[] | null>(null);
  useEffect(() => {
    setInitial(loadMessages());
    const onCleared = () => setInitial([]);
    window.addEventListener("awpa-chat-cleared", onCleared);
    return () => window.removeEventListener("awpa-chat-cleared", onCleared);
  }, []);

  if (!initial) {
    return <div className="flex-1" />;
  }
  return <ChatInner key={initial.length === 0 ? "fresh" : "loaded"} initial={initial} />;
}

function ChatInner({ initial }: { initial: UIMessage[] }) {
  const transport = useRef(new DefaultChatTransport({ api: "/api/chat" })).current;
  const { messages, sendMessage, status, setMessages } = useChat({
    transport,
    messages: initial,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (status === "ready") textareaRef.current?.focus();
  }, [status]);

  const handleSubmit = (msg: PromptInputMessage) => {
    if (!msg.text.trim()) return;
    sendMessage({ text: msg.text });
  };

  const newConversation = () => {
    setMessages([]);
    if (typeof window !== "undefined") window.localStorage.removeItem(STORAGE_KEY);
  };

  const isLoading = status === "submitted" || status === "streaming";

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <header className="flex items-center justify-between pb-4 border-b mb-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">AI Chatbot</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Your workplace copilot. History is saved in this browser.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={newConversation}>
          <Plus className="h-4 w-4 mr-1.5" /> New conversation
        </Button>
      </header>

      <Conversation className="flex-1 min-h-0">
        <ConversationContent>
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center px-6 py-16">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent text-primary mb-4">
                <Sparkles className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-medium">How can I help today?</h2>
              <p className="mt-1 text-sm text-muted-foreground max-w-md">
                Ask me to draft a message, brainstorm ideas, summarize an article, or explain a concept.
              </p>
            </div>
          )}

          {messages.map((message) => {
            const text = message.parts
              .map((p) => (p.type === "text" ? p.text : ""))
              .join("");
            return (
              <Message key={message.id} from={message.role}>
                <MessageContent>
                  {message.role === "assistant" ? (
                    <MessageResponse>{text}</MessageResponse>
                  ) : (
                    <span className="whitespace-pre-wrap">{text}</span>
                  )}
                </MessageContent>
              </Message>
            );
          })}

          {status === "submitted" && (
            <Message from="assistant">
              <MessageContent>
                <Shimmer>Thinking…</Shimmer>
              </MessageContent>
            </Message>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <PromptInput onSubmit={handleSubmit} className="mt-4">
        <PromptInputTextarea ref={textareaRef} placeholder="Ask Workplace AI anything…" />
        <PromptInputFooter className="justify-end">
          <PromptInputSubmit status={status} disabled={isLoading} />
        </PromptInputFooter>
      </PromptInput>

      <p className="text-xs text-muted-foreground text-center mt-2">
        AI may produce inaccurate information. Review before relying on it.
      </p>
    </div>
  );
}
