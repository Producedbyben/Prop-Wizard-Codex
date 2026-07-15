# Prop Pilot

Prop Pilot is an AI-assisted prop sourcing and production management application for film, advertising and content teams.

## Stack

- React, TypeScript and Vite
- Supabase authentication, Postgres, storage and Edge Functions
- OpenAI for AI-assisted extraction, analysis, matching and recommendations
- GitHub Actions and GitHub Pages for the first public deployment

## Local development

```bash
npm install
cp .env.example .env
npm run dev
```

The browser environment requires:

```text
VITE_SUPABASE_PROJECT_ID
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
```

Server-side Supabase functions use secrets configured in Supabase, including `OPENAI_API_KEY`. Never expose server API keys through `VITE_` variables or commit them to GitHub.

## Validation

```bash
npm run check
```

This runs TypeScript validation, linting, tests and the production build.

## Deployment

Every push to `main` builds the app and publishes the static output to the `gh-pages` branch. A second Pages workflow is retained for repositories configured to use GitHub Actions as their Pages source.

Expected public address:

```text
https://producedbyben.github.io/Prop-Wizard-Codex/
```

## Codex workflow

Read `AGENTS.md` before changing the repository. Use small branches and pull requests, run `npm run check`, and keep credentials out of source control.
