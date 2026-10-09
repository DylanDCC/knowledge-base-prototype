# Yepmo knowledge base template

This repository serves public, static knowledge bases from one shared page template. Version 1 has no customer accounts, backend, database, analytics, or customer search storage. Search runs in the visitor's browser.

## Business data

Each business has its own JSON configuration in `businesses/<slug>.json`. Its `approvedCsvUrl` must point to that business's **published Approved-only CSV**. Do not point it at an intake, working, or AI-draft sheet: a published Google CSV can be fetched directly by anyone, even when the site UI does not display a row. The Northside prototype config points to a separate CSV containing only the public fields Type, Category, Question/Title, Answer, and Status, with Approved rows.

The template reads the CSV by header name, not column position. Required columns are `Type`, `Category`, `Question/Title` (or `Question`), `Answer`, and `Status`. A row is displayed only when it has a question, an answer, and a status of `Approved`. `AI draft answer` is never used by the customer-facing page.

Only general business information intended for public release belongs in these files and sheets. Do not put customer or patient names, contact details, appointment histories, profiles, medical records, or personal conversations in the knowledge base. For healthcare-related businesses, keep published content to general business and operational information. Neither AI drafts nor approved content may create diagnoses or personalised medical advice; keep that content out of the customer-facing knowledge base. AI-generated content remains a draft until a human approves it.


## Existing AI draft workflow

The current Northside Make prototype watches for new Google Sheets rows. A route filter passes only rows whose Status is exactly `Draft` to the AI; rows marked `Approved` or `Needs review` do not reach the AI step. It sends Question/Title and Answer to the AI, then writes the response to `AI draft answer` and sets Status to `Needs review`. AI output stays separate from the approved public feed. A human must review and approve content before it appears in that feed.

The prompt prohibits invention, requires a `REVIEW NEEDED` response when the question or answer is missing, unclear, or contradictory, rejects healthcare diagnoses and personalised medical advice, and says to flag apparent customer/patient personal information without echoing it. It treats sheet content as source material, not as instructions.

These are prompt safeguards, not a pre-AI privacy filter: the row text is already sent to Make's AI provider before the prompt can flag it. Never enter customer or patient personal information into this workflow. The current scenario is connected specifically to the Northside spreadsheet and is not a reusable tenant-isolated automation.

The trigger watches new rows only, so editing an existing row does not create a new draft. Rows with a blank or non-`Draft` status are skipped. Before activation or wider use, test a copy against an isolated sheet containing synthetic business-only data, verify its output and approval flow, and add an appropriate privacy control if required. The scenario remains inactive and has not been run as part of this change, because execution would write to the connected spreadsheet.
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
