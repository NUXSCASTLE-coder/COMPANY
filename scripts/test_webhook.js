const axios = require('axios');
require('dotenv').config();

const url = process.env.WEBHOOK_PROXY_URL;

if (!url) {
    console.error('No WEBHOOK_PROXY_URL found in .env');
    process.exit(1);
}

console.log(`Sending fake webhook to: ${url}`);

axios.post(url, {
    action: 'opened',
    issue: {
        number: 1337,
        user: { login: 'test-bot' }
    },
    installation: { id: 123 }
}, {
    headers: {
        'x-github-event': 'issues',
        'content-type': 'application/json'
    }
})
    .then(() => console.log('Fake signal sent successfully!'))
    .catch(err => console.error('Failed to send:', err.message));
