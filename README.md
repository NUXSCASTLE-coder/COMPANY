# COMPANY - GitHub App Integration

This repository contains scripts and tools for integrating with our GitHub App.

## Prerequisites

- **Node.js**: Ensure Node.js is installed.
- **Private Key**: Poplar the `private-key.pem` file in the root directory (not committed for security).

## Installation

1.  Clone the repository.
2.  Install dependencies:
    ```bash
    npm install
    ```

## Usage

### Generate Installation Token

To generate a temporary Installation Access Token (valid for 1 hour):

```bash
node scripts/generate_token.js <APP_ID>
```

Replace `<APP_ID>` with your GitHub App ID.

## Security Note

- **Never commit your `private-key.pem`.**
- The `.gitignore` file is configured to exclude sensitive files.
