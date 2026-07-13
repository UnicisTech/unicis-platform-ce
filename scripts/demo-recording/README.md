# Unicis Demo GIF Recorder

Records a real browser session against the Unicis demo and produces a GitHub-README-ready GIF.

## Setup (one-time)

Playwright is already a project dependency, so you just need the browser binary:

```bash
npx playwright install --with-deps chromium
```

You'll also need `ffmpeg` installed:

- macOS: `brew install ffmpeg`
- Ubuntu/Debian: `sudo apt install ffmpeg`

## Steps

1. [record.mjs](record.mjs) is wired to the real Unicis Platform DOM out of the box: it signs in through the single-page email+password form, opens the Cybersecurity Management System module via its stable `/csc` route, filters controls to "Not Performed", then returns to the dashboard. If you want to show a different workflow, edit the walkthrough section — the app has no `data-testid` attributes, so match on real text (`text=...`), ARIA roles (`getByRole("option", { name: ... })`), or link `href` suffixes (`a[href$="/csc"]`) rather than guessing at test ids.

2. Record:

   ```bash
   DEMO_URL=https://platform.unicis.tech \
   DEMO_EMAIL=your-demo-account@example.com \
   DEMO_PASSWORD=yourpassword \
   DEMO_TEAM=unicis-demo \
   node scripts/demo-recording/record.mjs
   ```

   `DEMO_TEAM` is the team slug from its dashboard URL (`/teams/<slug>/dashboard`) — accounts that belong to more than one team land on an "All Teams" picker after login, and the script selects this team from that list. It's optional and defaults to `unicis-demo`; set it if your demo account's team has a different slug (or belongs to only one team).

   This produces a `.webm` file inside `scripts/demo-recording/recordings/`.

3. Convert to GIF:

   ```bash
   chmod +x scripts/demo-recording/convert-to-gif.sh
   scripts/demo-recording/convert-to-gif.sh scripts/demo-recording/recordings/<the-file>.webm unicis-demo.gif
   ```

4. Drop `unicis-demo.gif` into the repo at `public/unicis-demo.gif` and reference it in the README:

   ```markdown
   ![Unicis Platform in action](./public/unicis-demo.gif)
   ```

## Tips for a good README GIF

- Keep it under ~20 seconds of real content — trim dead time (page loads, spinners) rather than showing everything.
- 12 fps is usually enough for UI demos and keeps file size down.
- Record at 1440x900 or similar — GitHub scales it down but starting sharp avoids blurriness.
- If the real demo has any dummy/seeded company data, that's fine and often looks more authentic than an empty account.
- Do 2-3 short GIFs (dashboard overview, one core workflow, one export) rather than one long one — you can drop different ones next to different README sections.

## Note on credentials

This script needs real login credentials for a demo account. Don't commit `.env` files or hardcode credentials into `record.mjs` — always pass them as environment variables at runtime, and use a dedicated demo/seed account rather than any real customer or admin account.
