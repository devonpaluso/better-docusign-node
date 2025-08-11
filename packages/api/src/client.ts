import type { EnvelopeDefinition, RecipientViewRequest } from "@better-docusign/core";

export interface ResolvedAccount {
    accountId: string;
    baseUriRestApi: string;
}

export interface AuthLike {
    getAccessToken(): Promise<{ accessToken: string; tokenType: string }>;
    authBaseUrl?: string;
}

export class DocusignClient {
    private auth: AuthLike;
    private resolved?: ResolvedAccount;

    constructor(auth: AuthLike) {
        this.auth = auth;
    }

    /** Host where we authenticate (used to derive product hosts like Web Forms). */
    getAuthBaseUrl(): string {
        if (!this.auth.authBaseUrl) throw new Error("authBaseUrl is required");
        return this.auth.authBaseUrl;
    }

    /** Get a fresh bearer token (kept internal). */
    async getAccessToken() {
        return this.auth.getAccessToken();
    }

    /** Fetch with Authorization header applied. */
    async authFetch(url: string, init: RequestInit = {}) {
        const { accessToken } = await this.auth.getAccessToken();
        const headers = {
            ...(init.headers || {}),
            Authorization: `Bearer ${accessToken}`,
        } as Record<string, string>;
        return fetch(url, { ...init, headers });
    }

    /** Resolve default account + base REST URI via /oauth/userinfo. */
    async resolve(): Promise<ResolvedAccount> {
        if (this.resolved) return this.resolved;
        if (!this.auth.authBaseUrl) throw new Error("auth.authBaseUrl is required");

        const { accessToken } = await this.auth.getAccessToken();
        const resp = await fetch(`${this.auth.authBaseUrl}/oauth/userinfo`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        if (!resp.ok) throw new Error(`userinfo failed: ${resp.status}`);
        const json = await resp.json() as {
            accounts: Array<{ account_id: string; is_default: boolean; base_uri: string }>;
        };
        const acct = json.accounts.find(a => a.is_default) ?? json.accounts[0];
        if (!acct) throw new Error("No DocuSign accounts on userinfo response");

        this.resolved = {
            accountId: acct.account_id,
            baseUriRestApi: `${acct.base_uri}/restapi`,
        };
        return this.resolved;
    }

    private async api<T>(path: string, init: RequestInit): Promise<T> {
        const { accessToken } = await this.auth.getAccessToken();
        const resolved = await this.resolve();
        const resp = await fetch(`${resolved.baseUriRestApi}${path}`, {
            ...init,
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
                ...(init.headers || {}),
            },
        });
        if (!resp.ok) {
            const text = await resp.text();
            throw new Error(`${init.method || "GET"} ${path} → ${resp.status} ${text}`);
        }
        return resp.json() as Promise<T>;
    }

    async createEnvelope(def: EnvelopeDefinition) {
        const { accountId } = await this.resolve();
        return this.api<{ envelopeId: string }>(
            `/v2.1/accounts/${accountId}/envelopes`,
            { method: "POST", body: JSON.stringify(def) }
        );
    }

    async createRecipientView(envelopeId: string, body: RecipientViewRequest) {
        const { accountId } = await this.resolve();
        return this.api<{ url: string }>(
            `/v2.1/accounts/${accountId}/envelopes/${envelopeId}/views/recipient`,
            { method: "POST", body: JSON.stringify(body) }
        );
    }
}
