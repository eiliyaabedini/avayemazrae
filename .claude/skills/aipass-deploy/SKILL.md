---
name: aipass-deploy
description: Deploy this project to AI Pass Spaces. Use when user says "deploy", "publish", or "push to AI Pass".
---

# Deploy to AI Pass Spaces

## Credentials (ask user if not set)

- `AIPASS_API_KEY`: ask user or read from env
- Space handle: ask user (e.g. `@theirhandle`)
- OAuth client ID: ask user (from https://aipass.one/panel/developer.html → OAuth2 Clients)
- Space URL: `https://aipass.one/spaces/<handle>`

## Deploy workflow

1. **Convert to single HTML file** — AI Pass Spaces requires one self-contained HTML file. Inline all JS/CSS. Use CDN links for libraries (Tailwind, Dexie, Chart.js, etc.).

2. **Use AI Pass SDK for AI features** — Never call OpenAI/Anthropic/Google directly. Use the SDK:
   - Text generation: `AiPass.streamText(opts, onToken)` for visible output, `AiPass.generateCompletion(opts)` for programmatic use
   - Image edit: `AiPass.editImage({ image, prompt, model, quality: 'low' })`
   - Transcription: `AiPass.transcribeAudio({ audioFile, language })` — note: param is `audioFile`, NOT `file`
   - Per-user data: `AiPass.data.get()` / `AiPass.data.set(obj)`

3. **HTML boilerplate** — Every published app MUST include:
   ```html
   <!DOCTYPE html>
   <html lang="en">
   <head>
     <meta charset="UTF-8">
     <meta name="viewport" content="width=device-width, initial-scale=1.0">
     <title>App Name — AI Pass</title>
     <link rel="stylesheet" href="https://aipass.one/aipass-ui.css">
   </head>
   <body>
     <header style="display:flex;justify-content:space-between;padding:12px 20px">
       <a href="/">AI Pass</a>
       <div data-aipass-button></div>
     </header>
     <main><!-- Your app UI here --></main>
     <script src="https://aipass.one/aipass-sdk.js"></script>
     <script>
       AiPass.initialize({ clientId: 'PLACEHOLDER_CLIENT_ID', requireLogin: false });
     </script>
   </body>
   </html>
   ```

4. **Critical rules**:
   - Keep `PLACEHOLDER_CLIENT_ID` as literal string — server substitutes it
   - Use `requireLogin: false` — SDK gates protected calls automatically
   - Keep `<div data-aipass-button></div>` in the DOM — SDK mounts auth widget there
   - Do NOT pass `maxTokens` to `streamText`/`generateCompletion` unless truncating
   - Do NOT gate UI on `AiPass.isAuthenticated()` — let SDK handle auth modals
   - For `editImage`, always pass `quality: 'low'` unless high quality needed

5. **Publish via API**:
   ```bash
   # Write HTML to /tmp/app.html, then:
   python3 -c "
   import json
   with open('/tmp/app.html', 'r') as f:
       html = f.read()
   payload = {
       'slug': 'app-slug',
       'name': 'App Name',
       'shortDescription': 'One-line description',
       'iconEmoji': '🎨',
       'htmlContent': html,
       'status': 'PUBLISHED'
   }
   with open('/tmp/aipass-publish.json', 'w') as f:
       json.dump(payload, f, ensure_ascii=False)
   "
   curl -s -X POST https://aipass.one/api/v1/spaces/me/apps \
     -H "Authorization: Bearer $AIPASS_API_KEY" \
     -H "Content-Type: application/json" \
     -d @/tmp/aipass-publish.json
   ```

6. **Update existing app**: Use PUT with the same slug instead of POST. Same JSON body format.

7. **Verify**: Always check the published URL renders correctly before telling the user it's done.
