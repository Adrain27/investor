# Investor Form – Vite + React + Tailwind

Fast, client-side rendered app built with Vite, React, TypeScript, Tailwind CSS, and shadcn-ui.

## Tech stack

- Vite
- React + TypeScript
- Tailwind CSS + shadcn-ui
- React Router
- TanStack Query

## Local development

Requirements: Node.js 18+ and npm.

```sh
git clone <YOUR_REPO_URL>
cd investor
npm ci
npm run dev
```

The dev server runs at `http://localhost:5173` by default.

## Build

```sh
npm run build
npm run preview   # optional: serve the production build locally
```

Build output is generated in the `dist/` directory.

## Deploy to Vercel (recommended)

Vercel can deploy this project as a static build.

### Option A: Deploy via GitHub (one‑click)
1. Push this repo to GitHub.
2. In Vercel, click "New Project" → "Import Git Repository" and choose your repo.
3. Framework Preset: select "Vite".
4. Build command: `npm run build`
5. Output directory: `dist`
6. Click Deploy.

### Option B: Deploy via Vercel CLI
```sh
npm i -g vercel
vercel login
# From project root
vercel --prod
```

When prompted:
- Framework preset: Vite
- Build command: `npm run build`
- Output directory: `dist`

### SPA routing (client‑side routing)
This is a React Router SPA. With the Vite preset, Vercel automatically serves the SPA fallback so deep links like `/terms` work. If you prefer to be explicit, create a `vercel.json` with this rewrite:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

## Environment variables

If you add any environment variables (e.g., API keys), set them in Vercel under Project → Settings → Environment Variables, and in local development via a `.env` file. Vite exposes variables prefixed with `VITE_` to the client.

## Useful scripts

- `npm run dev` – start local dev server
- `npm run build` – create production build
- `npm run preview` – preview built app

## Notes

- The project uses class-based dark mode (`.dark`) with a theme toggle.
- The build output is static; no server is required.
