import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolCallBadge, getFileName, getOperationInfo } from "../ToolCallBadge";

afterEach(() => {
  cleanup();
});

// ─── getFileName ──────────────────────────────────────────────────────────────

test("getFileName extracts the filename from a nested path", () => {
  expect(getFileName("src/components/Button.tsx")).toBe("Button.tsx");
});

test("getFileName returns the value as-is when there is no slash", () => {
  expect(getFileName("App.jsx")).toBe("App.jsx");
});

test("getFileName handles an empty string", () => {
  expect(getFileName("")).toBe("");
});

// ─── getOperationInfo — str_replace_editor ────────────────────────────────────

test("getOperationInfo returns create messages for str_replace_editor create", () => {
  const info = getOperationInfo("str_replace_editor", {
    command: "create",
    path: "src/App.jsx",
  });
  expect(info.label).toContain("App.jsx");
  expect(info.label).toContain("life");
  expect(info.doneLabel).toContain("App.jsx");
  expect(info.doneLabel).toContain("created");
});

test("getOperationInfo returns edit messages for str_replace_editor str_replace", () => {
  const info = getOperationInfo("str_replace_editor", {
    command: "str_replace",
    path: "src/Button.tsx",
  });
  expect(info.label).toContain("Button.tsx");
  expect(info.doneLabel).toContain("Button.tsx");
  expect(info.doneLabel).toContain("updated");
});

test("getOperationInfo returns insert messages for str_replace_editor insert", () => {
  const info = getOperationInfo("str_replace_editor", {
    command: "insert",
    path: "src/Card.tsx",
  });
  expect(info.label).toContain("Card.tsx");
  expect(info.doneLabel).toContain("Card.tsx");
  expect(info.doneLabel).toContain("expanded");
});

test("getOperationInfo returns view messages for str_replace_editor view", () => {
  const info = getOperationInfo("str_replace_editor", {
    command: "view",
    path: "src/index.css",
  });
  expect(info.label).toContain("index.css");
  expect(info.doneLabel).toContain("index.css");
});

test("getOperationInfo returns undo messages for str_replace_editor undo_edit", () => {
  const info = getOperationInfo("str_replace_editor", {
    command: "undo_edit",
    path: "src/App.jsx",
  });
  expect(info.label).toContain("App.jsx");
  expect(info.doneLabel).toContain("restored");
});

// ─── getOperationInfo — file_manager ─────────────────────────────────────────

test("getOperationInfo returns rename messages for file_manager rename", () => {
  const info = getOperationInfo("file_manager", {
    command: "rename",
    path: "src/OldName.tsx",
    new_path: "src/NewName.tsx",
  });
  expect(info.label).toContain("OldName.tsx");
  expect(info.label).toContain("NewName.tsx");
  expect(info.doneLabel).toContain("NewName.tsx");
});

test("getOperationInfo returns delete messages for file_manager delete", () => {
  const info = getOperationInfo("file_manager", {
    command: "delete",
    path: "src/Unused.tsx",
  });
  expect(info.label).toContain("Unused.tsx");
  expect(info.doneLabel).toContain("Unused.tsx");
  expect(info.doneLabel).toContain("deleted");
});

// ─── getOperationInfo — fallback ──────────────────────────────────────────────

test("getOperationInfo falls back to toolName for unknown tools", () => {
  const info = getOperationInfo("some_unknown_tool", { command: "foo" });
  expect(info.label).toBe("some_unknown_tool");
  expect(info.doneLabel).toBe("some_unknown_tool");
});

// ─── ToolCallBadge rendering ──────────────────────────────────────────────────

test("ToolCallBadge shows the loading label when state is call", () => {
  render(
    <ToolCallBadge
      toolInvocation={{
        toolName: "str_replace_editor",
        args: { command: "create", path: "src/Button.tsx" },
        state: "call",
      }}
    />
  );
  expect(screen.getByText(/Button\.tsx/)).toBeDefined();
  expect(screen.getByText(/life/)).toBeDefined();
});

test("ToolCallBadge shows the done label when state is result", () => {
  render(
    <ToolCallBadge
      toolInvocation={{
        toolName: "str_replace_editor",
        args: { command: "create", path: "src/Button.tsx" },
        state: "result",
        result: "ok",
      }}
    />
  );
  expect(screen.getByText(/Button\.tsx/)).toBeDefined();
  expect(screen.getByText(/created/)).toBeDefined();
});

test("ToolCallBadge shows the loading label when state is partial-call", () => {
  render(
    <ToolCallBadge
      toolInvocation={{
        toolName: "str_replace_editor",
        args: { command: "str_replace", path: "src/App.jsx" },
        state: "partial-call",
      }}
    />
  );
  expect(screen.getByText(/App\.jsx/)).toBeDefined();
});

test("ToolCallBadge displays a friendly message for file_manager delete while loading", () => {
  render(
    <ToolCallBadge
      toolInvocation={{
        toolName: "file_manager",
        args: { command: "delete", path: "src/components/OldCard.tsx" },
        state: "call",
      }}
    />
  );
  expect(screen.getByText(/OldCard\.tsx/)).toBeDefined();
  expect(screen.getByText(/farewell/i)).toBeDefined();
});

test("ToolCallBadge displays a done message for file_manager rename", () => {
  render(
    <ToolCallBadge
      toolInvocation={{
        toolName: "file_manager",
        args: {
          command: "rename",
          path: "src/OldName.tsx",
          new_path: "src/NewName.tsx",
        },
        state: "result",
        result: { success: true },
      }}
    />
  );
  expect(screen.getByText(/NewName\.tsx/)).toBeDefined();
});

test("ToolCallBadge extracts just the filename from a deep path", () => {
  render(
    <ToolCallBadge
      toolInvocation={{
        toolName: "str_replace_editor",
        args: { command: "view", path: "src/components/ui/deep/MyFile.tsx" },
        state: "call",
      }}
    />
  );
  expect(screen.getByText(/MyFile\.tsx/)).toBeDefined();
  // Full path should not appear
  expect(screen.queryByText(/src\/components/)).toBeNull();
});
