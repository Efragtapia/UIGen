# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run setup        # First-time: install deps, generate Prisma client, run migrations
npm run dev          # Start dev server at http://localhost:3000
npm run build        # Production build
npm run lint         # ESLint
npm run test         # Run all tests (Vitest)
npx vitest run src/path/to/__tests__/file.test.ts  # Run a single test file
npm run db:reset     # Reset and re-migrate the SQLite database
```

The dev server requires `NODE_OPTIONS='--require ./node-compat.cjs'` (already included in scripts) for Turbopack compatibility.

## Architecture Overview

UIGen is a Next.js 15 App Router application where Claude AI generates React components into an **in-memory virtual file system**, which is then transformed and rendered in a sandboxed iframe for live preview.

### Core Data Flow

1. User sends a message → `ChatContext` (wrapping Vercel AI SDK's `useChat`) POSTs to `/api/chat/route.ts`
2. The route sends the system prompt + messages + serialized VFS to Claude with two tools: `str_replace_editor` and `file_manager`
3. Claude streams tool calls back; client-side `FileSystemContext.handleToolCall()` applies them to the in-memory `VirtualFileSystem`
4. `refreshTrigger` increments → `PreviewFrame` re-renders by transforming JSX via Babel standalone into importmap-based ES modules in an iframe
5. On stream completion, the project (messages + VFS) is serialized to JSON and saved to SQLite via Prisma

### Key Modules

**`src/lib/file-system.ts`** — `VirtualFileSystem` class: all file operations (create, update, delete, rename, str-replace, insert). Nothing writes to disk. Serializes to/from JSON for DB persistence.

**`src/lib/contexts/file-system-context.tsx`** — React context wrapping the VFS instance. Owns `handleToolCall()` which routes AI tool calls to VFS operations and triggers preview refresh.

**`src/lib/contexts/chat-context.tsx`** — Wraps `useChat` from Vercel AI SDK, attaches `onToolCall` callback, tracks anonymous session work.

**`src/app/api/chat/route.ts`** — The AI endpoint. Reconstructs a VFS from the request payload, configures Claude tools (Zod schemas), streams via `streamText()`, and persists state on finish.

**`src/lib/transform/jsx-transformer.ts`** — Babel-based JSX transformer. Resolves `@/` alias imports to blob URLs from the VFS, falls back to `esm.sh` for third-party packages. Injects Tailwind CDN and collects CSS files.

**`src/lib/provider.ts`** — Returns either `@ai-sdk/anthropic` (Claude Haiku 4.5) or a `MockLanguageModel` when `ANTHROPIC_API_KEY` is absent. The mock simulates tool-based component generation.

**`src/lib/prompts/generation.tsx`** — System prompt for Claude: use Tailwind (no inline styles), write to VFS via tools, use `App.jsx` as entry point, keep `@/` imports.

**`src/lib/auth.ts`** — JWT sessions via `jose`. HttpOnly cookie, 7-day expiry.

**`src/actions/`** — Server Actions for auth (`signUp`, `signIn`, `signOut`, `getUser`) and project CRUD.

### UI Layout

`src/app/main-content.tsx` uses `react-resizable-panels`:
- Left panel (35%): `ChatInterface`
- Right panel (65%): Tabs → **Preview** (`PreviewFrame` iframe) | **Code** (file tree + Monaco editor)

### Database Schema

The database schema is defined in `prisma/schema.prisma`. Reference it anytime you need to understand the structure of data stored in the database.

```prisma
User  { id, email, password, projects[] }
Project { id, name, userId?, messages String (JSON), data String (JSON), ... }
```

`Project.data` is the serialized VFS; `Project.messages` is the serialized chat history. Anonymous projects have no `userId`.

### Environment Variables

```
ANTHROPIC_API_KEY=   # Optional — omit to use mock provider
JWT_SECRET=          # Required for auth
DATABASE_URL=file:./prisma/dev.db
```

### Testing

Tests use **Vitest + React Testing Library**, colocated in `__tests__/` subdirectories alongside source files. No global test setup file — each test file is self-contained.

## Code Style

Use comments sparingly. Only comment complex code in a friendly way.
