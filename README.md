# flow-state

A local-first project management tool for solo developers ("vibe coders"): a drag-and-drop kanban board, a todo list, and a notes area, all per-project, with everything stored in your browser — no account, no backend, no server.

Dark, monospace, amber-phosphor terminal aesthetic — built to feel like a tool for a coder's desk, not a generic SaaS dashboard.

## Setup

No coding experience needed — just follow the steps for your computer below, in order. This isn't a double-click desktop app: flow-state runs through a small program called Node.js, so there's one program to install and one command window to keep open while you use it. There's no account to create and nothing to pay for.

If any step doesn't match exactly what you see on screen (websites change their design sometimes), the goal of that step is written in **bold** — look for a button or link that does that.

### Step 1: Install Node.js

You only need to do this once per computer.

**On Windows:**

1. Go to [nodejs.org](https://nodejs.org) in your browser.
2. Click the big button that says **LTS** (it means "long-term support" — the stable, recommended version).
3. When the download finishes, open the downloaded file (it will be named something like `node-v20.xx.x-x64.msi`, usually found in your **Downloads** folder).
4. An installer window opens. Click **Next**, accept the license agreement, then keep clicking **Next** on every screen, leaving all settings as they are, until you reach **Install**. Click it.
5. If Windows asks for permission to make changes, click **Yes**.
6. When it finishes, click **Finish**.

**On Mac:**

1. Go to [nodejs.org](https://nodejs.org) in your browser.
2. Click the big button that says **LTS**.
3. When the download finishes, open the downloaded file (it will be named something like `node-v20.xx.x.pkg`, usually found in your **Downloads** folder).
4. An installer window opens. Click **Continue**, **Continue** again, then **Agree** to the license, then **Install**.
5. Enter your Mac's password if it asks for one (this is normal — it's the same as installing any other Mac app).
6. When it finishes, click **Close**.

### Step 2: Open a terminal

A terminal is just a window where you type commands instead of clicking buttons.

- **On Windows:** click the **Start** menu, type `cmd`, and press **Enter**. A black window titled "Command Prompt" opens.
- **On Mac:** press `Cmd + Space` to open Spotlight, type `Terminal`, and press **Enter**. A window opens.

Leave this window open — you'll type into it in the next steps.

### Step 3: Check Node.js installed correctly

In the terminal window, type this and press **Enter**:

```bash
node -v
```

You should see a version number appear, like `v20.11.0`. If instead you see an error like "command not found," Node.js didn't install correctly — try Step 1 again, or restart your computer and try this check again (Windows sometimes needs a restart before new programs are recognized).

### Step 4: Download flow-state

1. Go to the [flow-state GitHub page](https://github.com/bestofmusicmauritius-pixel/flow-state).
2. Click the green **Code** button.
3. Click **Download ZIP**.
4. Find the downloaded file in your **Downloads** folder (it will be called `flow-state-master.zip`).
5. Extract it:
   - **On Windows:** right-click the ZIP file and choose **Extract All...**, then click **Extract**.
   - **On Mac:** double-click the ZIP file — it extracts automatically into a folder next to it.

You now have a folder called `flow-state-master` (or similar) with all the app's files inside it.

### Step 5: Point the terminal at that folder

Back in your terminal window from Step 2, type `cd ` (the letters "c" and "d", then a space — don't press Enter yet), then **drag the `flow-state-master` folder from your file browser and drop it onto the terminal window**. This automatically types the folder's full path for you. Now press **Enter**.

### Step 6: Install and run

Still in the terminal, type each of these one at a time, pressing **Enter** after each and waiting for it to finish before typing the next:

```bash
npm install
```

This downloads everything the app needs to run — it can take a minute or two and will print a lot of text. That's normal.

```bash
npm run dev
```

This starts the app. When it's ready, you'll see a line mentioning `localhost:3000`.

### Step 7: Open the app

Open your web browser and go to:

```
http://localhost:3000
```

You should see flow-state running.

**Important:** keep the terminal window open while you're using the app — closing it stops the app. To use flow-state again later, repeat Steps 2, 5, and the `npm run dev` part of Step 6 (you don't need to run `npm install` again unless you download a newer version of the app).

### If you already use git

```bash
git clone https://github.com/bestofmusicmauritius-pixel/flow-state.git
cd flow-state
npm install
npm run dev
```

Other commands:

```bash
npm run build   # production build
npm run start   # run a production build locally
npm run lint    # eslint
```

There is no environment configuration, database, or API key to set up — the app runs entirely client-side and persists to your browser's `localStorage`.

## What v0.2 can do

### Projects

- Create, rename, and delete any number of projects from the project switcher in the top bar.
- Each project has its own kanban board, todo list, notes, and archive — completely isolated from the others.

### Kanban board

- Three columns — Todo, In Progress, Complete — with cards you create, edit, and delete.
- Drag and drop cards between columns and reorder within a column (mouse or keyboard — Tab to a card, Space to pick it up, arrow keys to move it, Space to drop, Escape to cancel), with an **undo** toast offered after cross-column moves and recurrence advances.
- Each card can have:
  - A **priority**: P0 (critical) through P3 (low), shown as a colored `[P0]`–`[P3]` tag.
  - A **due date**, optionally with a **time**. Without a time, a card stays "due today" all day and flips to overdue at midnight; with a time, it goes overdue the moment that time passes.
  - Urgency coloring on the due-date label: overdue → today → tomorrow → this week → in 2 weeks → this month → later, as a single hot-to-cold color gradient.
  - **Recurrence** (daily/weekly/monthly) — moving a recurring card to Complete advances its due date and sends it back to Todo instead of sitting done.
  - Free-form **tags**.
  - A **markdown-supported description**, with write/preview tabs.
  - A **time tracker** — start/pause a per-card timer and see accumulated time, both on the card face and in its edit dialog.
- Each column can be sorted **manually** (drag order, the default) or **by due date** (soonest first; dragging is disabled while sorted this way, since there's no manual order to drag into).
- The Complete column has an **archive** action that moves every completed card into that project's archive in one step (with confirmation).
- Individual cards can also be archived one at a time from the task dialog.
- **Bulk select**: turn on `[select]` mode to check off multiple cards and move, set priority, tag, archive, or delete them all at once — each action offers undo.
- **Quick-add syntax** in each column's add-task field: type `#tag`, `!p0`–`!p3`, and `@today` / `@tomorrow` / `@fri` / `@2026-09-10`, optionally with a time like `@tomorrow-9am`, right in the title text.

### Todo list

- A flat checklist per project, separate from the kanban board.
- Drag to reorder.
- Each todo can also have a priority, due date/time, recurrence, and tags — same color system and quick-add syntax as the board.

### Notes

- One free-form autosaving text area per project — a running scratchpad, not a list of discrete notes.
- Searchable from the Search view along with cards and todos.

### Tags

- Add free-form tags to any card or todo (typed as `word`, displayed as `#word`).
- A tag can be renamed or deleted everywhere it's used, from one place, instead of hunting down every card individually.

### Calendar view

- A month-grid calendar aggregating every card and todo with a due date, across all your projects.
- Shows up to 3 items per day (with a "+N more" count for busier days), color-coded by priority and urgency, with completed items shown struck through.
- Click any item to jump straight to it; navigate months or jump back to today.

### Agenda view

- A cross-project view aggregating every card and todo with a due date, from all your projects, grouped by urgency (overdue, today, tomorrow, this week, ...).
- Click an item to jump straight to its project — cards open directly in their edit dialog.

### Search

- Full-text search across every project's cards, todos, and notes — including tags.
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

- Deleting a card, todo, or project; archiving a card (single or bulk); moving a card across columns; and permanently deleting an archived card all show a toast with an **undo** button for a few seconds afterward.

### Importing from Trello and Todoist

- From Settings, `[import from trello/todoist]` accepts:
  - A **Trello board export** (`.json`, from Trello's own "Export as JSON"): lists become kanban columns (guessed by name), labels become tags, due dates carry over, and archived (closed) cards land in flow-state's own archive rather than being dropped.
  - A **Todoist project export** (`.csv`): tasks land in the imported project's todo list, since Todoist projects are flat/nested lists rather than boards.
- Each import creates a brand-new project and shows a preview count before you confirm.
- The Todoist importer targets Todoist's documented CSV template shape but hasn't been verified against a real exported file — if a real export doesn't parse, that's the likely reason.

### Backup and restore

- `[export]` downloads your entire app state (every project, card, todo, and note) as a JSON file.
- `[import]` restores from a previously exported file, with a confirmation before it overwrites what's currently stored. Available even before you've created a first project, for restoring onto a fresh browser.

### Time tracking and pomodoro

- Start/pause a timer on any card to track time spent, with a live-ticking display and a reset option.
- A `[pomo 25:00]` widget in the top bar runs a 25-minute focus / 5-minute break cycle, independent of any specific card, with a desktop notification when a session ends.

### Desktop notifications

- An opt-in `[notify]` toggle requests browser notification permission and then fires a real desktop notification the moment a card or todo with a specific due **time** becomes due — checked across all projects, not just the one you're currently viewing. Notifications stay on screen until dismissed rather than auto-hiding.
- An opt-in daily `[digest]` sends one notification a day at a time you choose, summarizing everything due today or overdue — this covers date-only items, which never get their own popup.
- Only items with an explicit time notify individually (date-only due items are covered by the color gradient and the daily digest instead, since there's no precise moment to alert at for those).
- This only works while the tab is open in a browser — there's no server to push a notification if the browser is closed.

### Command palette

- Press `k` (or click `command k` in the top bar) to open a searchable command palette: jump to any view, create a task or project, switch projects, or open the shortcuts help — without touching the mouse.

### Keyboard shortcuts

| Key | Action |
| --- | --- |
| `/` | Jump to search |
| `b` | Board view |
| `a` | Agenda view |
| `k` | Open the command palette |
| `n` | New task (on the board view) |
| `?` | Show the shortcuts help dialog |
| `Esc` | Close the open dialog |

Shortcuts are ignored while typing in any text field.

## Data and privacy

Everything lives in your browser's `localStorage` — there is no account, no server, and no data ever leaves your machine except through the manual export/import backup feature (or the Trello/Todoist import, which only reads the file you choose). This also means data is per-browser: clearing site data, switching browsers, or moving to a new machine will lose everything unless you've exported a backup first.

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router) + React 19 + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com) for styling
- [dnd-kit](https://dndkit.com) for drag-and-drop
- No backend, no database, no external API calls
