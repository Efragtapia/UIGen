"use client";

import { Sparkles, Zap, Wand2, CheckCircle2, Loader2 } from "lucide-react";
import type { ElementType } from "react";
import type { Message } from "ai";
import { cn } from "@/lib/utils";
import { useChat } from "@/lib/contexts/chat-context";

type StepStatus = "active" | "completed" | "upcoming";

const STEPS: { id: number; label: string; hint: string; Icon: ElementType }[] = [
  { id: 1, label: "Imagine It", hint: "Describe what you want",          Icon: Sparkles },
  { id: 2, label: "Build It",   hint: "Claude generates your component", Icon: Zap      },
  { id: 3, label: "Perfect It", hint: "Refine until it's just right",    Icon: Wand2    },
];

export function getStepStatuses(messages: Message[]): StepStatus[] {
  const userCount      = messages.filter(m => m.role === "user").length;
  const assistantCount = messages.filter(m => m.role === "assistant").length;

  if (assistantCount === 0)                  return ["active", "upcoming", "upcoming"];
  if (userCount <= 2 && assistantCount >= 1) return ["completed", "active", "upcoming"];
  return ["completed", "completed", "active"];
}

export function IterationTimeline() {
  const { messages, status } = useChat();
  const statuses = getStepStatuses(messages);
  const isStreaming = status === "streaming" || status === "submitted";

  return (
    <div className="absolute top-4 right-4 z-10">
      <div className="bg-white/90 backdrop-blur-md border border-neutral-200 shadow-lg rounded-2xl px-5 py-3 flex items-center">
        {STEPS.map((step, index) => {
          const stepStatus = statuses[index];
          const isActive   = stepStatus === "active";
          const isDone     = stepStatus === "completed";

          return (
            <div key={step.id} className="flex items-center">
              {/* Step card */}
              <div className="group hover:-translate-y-1 hover:scale-105 transition-all duration-200 cursor-default flex flex-col items-center gap-1 min-w-[64px]">
                {/* Icon circle with optional pulse ring */}
                <div className="relative flex items-center justify-center">
                  {/* Pulse ring for active step */}
                  {isActive && (
                    <span
                      className={cn(
                        "absolute inset-0 rounded-full bg-blue-400 opacity-30",
                        isStreaming ? "animate-ping" : "animate-pulse"
                      )}
                    />
                  )}

                  {/* Icon circle */}
                  <div
                    className={cn(
                      "relative w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300",
                      isDone   && "bg-emerald-500",
                      isActive && "bg-blue-600",
                      stepStatus === "upcoming" && "bg-neutral-100 border border-neutral-200"
                    )}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    ) : isActive && isStreaming ? (
                      <Loader2 className="w-4 h-4 text-white animate-spin" />
                    ) : (
                      <step.Icon
                        className={cn(
                          "w-4 h-4 transition-transform duration-200 group-hover:rotate-12",
                          isActive     ? "text-white" : "text-neutral-400"
                        )}
                      />
                    )}
                  </div>
                </div>

                {/* Label */}
                <span
                  className={cn(
                    "text-xs font-semibold leading-none",
                    isDone             && "text-emerald-600",
                    isActive           && "text-blue-600",
                    stepStatus === "upcoming" && "text-neutral-400"
                  )}
                >
                  {step.label}
                </span>

                {/* Hint */}
                <span className="text-[10px] text-neutral-400 leading-none text-center">
                  {step.hint}
                </span>
              </div>

              {/* Connector between steps */}
              {index < STEPS.length - 1 && (
                <div className="relative w-10 h-0.5 bg-neutral-200 mx-1 rounded-full flex-shrink-0">
                  <div
                    className={cn(
                      "absolute inset-y-0 left-0 rounded-full bg-blue-500 transition-all duration-500",
                      statuses[index] === "completed" ? "w-full" : "w-0"
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
