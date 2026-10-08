# Yepmo knowledge base template

This repository serves public, static knowledge bases from one shared page template. Version 1 has no customer accounts, backend, database, analytics, or customer search storage. Search runs in the visitor's browser.

## Business data

Each business has its own JSON configuration in `businesses/<slug>.json`. Its `approvedCsvUrl` must point to that business's **published Approved-only CSV**. Do not point it at an intake, working, or AI-draft sheet: a published Google CSV can be fetched directly by anyone, even when the site UI does not display a row. The Northside prototype config points to a separate CSV containing only the public fields Type, Category, Question/Title, Answer, and Status, with Approved rows.

The template reads the CSV by header name, not column position. Required columns are `Type`, `Category`, `Question/Title` (or `Question`), `Answer`, and `Status`. A row is displayed only when it has a question, an answer, and a status of `Approved`. `AI draft answer` is never used by the customer-facing page.

Only general business information intended for public release belongs in these files and sheets. Do not put customer or patient names, contact details, appointment histories, profiles, medical records, or personal conversations in the knowledge base. For healthcare-related businesses, keep published content to general business and operational information. Neither AI drafts nor approved content may create diagnoses or personalised medical advice; keep that content out of the customer-facing knowledge base. AI-generated content remains a draft until a human approves it.


## Existing AI draft workflow

The current Make prototype watches for new Google Sheets rows, sends the supplied question and business answer to the AI with instructions not to invent or change meaning, then writes the result to the AI draft answer column and sets the row status to Needs Review. A human must approve content before it appears in the published approved-only feed. The AI rewrites a supplied answer; it does not fill gaps in missing business information.

The exported scenario watches new rows only, so editing an existing row does not trigger a new draft. It also has no status filter before the AI step and its prompt does not explicitly prohibit personal data or diagnoses and personalised medical advice. Keep input rows limited to general business information, and add those safeguards before using the automation for healthcare businesses or accepting updates at scale. Never put customer or patient information into the scenario.

## Add a business

1. Create a separate Approved-only sheet/export for the business using the required columns.
2. Add `businesses/<slug>.json` with a unique slug, that business's name, its own approved CSV URL, and optional public HTTPS contact or booking URLs.
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

Keep every business on its own source URL. The smoke test checks that configured businesses do not share a CSV URL. The slug selects one config, which selects one CSV; the page loads only that business's answers.

## Local smoke tests

With Node.js installed, run:

```text
node tests/knowledge-base-smoke.cjs
```

The tests cover approval filtering, using the `Answer` column rather than the AI draft, independent business configs, invalid tenant slugs, fail-closed behavior when no approved feed is configured, in-page navigation, and HTML escaping.

## Current limits

This is a public knowledge-base renderer, not a private client portal. Anyone can view each business's published information and can select another public business slug. Client authentication, private drafts, and cross-tenant private storage are out of scope for version 1.
