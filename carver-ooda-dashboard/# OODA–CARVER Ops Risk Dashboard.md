# OODA–CARVER Ops Risk Dashboard

Operational risk dashboard that fuses **OODA**, **CARVER**, and **OpSec** into a single, zero-backend web app.
Built to run on **GitHub Pages** (static hosting) with upload/download, inline edits, 5×5 risk heatmap, printable reports, and a seeded 5-asset demo.

> The full single-file React app lives in this repo as `src/App.jsx` (same as the version in our canvas).

---

## ✨ Features

* **Seeded dataset (5 assets)** with CARVER fields (C, A, R, V, E, Rz)
* **Derived metrics**: L = avg(A,V,Rz), I = avg(C,E,R), **Risk = L × I**
* **Inline editing** + add/remove rows + search/sort
* **Import** CSV/JSON and **Export** CSV/JSON/Markdown
* **5×5 Likelihood × Impact heatmap**
* **Role views** (All / Ops / Sec / Comms) → different column sets
* **Printable PDF** (browser print) with a formatted register + summary
* **Local persistence** with `localStorage`
* **Self-tests** run at load (sanity checks for core functions)

---

## 🚀 Quick Start (Local)

> Requires **Node.js 18+**

```bash
# 1) Scaffold a Vite React app
npm create vite@latest ooda-carver-dashboard -- --template react
cd ooda-carver-dashboard

# 2) Install deps
npm i recharts framer-motion lucide-react papaparse

# 3) (Optional but recommended) TailwindCSS for styling
npm i -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

**Tailwind config (`tailwind.config.js`)**

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: {} },
  plugins: [],
}
```

**Global CSS (`src/index.css`)**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**Alias “@” to `src` (vite.config.js)**

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } }
})
```

**Replace `src/App.jsx` with the provided app code**
(From the canvas file titled **“OODA–CARVER Ops Risk Dashboard (Web App)”**.)

**Run:**

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## 🌐 Deploy to GitHub Pages

**Option A — gh-pages (quick):**

```bash
npm i -D gh-pages
# package.json
# "homepage": "https://<your-username>.github.io/<your-repo>",
# "scripts": { "build":"vite build", "predeploy":"vite build", "deploy":"gh-pages -d dist" }

npm run deploy
```

Then in **Repo → Settings → Pages** ensure it serves from `/gh-pages`.

**Option B — Pages from /dist:**

* Enable **Pages → Deploy from branch → `dist`** (via GitHub Actions that runs `npm ci && npm run build`).
* Or use the built-in Vite GitHub Pages template action.

---

## 📦 CSV Schema (Upload)

Headers expected:

```
name,type,country,location,C,A,R,V,E,Rz,notes
```

* All CARVER fields are **1–5**
* `notes` optional
* L, I, and Risk are computed in-app.

**Sample CSV (the 5 seeded assets):**

```csv
name,type,country,location,C,A,R,V,E,Rz,notes
Kivu Ridge VHF Site,VHF Comms,DRC,North Kivu,5,4,3,4,5,5,"Primary ATC coverage; community tensions nearby; guarded 12h/day."
Shamal Radar Tower,Primary Radar,Iraq,Nineveh,5,3,3,3,5,4,"Dual-use air picture node; intermittent power grid stability."
Coastal SATCOM Hub,SATCOM Relay,Somalia,Puntland,4,4,2,3,4,4,"Backbone for remote sites; subject to cyclones; private guard force."
Highland Fuel Depot,Logistics,Peru,Cajamarca,5,3,2,4,5,5,"Feeds remote extraction site; protest risk; visible/identifiable target."
Eastern Fiber POP,Telecom POP,Georgia,Kvemo Kartli,4,2,4,3,3,3,"Regional backhaul; redundancy available; moderate recognizability."
```

**JSON upload** accepts an array of objects with the same keys.

---

## 🧮 Calculations

* **Likelihood (L)** = average of (**A**, **V**, **Rz**)
* **Impact (I)** = average of (**C**, **E**, **R**)
* **Risk** = **L × I**
* All on a **1–5** scale, rounded to **2 decimals** for L and I; Risk is multiplied then rounded to 2 decimals.

---

## 🧭 Role Views

* **All** — full CARVER + derived (default)
* **Ops** — `C, R, E, I, Risk, Notes`
* **Sec** — `A, V, Rz, L, I, Risk, Notes`
* **Comms** — minimal: `Country, Location, Risk, Notes`

Switch from the header **Role** dropdown.

---

## 🧱 Heatmap

* 5×5 **Impact (rows)** × **Likelihood (cols)** grid
* Each cell shows **count** and up to 3 asset names (hover/scan for more)
* Color intensity increases with risk bucket proxy

---

## 🧪 Built-in Self-Tests

The app runs a few checks on load and shows **Self-tests OK/Failed** in the header:

1. `computeDerived()` yields **L=5, I=5, Risk=25** for all 5s
2. CSV → JSON roundtrip with a minimal asset
3. Markdown report contains the header `# OODA–CARVER Risk Report`

If tests fail, details appear under **Method Notes**, and errors log to the console.

---

## 🛠️ UI Components

The code imports a few UI primitives from `@/components/ui/*` (Button, Card, Input, Tabs, Dialog).
You have **two** easy paths:

### Option 1 — Add shadcn/ui (full-feature)

```bash
# install peer deps
npm i class-variance-authority tailwind-merge lucide-react
# init shadcn
npx shadcn@latest init
# add only the components you need
npx shadcn@latest add button card input tabs dialog
```

This will scaffold `src/components/ui/*`. Tailwind must be set up (see Quick Start).

### Option 2 — Minimal shims (fastest)

Create simple wrappers matching the used props in:

```
src/components/ui/button.jsx
src/components/ui/card.jsx
src/components/ui/input.jsx
src/components/ui/tabs.jsx
src/components/ui/dialog.jsx
```

Each can be a minimal Tailwind-styled component (e.g., a `<button>` with classes).
This keeps the app lightweight while preserving the same imports.

---

## 🧾 Printing & Exports

* **Markdown**: `carver_report.md` (Top-3 + full register)
* **CSV/JSON**: full register with derived fields
* **PDF**: Click **Print PDF** (uses a print stylesheet to hide controls)

---

## 🔐 Security & Privacy

* All data stays **in-browser** (localStorage). No server, no cookies.
* Uploads never leave your machine.
* If you handle sensitive infrastructure data, consider:

  * Using a read-only machine for report generation
  * Clearing localStorage via **Reset**
  * Hosting the app internally

---

## 🧩 Troubleshooting

* **SyntaxError: Unterminated string constant (198:20)**
  Fixed in `buildMarkdownReport`: `return lines.join("\n");`

* **`crypto.randomUUID` not found** (older browsers):
  Swap to a simple UUID polyfill or use `Date.now() + Math.random()` for IDs.

* **Blank charts or styling off**:
  Ensure Tailwind is correctly configured and the content paths include `./src/**/*.{js,ts,jsx,tsx}`.

* **shadcn/ui imports not found**:
  Use **Option 1** (install shadcn) or **Option 2** (create shims) above.

---

## 🗺️ Roadmap

* Bowtie view (top events, threats, barriers)
* Scenario snapshots with versioned datasets
* RBAC stubs (viewer/editor)
* XLSX export
* Optional encryption at rest (per-dataset key)

---

## 📝 License

MIT © You / Your Org

---

## 🙋 FAQ

**Q: Can I change the CARVER math?**
A: Yes—see `computeDerived()` for L/I/Risk formulas.

**Q: Can I add custom fields?**
A: Add columns to the table and CSV handler (`fromCSV` / `toCSV`). The UI will need labels and any new derived calculations wired in.

**Q: What’s the expected CSV delimiter and encoding?**
A: Comma-separated, UTF-8. Quotes around fields with commas.

---

If you want, I can drop in the **UI shims** for Button/Card/Input/Tabs/Dialog so you can push this repo in one shot without pulling in shadcn/ui.
