# PowerApps KPI Dashboard

A static, dependency-free dashboard shell for reviewing dummy PowerApps KPI data shaped like it came from Azure SQL. The dummy adapter is intentionally local so you can wire Power Platform, Dataverse, Azure Functions, or Azure SQL connections later.

## Run locally

```bash
npm run dev
```

The app binds to all interfaces on port `5173`:

```text
http://127.0.0.1:5173/
```

If you are using a remote workspace, open the forwarded/proxied URL for port `5173` instead of your own machine's `localhost`.

## Validate

```bash
npm run build
```

The build script verifies that the static app entry, JavaScript module, stylesheet, dummy KPI adapter, and Azure SQL guidance are present.

## Deploy to Vercel

This project is configured for Vercel as a static site. Vercel runs `npm run build`, which validates the app and copies the deployable files into `dist/`.

Recommended Vercel settings:

- **Framework Preset:** Other
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install` (or leave as the Vercel default)

You can preview the built output locally after running the build:

```bash
npm run preview
```
