# Prop Pilot Feature-Parity Release Gate

The rebuilt application must preserve the source codebase and user experience. A deployment is not considered production-ready until every applicable item below has been built and verified.

## Core application

- Authentication and account flows
- Project dashboard, creation, settings and templates
- Project members, roles, invitations and assignments
- Prop creation, editing, deletion, archive and history
- Card, compact, table, timeline, moodboard and scene-breakdown views
- Search, filters, presets, natural-language search and duplicate detection
- Comments, notes, mentions, notifications and activity feeds
- Shared approval boards and public sharing

## Sourcing and purchasing

- Automated sourcing workflow
- Product options and comparisons
- Amazon link importing
- Image search and manual image selection
- Vendors and vendor assignment
- Purchasing lists, receipts, returns and delivery-risk tracking
- Budget dashboard and budget optimisation

## Treatments and AI

- Treatment upload, reading and management
- PDF and DOCX extraction
- Prop extraction and treatment matching
- Image analysis
- Prop creation from text
- Prop GPT assistant
- Suggested and similar props
- Refresh and deduplication workflows

## Platform

- Existing Supabase schema and migrations
- Row-level security and role checks
- Storage and Edge Functions
- Subscription and Stripe hooks, with billing disabled safely until configured
- PWA installation and responsive layouts
- Error boundaries and loading states

## Release criteria

- Clean dependency installation
- Production build succeeds
- TypeScript, lint and automated tests pass
- Every Edge Function has explicit provider and secret requirements
- Authentication smoke test passes
- New project and prop CRUD smoke tests pass
- Shared board smoke test passes
- Treatment extraction smoke test passes
- Sourcing workflow smoke test passes
- No Lovable private services remain
- No secret keys are committed
- Production URL is verified in a fresh browser session

Improvements may be added only when they do not remove or silently downgrade existing functionality.
