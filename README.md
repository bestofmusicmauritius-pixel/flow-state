# flow-state

A local-first project management tool for solo developers ("vibe coders"): a drag-and-drop kanban board, a todo list, and a notes area, all per-project, with everything stored in your browser — no account, no backend, no server.

Dark, monospace, amber-phosphor terminal aesthetic — built to feel like a tool for a coder's desk, not a generic SaaS dashboard.

## Setup

**Requirements:** Node.js 20+ and npm.

```bash
git clone https://github.com/bestofmusicmauritius-pixel/flow-state.git
cd flow-state
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Other commands:

```bash
npm run build   # production build
npm run start   # run a production build locally
npm run lint    # eslint
```

There is no environment configuration, database, or API key to set up — the app runs entirely client-side and persists to your browser's `localStorage`.

## What v0.1 can do

### Projects

- Create, rename, and delete any number of projects from the project switcher in the top bar.
- Each project has its own kanban board, todo list, notes, and archive — completely isolated from the others.

### Kanban board

- Three columns — Todo, In Progress, Complete — with cards you create, edit, and delete.
- Drag and drop cards between columns and reorder within a column (mouse or keyboard — Tab to a card, Space to pick it up, arrow keys to move it, Space to drop, Escape to cancel).
- Each card can have:
  - A **priority**: P0 (critical) through P3 (low), shown as a colored `[P0]`–`[P3]` tag.
  - A **due date**, optionally with a **time**. Without a time, a card stays "due today" all day and flips to overdue at midnight; with a time, it goes overdue the moment that time passes.
  - Urgency coloring on the due-date label: overdue → today → tomorrow → this week → in 2 weeks → this month → later, as a single hot-to-cold color gradient.
- Each column can be sorted **manually** (drag order, the default) or **by due date** (soonest first; dragging is disabled while sorted this way, since there's no manual order to drag into).
- The Complete column has an **archive** action that moves every completed card into that project's archive in one step (with confirmation).
- Individual cards can also be archived one at a time from the task dialog.

### Todo list

- A flat checklist per project, separate from the kanban board.
- Drag to reorder.
- Each todo can also have a priority and a due date/time, set inline via small popovers — same color system as the board.

### Notes

- One free-form autosaving text area per project — a running scratchpad, not a list of discrete notes.

### Agenda view

- A cross-project view aggregating every card and todo with a due date, from all your projects, grouped by urgency (overdue, today, tomorrow, this week, ...).
- Click an item to jump straight to its project — cards open directly in their edit dialog.

### Search

- Full-text search across every project's cards, todos, and notes.
- A real boolean query parser, not just a plain substring filter:
  - **all words** (default AND) vs **any word** (default OR) mode
  - explicit `OR` between terms
  - `-exclude` or `NOT exclude` to exclude a term
  - `"exact phrase"` for quoted substrings
- Optionally includes archived cards in results, with restore and permanent-delete actions right there.

### Archive

- A dedicated `[archive]` view lists every archived card, grouped by project, so you can browse without needing a search term.
- Restore a card back to its original column, or delete it forever.

### Undo

- Deleting a card, todo, or project; archiving a card (single or bulk); and permanently deleting an archived card all show a toast with an **undo** button for a few seconds afterward.

### Backup and restore

- `[export]` downloads your entire app state (every project, card, todo, and note) as a JSON file.
- `[import]` restores from a previously exported file, with a confirmation before it overwrites what's currently stored. Available even before you've created a first project, for restoring onto a fresh browser.

### Desktop notifications

- An opt-in `[notify]` toggle requests browser notification permission and then fires a real desktop notification the moment a card or todo with a specific due **time** becomes due — checked across all projects, not just the one you're currently viewing.
- Only items with an explicit time notify (date-only due items are covered by the color gradient instead, since there's no precise moment to alert at).
- This only works while the tab is open in a browser — there's no server to push a notification if the browser is closed.

### Keyboard shortcuts

| Key | Action |
| --- | --- |
| `/` | Jump to search |
| `b` | Board view |
| `a` | Agenda view |
| `n` | New task (on the board view) |
| `?` | Show the shortcuts help dialog |
| `Esc` | Close the open dialog |

Shortcuts are ignored while typing in any text field.

## Data and privacy

Everything lives in your browser's `localStorage` — there is no account, no server, and no data ever leaves your machine except through the manual export/import backup feature. This also means data is per-browser: clearing site data, switching browsers, or moving to a new machine will lose everything unless you've exported a backup first.

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router) + React 19 + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com) for styling
- [dnd-kit](https://dndkit.com) for drag-and-drop
- No backend, no database, no external API calls
