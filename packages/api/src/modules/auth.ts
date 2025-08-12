// packages/api/src/auth.ts
import { readFileSync } from "node:fs";
import { createPrivateKey } from "node:crypto";
import { importPKCS8, SignJWT } from "jose";

type BaseCfg = {
    /** Your Docusign Integration Key (GUID). Prefer this name; `clientId` still works as an alias. */
    integrationKey?: string;
    clientId?: string;                 // legacy alias
    /** API Username (GUID) of the impersonated user */
    userId: string;
    /** demo: https://account-d.docusign.com, prod: https://account.docusign.com */
    authBaseUrl?: string;
    /** Scopes you need. Defaults to signature + impersonation. Add webforms_* if you use Web Forms. */
    scopes?: string[];
    /** Private key (one of): */
    privateKeyPath?: string;           // preferred
    privateKeyPem?: string;            // fallback
    privateKeyPassphrase?: string;     // only if your key file is encrypted
};

export type JwtAuthConfig = BaseCfg;

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
    privateKeyPath?: string;
    privateKeyPem?: string;
    privateKeyPassphrase?: string;
}

/** Thrown when JWT flow needs user/admin consent. Includes ready URLs. */
export class ConsentRequiredError extends Error {
    readonly code = "CONSENT_REQUIRED";
    constructor(
        message: string,
        public readonly urls: { userConsentUrl: string; adminConsentUrl: string }
    ) {
        super(message);
        this.name = "ConsentRequiredError";
    }
}

function loadPem(cfg: InternalConfig): string {
    if (cfg.privateKeyPath) return readFileSync(cfg.privateKeyPath, "utf8");
    if (cfg.privateKeyPem) return cfg.privateKeyPem;
    throw new Error("No private key provided (set privateKeyPath or privateKeyPem)");
}

function toPkcs8Pem(pem: string, passphrase?: string): string {
    // Accept PKCS#1 (BEGIN RSA PRIVATE KEY) or PKCS#8 (BEGIN PRIVATE KEY), encrypted or not
    const keyObj = createPrivateKey({ key: pem, format: "pem", passphrase });
    return keyObj.export({ type: "pkcs8", format: "pem" }).toString();
}

function buildConsentUrls(authBaseUrl: string, integrationKey: string, scopes: string[]) {
    const host = new URL(authBaseUrl).host; // account-d.docusign.com | account.docusign.com
    const base = `https://${host}/oauth/auth`;
    const params = new URLSearchParams({
        response_type: "code",
        // space-delimited per DS; URLSearchParams will encode spaces as %20
        scope: scopes.join(" "),
        client_id: integrationKey,
        // DS examples typically use their site; any HTTPS URL you control is fine
        redirect_uri: "https://www.docusign.com"
    }).toString();
    const userConsentUrl = `${base}?${params}`;
    const adminConsentUrl = userConsentUrl; // same endpoint; sign in as an account admin to grant org-wide
    return { userConsentUrl, adminConsentUrl };
}

export class JwtAuthProvider {
    private cfg: InternalConfig;
    private cached?: AccessToken;

    constructor(cfg: JwtAuthConfig) {
        const integrationKey = (cfg.integrationKey ?? cfg.clientId)?.trim();
        if (!integrationKey) throw new Error("Missing Integration Key (set integrationKey or clientId)");

        this.cfg = {
            integrationKey,
            userId: cfg.userId,
            authBaseUrl: cfg.authBaseUrl ?? "https://account-d.docusign.com",
            scopes: cfg.scopes ?? ["signature", "impersonation"],
            privateKeyPath: cfg.privateKeyPath,
            privateKeyPem: cfg.privateKeyPem,
            privateKeyPassphrase: cfg.privateKeyPassphrase
        };
    }

    get authBaseUrl() {
        return this.cfg.authBaseUrl;
    }

    async getAccessToken(): Promise<AccessToken> {
        // reuse if >60s left
        if (this.cached && this.cached.expiresAt - Date.now() > 60_000) return this.cached;

        const rawPem = loadPem(this.cfg);
        const pkcs8Pem = toPkcs8Pem(rawPem, this.cfg.privateKeyPassphrase);
        const pk = await importPKCS8(pkcs8Pem, "RS256");

        const now = Math.floor(Date.now() / 1000);
        const audHost = new URL(this.cfg.authBaseUrl).host; // IMPORTANT: host-only audience
        const assertion = await new SignJWT({ scope: this.cfg.scopes.join(" ") })
            .setProtectedHeader({ alg: "RS256", typ: "JWT" })
            .setIssuer(this.cfg.integrationKey)     // iss
            .setSubject(this.cfg.userId)            // sub
            .setAudience(audHost)                   // aud
            .setIssuedAt(now)
            .setExpirationTime(now + 60 * 5)        // 5 min
            .sign(pk);

        const body = new URLSearchParams({
            grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
            assertion
        });

        const resp = await fetch(`${this.cfg.authBaseUrl}/oauth/token`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body
        });

        if (!resp.ok) {
            const text = await resp.text();
            // Try to detect consent case and help the developer
            try {
                const j = JSON.parse(text) as { error?: string; error_description?: string };
                const isConsent = (j.error === "consent_required") ||
                    /consent/i.test(j.error || "") ||
                    /consent/i.test(j.error_description || "");
                if (isConsent) {
                    const urls = buildConsentUrls(this.cfg.authBaseUrl, this.cfg.integrationKey, this.cfg.scopes);
                    // Friendly console guidance
                    // eslint-disable-next-line no-console
                    console.error(
                        [
                            "Docusign JWT consent required.",
                            `  Environment: ${this.cfg.authBaseUrl}`,
                            `  Integration Key: ${this.cfg.integrationKey}`,
                            `  Scopes: ${this.cfg.scopes.join(" ")}`,
                            "  Grant consent as the IMPERSONATED USER:",
                            `    → ${urls.userConsentUrl}`,
                            "  Or sign in as an ACCOUNT ADMIN at that same link to grant org-wide consent.",
                            "  After granting, re-run your request."
                        ].join("\n")
                    );
                    throw new ConsentRequiredError("Docusign consent required", urls);
                }
            } catch {
                // ignore JSON parse error; fall through to generic throw
            }
            throw new Error(`OAuth token error: ${resp.status} ${text}`);
        }

        const json = (await resp.json()) as { access_token: string; token_type: string; expires_in: number };
        this.cached = {
            accessToken: json.access_token,
            tokenType: json.token_type,
            expiresAt: Date.now() + (json.expires_in - 60) * 1000
        };
        return this.cached;
    }
}
