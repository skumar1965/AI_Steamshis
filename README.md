# D365 F&O Query Agent

A static, dependency-free agent prototype for querying dummy Microsoft Dynamics 365 Finance & Operations data. The app lets users ask natural-language questions, maps them to seeded F&O-style entities, and displays the generated OData-style query plus tabular results.

## Included dummy entities

- Customers
- Sales orders
- Inventory on-hand
- Vendors

The adapter is intentionally local and credential-free so you can validate the experience before wiring in Microsoft Entra ID, D365 F&O OData endpoints, Dataverse virtual tables, Azure Functions, or API Management.

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

The build script verifies that the static app entry, JavaScript module, stylesheet, dummy D365 F&O adapter, and production connection guidance are present.

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
