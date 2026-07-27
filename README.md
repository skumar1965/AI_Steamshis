# StatementFlow — Dynamics 365 Customer Statement Agent

A responsive, dependency-free prototype for a Microsoft Dynamics 365 Finance customer-statement workflow. Finance users can select eligible customers, configure a statement date and transaction scope, preview the agent's plan, start a send run, and monitor delivery activity.

## Prototype capabilities

- Customer selection with balances, recipient readiness, and missing-email safeguards
- Statement date, transaction scope, email template, and recurring schedule controls
- Live run totals and an agent-generated execution summary
- Interactive send action with immediate activity and status feedback
- Responsive desktop and mobile layouts

All data and delivery actions are local demo data; the prototype does not send email or connect to a tenant.

## Production architecture

Use the UI as the operator surface, but execute statement runs in a trusted backend:

1. Register a Microsoft Entra application and grant only the Dynamics 365 Finance permissions the integration requires. Keep credentials in Azure Key Vault and never in browser code.
2. Expose a narrow orchestration API through Azure Functions or another secured service. Validate the caller, legal entity, customer scope, dates, and approved template identifiers.
3. Read customer accounts, contacts, and transactions from supported Finance data entities or custom services. Prefer the built-in customer statement report/process when it satisfies the business requirement rather than recreating accounting logic.
4. Run statement generation asynchronously. Store one immutable run record and one item per customer so retries are idempotent and a partial failure does not resend successful statements.
5. Render the customer statement as a PDF through the Finance reporting pipeline, then deliver it using an approved email provider or Finance print-management destination.
6. Persist delivery status, correlation IDs, errors, and the initiating user. Apply Finance roles and legal-entity access on the server; an AI model must never choose or expand authorization scope.
7. If natural language is added, constrain the model to a small tool contract such as `create_statement_run(customer_ids, statement_date, transaction_scope, template_id)`. Require a human confirmation before dispatch and validate every tool argument server-side.

Recommended run states are `Draft → Validated → Generating → Ready → Sending → Completed`, with per-recipient `Delivered`, `Failed`, or `Skipped` outcomes. Add a dead-letter queue, rate limits, retention rules, duplicate-send protection, and alerts before production use.

## Run locally

```bash
npm run dev
```

Open `http://127.0.0.1:5173/`.

## Validate and build

```bash
npm run build
```

The build validates required workflow elements and copies the static app to `dist/`.
