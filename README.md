# Project Tracker Pro

A high-performance, client-side **Residential Construction & Restoration Project Tracker** built with **React**, **TypeScript**, **Biome**, and **Vitest**.

Runs 100% in the browser with **IndexedDB persistence** and zero backend requirements. Ready for instant deployment on **GitHub Pages**.

---

## Key Features

- **Dashboard Metrics**: Real-time stats for Active Projects, Completed Projects, Past Due, Due This Week, and Total Projects.
- **Template System**: Preconfigured construction templates (Addition/Renovation, Reclad, Fire Damage Repair, Water Damage Repair, Tree Strike, Vehicle Impact, New Construction, Report) with automatic due date calculators.
- **Workflow Task Generator**: Auto-populates standard 8-step construction milestones with date scheduling (`📅`).
- **Interactive Duration & Progress Bars**:
  - Dynamic timeline countdown bar color-coded by schedule health (Green → Yellow → Orange → Red).
  - Real-time task completion progress percentage.
- **Interactive Construction Calendar**: Full monthly view showing both project due dates and scheduled field tasks.
- **Global Rich-Text Notepad**: Persistent right-sidebar notes workspace with formatting (Bold, Highlights, Bulleted & Numbered lists, Undo/Redo) and automatic IndexedDB debounced auto-save.
- **Completion Celebrations**: Web Audio API synthesized multi-tone chime + screen-wide particle confetti burst.
- **Full Data Backup & Restore**: Timestamped JSON export and import with schema validation and Merge / Replace options.
- **Unified Controls**: Standardized semi-transparent `✏` edit controls for project names, due dates, tasks, and notes.
- **Details & Compact Views**: Switch between full cards and two-column explorer layout.

---

## Tooling & Quality Standards

- **TypeScript**: Strict type checking.
- **Biome**: Lightning-fast formatting and linting (`@biomejs/biome`).
- **Vitest**: Fast unit test suite covering date arithmetic, duration math, schema validation, and stats.

---

## Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Start local dev server
npm run dev

# 3. Run unit tests
npm run test

# 4. Check linting and formatting with Biome
npm run lint

# 5. Build production bundle
npm run build
```

---

## Deploying to GitHub Pages

This repository is pre-configured with `base: './'` in `vite.config.ts` and includes a complete GitHub Actions workflow (`.github/workflows/deploy.yml`).

### Method 1: Automatic Deployment via GitHub Actions (Recommended)
1. Push this repository to GitHub.
2. In your GitHub repository, go to **Settings** > **Pages**.
3. Under **Build and deployment** > **Source**, select **GitHub Actions**.
4. Every push to `main` or `master` will automatically test, build, and deploy your app.

### Method 2: Manual Build
1. Run `npm run build`.
2. The static files in `dist/` can be deployed to any static host, CDN, S3, Netlify, Vercel, or GitHub Pages.
