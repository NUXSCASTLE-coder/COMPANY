---
description: Create GitHub App and Generate Token
---

1. **Create GitHub App**:
   - Go to [GitHub Developer Settings](https://github.com/settings/apps/new).
   - **Name**: Choose a unique name (e.g., `Company-Integration-App`).
   - **Homepage URL**: `https://example.com` (can be anything).
   - **Webhook**: Uncheck "Active" (unless you need webhooks).
   - **Permissions**: Select permissions (e.g., `Contents: Read & write` if you need to push code).
   - Click **Create GitHub App**.

2. **Note App ID**:
   - On the App page, find the **App ID** (an integer, e.g., `1098765`). Save this for step 4.

3. **Get Private Key**:
   - Scroll down to "Private keys".
   - Click **Generate a private key**.
   - A `.pem` file will download.
   - **Action**: Rename this file to `private-key.pem` and move it to `c:/Desktop/COMPANY/private-key.pem`.

4. **Install App**:
   - Go to "Install App" in the sidebar.
   - Install it on your repository or account.

5. **Install Script Dependencies**:
   // turbo
   Run `npm install jsonwebtoken axios`

6. **Generate Token**:
   - Replace `<APP_ID>` below with your App ID from Step 2.
   Run `node scripts/generate_token.js <APP_ID>`
