import type {
    EnvelopeDefinition, RecipientViewRequest, EmbeddedSigningInput, EmbeddedSigningResult,
    SignHere, Tabs
} from "@better-docusign/core";

export interface AccountDetails {
    accountId: string;
    baseUriRestApi: string;
}

export interface AuthLike {
    getAccessToken(): Promise<{ accessToken: string; tokenType: string }>;
    authBaseUrl?: string;
}

export class DocusignClient {
    private auth: AuthLike;
    private accountDetails?: AccountDetails;

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
    async account(): Promise<AccountDetails> {
        if (this.accountDetails) return this.accountDetails;
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
        if (!acct) throw new Error("No Docusign accounts on userinfo response");

        this.accountDetails = {
            accountId: acct.account_id,
            baseUriRestApi: `${acct.base_uri}/restapi`,
        };
        return this.accountDetails;
    }

    private async api<T>(path: string, init: RequestInit): Promise<T> {
        const { accessToken } = await this.auth.getAccessToken();
        const resolved = await this.account();
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
        const { accountId } = await this.account();
        return this.api<{ envelopeId: string }>(
            `/v2.1/accounts/${accountId}/envelopes`,
            { method: "POST", body: JSON.stringify(def) }
        );
    }

    async createRecipientView(envelopeId: string, body: RecipientViewRequest) {
        const { accountId } = await this.account();
        return this.api<{ url: string }>(
            `/v2.1/accounts/${accountId}/envelopes/${envelopeId}/views/recipient`,
            { method: "POST", body: JSON.stringify(body) }
        );
    }

    /** Get envelope metadata (status, updated time, etc.) */
    async getEnvelope(envelopeId: string) {
        const { accountId } = await this.account();
        return this.api<{
            envelopeId: string;
            status: "created" | "sent" | "delivered" | "completed" | "declined" | "voided" | string;
            statusChangedDateTime?: string;
        }>(
            `/v2.1/accounts/${accountId}/envelopes/${encodeURIComponent(envelopeId)}`,
            { method: "GET" }
        );
    }

    /** Create embedded signing URL for a document */
    async createEmbeddedSigningUrl(input: EmbeddedSigningInput): Promise<EmbeddedSigningResult> {

        const signHere: SignHere = { anchorString: "/sn1/", anchorUnits: "pixels", anchorYOffset: "0", anchorXOffset: "0" };
        const tabs: Tabs = { signHereTabs: [signHere] };

        const def: EnvelopeDefinition = {
            emailSubject: input.emailSubject,
            documents: [{ documentBase64: input.document.base64, name: input.document.name, fileExtension: input.document.fileExtension ?? "pdf", documentId: "1" }],
            recipients: { signers: [{ name: input.signer.name, email: input.signer.email, recipientId: "1", clientUserId: input.signer.clientUserId, routingOrder: "1", tabs }] },
            status: "sent"
        };

        const { envelopeId } = await this.createEnvelope(def);

        // Replace {envelopeId} placeholder in returnUrl
        const returnUrl = input.returnUrl.includes("{envelopeId}")
            ? input.returnUrl.replace("{envelopeId}", encodeURIComponent(envelopeId))
            : input.returnUrl;

        const viewReq: RecipientViewRequest = {
            userName: input.signer.name,
            email: input.signer.email,
            clientUserId: input.signer.clientUserId,
            returnUrl,
            authenticationMethod: "none" as any,
            pingUrl: input.pingUrl,
            pingFrequency: input.pingFrequency
        };

        const { url } = await this.createRecipientView(envelopeId, viewReq);
        return { envelopeId, url };
    }

    /** Send an envelope for email/remote signing */
    async sendForEmailSigning(def: EnvelopeDefinition): Promise<{ envelopeId: string }> {
        const body: EnvelopeDefinition = { ...def, status: "sent" };
        const { envelopeId } = await this.createEnvelope(body);
        return { envelopeId };
    }

    /** Map auth host → Web Forms API base */
    private webFormsBase() {
        const isDemo = new URL(this.getAuthBaseUrl()).host.includes("account-d.");
        return isDemo
            ? "https://apps-d.docusign.com/api/webforms/v1.1"
            : "https://apps.docusign.com/api/webforms/v1.1";
    }

    /** Create a Web Form instance and return a URL you can redirect/open (hosted flow) */
    async createWebFormInstanceUrl(
        formId: string,
        opts?: {
            clientUserId?: string;
            returnUrl?: string;
            formValues?: Record<string, unknown>;
            tags?: string[];
            expirationOffset?: number;
        }
    ): Promise<{
        url: string;
        instanceId: string;
        tokenExpiresAt: string;
        formUrl: string;
        instanceToken: string;
    }> {
        const { accountId } = await this.account();
        const base = this.webFormsBase();

        const r = await this.authFetch(
            `${base}/accounts/${accountId}/forms/${formId}/instances`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({
                    clientUserId: opts?.clientUserId,
                    returnUrl: opts?.returnUrl,
                    formValues: opts?.formValues,
                    tags: opts?.tags,
                    expirationOffset: opts?.expirationOffset
                })
            }
        );

        if (!r.ok) throw new Error(`WebForms createInstance failed: ${r.status} ${await r.text()}`);

        const j = await r.json() as {
            id: string;
            formUrl: string;
            instanceToken: string;
            tokenExpirationDateTime: string;
        };

        return {
            url: `${j.formUrl}#instanceToken=${encodeURIComponent(j.instanceToken)}`,
            instanceId: j.id,
            tokenExpiresAt: j.tokenExpirationDateTime,
            formUrl: j.formUrl,
            instanceToken: j.instanceToken
        };
    }
}
