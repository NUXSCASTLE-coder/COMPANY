const fs = require('fs');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const path = require('path');

// Configuration
// Usage: node scripts/generate_token.js <APP_ID>
const privateKeyName = 'private-key.pem';
const PRIVATE_KEY_PATH = path.join(__dirname, '../', privateKeyName);

async function generateToken() {
    const appId = process.argv[2];

    if (!appId) {
        console.error('Error: Please provide the App ID as an argument.');
        console.error('Usage: node scripts/generate_token.js <APP_ID>');
        process.exit(1);
    }

    try {
        if (!fs.existsSync(PRIVATE_KEY_PATH)) {
            console.error(`Error: Private key not found at ${PRIVATE_KEY_PATH}`);
            console.log(`Please place your downloaded .pem file in the project root and name it '${privateKeyName}'.`);
            process.exit(1);
        }

        const privateKey = fs.readFileSync(PRIVATE_KEY_PATH, 'utf8');

        // 1. Generate JWT
        const token = jwt.sign({}, privateKey, {
            algorithm: 'RS256',
            expiresIn: '10m',
            issuer: appId
        });

        console.log('JWT generated successfully.');
        console.log(`Fetching installations for App ID: ${appId}...`);

        // 2. Get Installation ID
        const installationsResponse = await axios.get('https://api.github.com/app/installations', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (installationsResponse.data.length === 0) {
            console.log('\nNO INSTALLATIONS FOUND.');
            console.log('Please install the App on your repository/account first:');
            console.log(`https://github.com/apps/${appId}/installations/new (URL may vary, check App settings)`);
            console.log('Or go to "Install App" in your GitHub App settings.');
            process.exit(1);
        }

        const installationId = installationsResponse.data[0].id;
        console.log(`Found Installation ID: ${installationId} (Account: ${installationsResponse.data[0].account.login})`);

        // 3. Generate Installation Access Token
        const accessResponse = await axios.post(
            `https://api.github.com/app/installations/${installationId}/access_tokens`,
            {},
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            }
        );

        console.log('\n--- INSTALLATION ACCESS TOKEN ---');
        console.log(accessResponse.data.token);
        console.log('---------------------------------\n');

    } catch (error) {
        if (error.response) {
            console.error('API Error:', error.response.status, error.response.data);
        } else {
            console.error('Error:', error.message);
        }
    }
}

generateToken();
