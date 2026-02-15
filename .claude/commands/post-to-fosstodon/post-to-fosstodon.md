# Post to Fosstodon

Post a status to Fosstodon (Mastodon). Takes a message and optional URL as arguments.

## Instructions

Run from the project root:

```bash
bun --install=auto .claude/commands/post-to-fosstodon/post.ts "<message>" [url]
```

The script reads `MASTODON_TOKEN` from `.env` in the project root. If the env var isn't set, tell the user to copy `.env.example` to `.env` and add their token from https://fosstodon.org/settings/applications.

Mastodon has a 500 character limit. If the message + URL exceed that, ask the user to shorten it before posting.
