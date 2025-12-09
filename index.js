const express = require('express');
const SmeeClient = require('smee-client');
const dotenv = require('dotenv');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const path = require('path');

dotenv.config();

const app = express();
const port = 3000;

// Read Private Key (from environment or file)
let privateKey;
if (process.env.PRIVATE_KEY) {
    // Cloud deployment: key is in environment variable
    // Support both raw and base64-encoded keys
    privateKey = process.env.PRIVATE_KEY;

    // If it's base64 encoded (doesn't start with -----BEGIN), decode it
    if (!privateKey.startsWith('-----BEGIN')) {
        privateKey = Buffer.from(privateKey, 'base64').toString('utf8');
    }
} else {
    // Local development: read from file
    const privateKeyPath = path.join(__dirname, process.env.PRIVATE_KEY_PATH || 'private-key.pem');
    privateKey = fs.readFileSync(privateKeyPath, 'utf8');
}
const appId = process.env.APP_ID;

// Middleware to parse JSON payloads
app.use(express.json());

// Main Webhook Handler
app.post('/webhook', async (req, res) => {
    const event = req.headers['x-github-event'];
    const payload = req.body;

    console.log(`Received event: ${event}`);

    // LOGIC: Welcome Wagon
    if (event === 'issues' && payload.action === 'opened') {
        const issue = payload.issue;
        const installationId = payload.installation.id;

        console.log(`New Issue Opened: #${issue.number} by ${issue.user.login}`);

        try {
            await handleNewIssue(installationId, issue);

            // Auto-label if title contains "bug"
            if (issue.title.toLowerCase().includes('bug')) {
                await addLabel(installationId, issue, 'bug');
            }
        } catch (error) {
            console.error('Error handling issue:', error.message);
        }
    }

    res.status(200).send('Webhook received');
});

// Helper: Get Installation Token (Reused logic)
function generateJwt() {
    return jwt.sign({}, privateKey, {
        algorithm: 'RS256',
        expiresIn: '10m',
        issuer: appId
    });
}

async function getAccessToken(installationId) {
    const jwtToken = generateJwt();
    const response = await axios.post(
        `https://api.github.com/app/installations/${installationId}/access_tokens`,
        {},
        {
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        }
    );
    return response.data.token;
}

// Logic: Reply to Issue
async function handleNewIssue(installationId, issue) {
    const token = await getAccessToken(installationId);

    // Post a comment
    const commentUrl = issue.comments_url;
    const message = `👋 Thanks for opening this issue, @${issue.user.login}!\n\nWelcome to **NUXSCASTLE**. A team member will look at this shortly.`;

    await axios.post(
        commentUrl,
        { body: message },
        {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        }
    );
    console.log(`Replied to issue #${issue.number}`);
}

// Logic: Add Label to Issue
async function addLabel(installationId, issue, labelName) {
    const token = await getAccessToken(installationId);

    // Add label to issue
    const labelsUrl = issue.labels_url.replace('{/name}', '');

    await axios.post(
        labelsUrl,
        { labels: [labelName] },
        {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        }
    );
    console.log(`Added label '${labelName}' to issue #${issue.number}`);
}

// Start Server
const server = app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});

// Start Broker (Smee Client)
if (process.env.WEBHOOK_PROXY_URL) {
    const smee = new SmeeClient({
        source: process.env.WEBHOOK_PROXY_URL,
        target: `http://localhost:${port}/webhook`,
        logger: console
    });
    smee.start();
}
