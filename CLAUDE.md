# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

This is a pnpm monorepo for DocuSign integration libraries with three main packages:

- **@better-docusign/core**: Core types and thin helpers (platform-neutral)
- **@better-docusign/api**: Server-side JWT auth, envelope creation, and recipient views (Node.js)
- **@better-docusign/web**: Browser helpers for embedded signing and URL parsing

The project follows a modular architecture where `core` provides shared types, `api` handles server-side DocuSign operations, and `web` provides client-side utilities.

## Common Commands

### Build and Development
```bash
# Build all packages
pnpm build

# Watch mode for development (all packages)
pnpm dev

# Type checking across all packages
pnpm typecheck

# Generate eSignature types from OpenAPI spec
pnpm gen:esign

# Clean build artifacts and node_modules
pnpm clean
```

### Package-specific commands
```bash
# Build a specific package
pnpm --filter @better-docusign/core build

# Watch mode for a specific package
pnpm --filter @better-docusign/api watch

# Type check a specific package
pnpm --filter @better-docusign/web typecheck
```

### Examples
```bash
# Run Express TypeScript example
cd examples/express-typescript && pnpm dev

# Run React web example
cd examples/web-react && pnpm dev

# Build React example
cd examples/web-react && pnpm build
```

## Architecture Overview

### Package Dependencies
- `@better-docusign/api` depends on `@better-docusign/core` and `jose` (JWT handling)
- `@better-docusign/web` depends on `@better-docusign/core`
- All packages are workspace dependencies using `workspace:^`

### Key Modules in @better-docusign/api
- `auth.ts`: JWT authentication provider for DocuSign OAuth
- `client.ts`: Main DocuSign client with account/base URL discovery
- `flows.ts`: High-level signing flows (embedded, email)
- `webforms.ts`: Web Forms API integration
- `remote.ts`: Direct DocuSign API calls

### Build Configuration
- Uses `tsup` for building with both ESM and CJS outputs
- TypeScript target: ES2022 (core/web), Node 18 (api)
- All packages generate `.d.ts` files and sourcemaps
- External dependencies are marked to avoid bundling workspace packages

### Environment Requirements
- Node.js >= 18.17
- Uses pnpm@10.14.0 as package manager
- All examples require DocuSign developer account with JWT authentication setup

### Authentication Flow
The API package uses JWT authentication with DocuSign. Examples expect these environment variables:
- `DOCUSIGN_INTEGRATION_KEY`: Your integration key (GUID)
- `DOCUSIGN_USER_ID`: API username (GUID)
- `DOCUSIGN_PRIVATE_KEY_PATH`: Path to private key file
- `DOCUSIGN_ENV`: "demo" or "prod"

Required scopes typically include: `signature`, `impersonation`, and optionally `webforms_*` for Web Forms functionality.