# Yepmo knowledge base template

This repository serves public, static knowledge bases from one shared page template. Version 1 has no customer accounts, backend, database, analytics, or customer search storage. Search runs in the visitor's browser.

## Business data

Each business has its own JSON configuration in `businesses/<slug>.json`. Its `approvedCsvUrl` must point to that business's **published Approved-only CSV**. Do not point it at an intake, working, or AI-draft sheet: a published Google CSV can be fetched directly by anyone, even when the site UI does not display a row.

The template reads the CSV by header name, not column position. Required columns are `Type`, `Category`, `Question/Title` (or `Question`), `Answer`, and `Status`. A row is displayed only when it has a question, an answer, and a status of `Approved`. `AI draft answer` is never used by the customer-facing page.

Only general business information intended for public release belongs in these files and sheets. Do not put customer or patient names, contact details, appointment histories, profiles, medical records, or personal conversations in the knowledge base.

## Add a business

1. Create a separate Approved-only sheet/export for the business using the required columns.
2. Add `businesses/<slug>.json` with that business's name, slug, approved CSV URL, and optional public HTTPS contact or booking URLs.
3. Open `?business=<slug>` on the hosted site. The root URL uses the slug in `businesses/default.json`.

Example business config:

```json
{
  "slug": "example-business",
  "name": "Example Business",
  "approvedCsvUrl": "https://example.com/approved.csv",
  "contactUrl": "",
  "bookingUrl": "",
  "accentColor": "#245f6b"
}
```

Keep every business on its own source URL. The slug selects one config, which selects one CSV; the page loads only that business's answers.

## Local smoke tests

With Node.js installed, run:

```text
node tests/knowledge-base-smoke.cjs
```

The tests cover approval filtering, using the `Answer` column rather than the AI draft, independent business configs, invalid tenant slugs, and HTML escaping.

## Current limits

This is a public knowledge-base renderer, not a private client portal. Anyone can view each business's published information and can select another public business slug. Client authentication, private drafts, and cross-tenant private storage are out of scope for version 1.
