import { readFileSync } from "node:fs";
import { createPrivateKey } from "node:crypto";
import { importPKCS8, SignJWT } from "jose";

type BaseCfg = {
    integrationKey: string;              // Integration Key (GUID)
    userId: string;                // API Username (GUID) of impersonated user
    authBaseUrl?: string;          // demo: https://account-d.docusign.com, prod: https://account.docusign.com
    scopes?: string[];             // default: ["signature","impersonation"]
    privateKeyPassphrase?: string; // only if the file is encrypted
};

export type JwtAuthConfig =
    | (BaseCfg & { privateKeyPath: string; privateKeyPem?: never })
    | (BaseCfg & { privateKeyPem: string; privateKeyPath?: never });

export interface AccessToken {
    accessToken: string;
    tokenType: string;
    expiresAt: number; // epoch ms
}

interface InternalConfig {
    integrationKey: string;
    userId: string;
    authBaseUrl: string;
    scopes: string[];
    privateKeyPassphrase?: string;
    // one of:
    privateKeyPath?: string;
    privateKeyPem?: string;
}

function loadPemFromConfig(cfg: InternalConfig): string {
    if (cfg.privateKeyPath) {
        return readFileSync(cfg.privateKeyPath, "utf8");
    }
    if (cfg.privateKeyPem) {
        return cfg.privateKeyPem;
    }
    throw new Error("No private key provided (need privateKeyPath or privateKeyPem)");
}

function toPkcs8Pem(pem: string, passphrase?: string): string {
    // Accept PKCS#1 (BEGIN RSA PRIVATE KEY) or PKCS#8 (BEGIN PRIVATE KEY), encrypted or not
    const keyObj = createPrivateKey({ key: pem, format: "pem", passphrase });
    return keyObj.export({ type: "pkcs8", format: "pem" }).toString();
}

export class JwtAuthProvider {
    private cfg: InternalConfig;
    private cached?: AccessToken;

    constructor(cfg: JwtAuthConfig) {
        this.cfg = {
            integrationKey: cfg.integrationKey,
            userId: cfg.userId,
            authBaseUrl: cfg.authBaseUrl ?? "https://account-d.docusign.com",
            scopes: cfg.scopes ?? ["signature", "impersonation"],
            privateKeyPassphrase: cfg.privateKeyPassphrase,
            privateKeyPath: (cfg as any).privateKeyPath,
            privateKeyPem: (cfg as any).privateKeyPem
        };
    }

    get authBaseUrl() {
        return this.cfg.authBaseUrl;
    }

    async getAccessToken(): Promise<AccessToken> {
        if (this.cached && this.cached.expiresAt - Date.now() > 60_000) return this.cached;

        const rawPem = loadPemFromConfig(this.cfg);
        const pkcs8Pem = toPkcs8Pem(rawPem, this.cfg.privateKeyPassphrase);
        const pk = await importPKCS8(pkcs8Pem, "RS256");

        const now = Math.floor(Date.now() / 1000);
        const aud = new URL(this.cfg.authBaseUrl).host; // "account-d.docusign.com" or "account.docusign.com"
        const assertion = await new SignJWT({ scope: this.cfg.scopes.join(" ") })
            .setProtectedHeader({ alg: "RS256", typ: "JWT" })
            .setIssuer(this.cfg.integrationKey)
            .setSubject(this.cfg.userId)
            .setAudience(aud)
            .setIssuedAt(now)
            .setExpirationTime(now + 60 * 5)
            .sign(pk);

        const body = new URLSearchParams({
            grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
            assertion,
        });

        const resp = await fetch(`${this.cfg.authBaseUrl}/oauth/token`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body,
        });
        if (!resp.ok) throw new Error(`OAuth token error: ${resp.status} ${await resp.text()}`);

        const json = (await resp.json()) as { access_token: string; token_type: string; expires_in: number };
        this.cached = {
            accessToken: json.access_token,
            tokenType: json.token_type,
            expiresAt: Date.now() + (json.expires_in - 60) * 1000,
        };
        return this.cached;
    }
}
