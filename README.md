# Better DocuSign Node.js SDK

[![npm version](https://img.shields.io/npm/v/@better-docusign/api?style=flat-square)](https://www.npmjs.com/package/@better-docusign/api)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5+-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/npm/l/@better-docusign/api?style=flat-square)](LICENSE)

> A modern, lightweight, and actually usable DocuSign SDK for Node.js and the browser. Built because the official SDK
> is... *really, really, really* terrible.

## Why This Exists

The official DocuSign Node.js SDK is a nightmare:

- **Outdated and confusing APIs** with poor TypeScript support
- **Poor documentation** and confusing examples
- **Painful developer experience** that makes simple tasks hard
- **No attention from maintainers** - no plans to fix reported issues

This SDK provides a clean, modern alternative that actually makes sense.

## Features

✅ **Modern TypeScript-first** - Full type safety and IntelliSense  
✅ **Tiny bundle size** - Only what you need, when you need it  
✅ **Zero bloat** - No unnecessary dependencies  
✅ **Simple API** - Intuitive methods that do what you expect  
✅ **JWT Authentication** - Built-in support with proper error handling  
✅ **Both Node.js and Browser** - Unified experience across platforms  
✅ **Focused DocuSign API coverage** - Including Web Forms, embedded signing, etc.

## Quick Start

### Installation

Server-side:

```bash
npm install @better-docusign/api
```

Browser-side:

```bash
npm install @better-docusign/web
```

### Server-side (Express.js / TypeScript)

```typescript
import { JwtAuthProvider, DocusignClient } from '@better-docusign/api';

// Set up authentication
const auth = new JwtAuthProvider({
    integrationKey: 'your-integration-key',
    userId: 'your-user-id',
    privateKeyPath: './private.key',
    authBaseUrl: 'https://account-d.docusign.com', // demo environment
    scopes: ['signature', 'impersonation']
});

// Create client
const docusign = new DocusignClient(auth);

// Embedded signing endpoint
app.post('/api/docusign/embedded-url', async (req, res) => {

    const { signer, document, returnUrl } = req.body;

    const { url, envelopeId } = await docusign.createEmbeddedSigningUrl({
        emailSubject: 'Please sign this document',
        document: {
            base64: document.base64,
            name: document.name
        },
        signer: {
            name: signer.name,
            email: signer.email,
            clientUserId: signer.clientUserId
        },
        returnUrl
    });

    res.json({ url, envelopeId });
});

```

### Client-side (Browser)

```typescript
import { createEmbeddedUrl, openInIframe } from '@better-docusign/web';

// Call your backend to get embedded signing URL
const { url } = await createEmbeddedUrl('/api/docusign/embedded-url', {
    emailSubject: 'Please sign this document',
    document: {
        base64: documentBase64,
        name: 'contract.pdf'
    },
    signer: {
        name: 'John Doe',
        email: 'john@example.com',
        clientUserId: 'user123' // Your unique identifier for the signer
    },
    returnUrl: `${window.location.origin}/signing-complete?envelopeId={envelopeId}` // Use {envelopeId} as variable
});

// Then, set iframe source with [url];
```

## Examples

Working examples are included in the `/examples` directory:

- **`express-typescript/`** - Full Express.js backend with all signing flows
- **`web-react/`** - React frontend demonstrating embedded signing

Both examples include complete setup instructions and `.env` templates.

## Requirements

- **Node.js** >= 18.17
- **TypeScript** 5.5+ (recommended)
- **DocuSign Developer Account** with JWT authentication

## Architecture

This is a **pnpm monorepo** with three focused packages:

### 📦 `@better-docusign/core`

Platform-neutral types and utilities. The foundation that other packages build on.

### 🚀 `@better-docusign/api`

Server-side Node.js package for JWT authentication, envelope creation, and DocuSign API calls.

### 🌐 `@better-docusign/web`

Browser helpers for embedded signing, URL parsing, and client-side integrations.

## License

MIT

## Contributing

Issues and PRs welcome! This is a community-driven effort to make DocuSign integration sane.

---

*Finally, a DocuSign SDK that doesn't make you want to throw your computer out the window.* 🚀