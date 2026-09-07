# WhatsApp AI Agent

A secure starter service that receives WhatsApp Cloud API text webhooks, gets an answer from the OpenAI Responses API, and sends that answer back over WhatsApp.

## Included

- Meta webhook verification and `X-Hub-Signature-256` HMAC validation.
- Text-message parsing, duplicate-message suppression, and a fast webhook acknowledgement.
- Per-sender conversational continuity using OpenAI response IDs.
- A `/health` endpoint plus TypeScript tests for the critical helpers.

## Setup

1. Use Node.js 20 or newer and install dependencies:

   ```bash
   npm install
   ```

2. Copy the configuration template and fill in your OpenAI and Meta values:

   ```bash
   cp .env.example .env
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Expose `http://localhost:3000/webhook` with a public HTTPS tunnel and configure the resulting URL in your Meta WhatsApp app. Set the webhook verification token to `WHATSAPP_VERIFY_TOKEN`, then subscribe to WhatsApp `messages` webhooks.

## Commands

```bash
npm run check  # Type-check
npm test       # Run unit tests
npm run build  # Compile to dist/
npm start      # Run compiled service
```

## Create a pull request

The repository includes a dependency-free `make-pr` command that delegates PR creation to the authenticated [GitHub CLI](https://cli.github.com/). It refuses to run when the working tree has uncommitted changes, so the PR always matches a commit.

```bash
# First authenticate once, if needed.
gh auth login

# Create a PR using inline Markdown body text.
npm run make-pr -- --title "Add WhatsApp AI agent" --body "## Summary\n- Adds the webhook service."

# Or keep a longer body in a file, choose the base branch, and target a repo explicitly.
npm run make-pr -- --title "Add WhatsApp AI agent" --body-file PR.md --base main --repo owner/repository
```

Pass `--draft` to create a draft PR, `--dry-run` to inspect the generated `gh` command, or `--help` to see all options. The command checks for an authenticated GitHub CLI and an `origin` remote before creating a PR. If this checkout has no remote, provide `--repo owner/repository` instead.

## Production notes

- Set a long, unique `WHATSAPP_VERIFY_TOKEN`; keep all tokens in secret storage.
- The deduplication set and conversation state are in memory for a small first deployment. Move both to Redis or a database before scaling or relying on restarts.
- WhatsApp has customer-service and template-message policies. This service replies to inbound conversations; use approved templates for business-initiated outbound messaging.
- Add rate limits, message queues, observability, and content moderation appropriate to your use case before accepting customer traffic.
