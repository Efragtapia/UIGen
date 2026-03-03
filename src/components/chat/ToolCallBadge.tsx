"use client";

import {
  Loader2,
  CheckCircle2,
  FilePlus2,
  PenLine,
  Eye,
  Undo2,
  FolderInput,
  Trash2,
} from "lucide-react";
import type { ElementType } from "react";

export interface ToolCallBadgeProps {
  toolInvocation: {
    toolName: string;
    args: Record<string, unknown>;
    state: string;
    result?: unknown;
  };
}

type OperationInfo = {
  Icon: ElementType<{ className?: string }>;
  label: string;
  doneLabel: string;
};

export function getFileName(path: string): string {
  return path.split("/").pop() || path;
}

export function getOperationInfo(
  toolName: string,
  args: Record<string, unknown>
): OperationInfo {
  if (toolName === "str_replace_editor") {
    const file = getFileName((args.path as string) ?? "");

    switch (args.command) {
      case "create":
        return {
          Icon: FilePlus2,
          label: `Bringing ${file} to life...`,
          doneLabel: `${file} created!`,
        };
      case "str_replace":
        return {
          Icon: PenLine,
          label: `Polishing the code in ${file}...`,
          doneLabel: `${file} updated!`,
        };
      case "insert":
        return {
          Icon: PenLine,
          label: `Sneaking new code into ${file}...`,
          doneLabel: `${file} expanded!`,
        };
      case "view":
        return {
          Icon: Eye,
          label: `Peeking at ${file}...`,
          doneLabel: `Read ${file}`,
        };
      case "undo_edit":
        return {
          Icon: Undo2,
          label: `Rewinding ${file} through time...`,
          doneLabel: `${file} restored!`,
        };
    }
  }

  if (toolName === "file_manager") {
    const file = getFileName((args.path as string) ?? "");

    switch (args.command) {
      case "rename": {
        const newFile = getFileName((args.new_path as string) ?? "");
        return {
          Icon: FolderInput,
          label: `Renaming ${file} → ${newFile}...`,
          doneLabel: `Moved to ${newFile}!`,
        };
      }
      case "delete":
        return {
          Icon: Trash2,
          label: `Saying farewell to ${file}...`,
          doneLabel: `${file} deleted`,
        };
    }
  }

  return {
    Icon: PenLine,
    label: toolName,
    doneLabel: toolName,
  };
}

export function ToolCallBadge({ toolInvocation }: ToolCallBadgeProps) {
  const { toolName, args, state } = toolInvocation;
  const isDone = state === "result";
  const { Icon, label, doneLabel } = getOperationInfo(toolName, args);

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs border border-neutral-200">
      {isDone ? (
        <CheckCircle2 className="w-3 h-3 text-emerald-500 flex-shrink-0" />
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600 flex-shrink-0" />
      )}
      <Icon className="w-3 h-3 text-neutral-500 flex-shrink-0" />
      <span className="text-neutral-700">{isDone ? doneLabel : label}</span>
    </div>
  );
}
