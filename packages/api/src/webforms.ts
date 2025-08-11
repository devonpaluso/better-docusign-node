import { DocusignClient } from "./client";

/** Map auth host → Web Forms API base. */
function webFormsBase(authBaseUrl: string) {
    const isDemo = new URL(authBaseUrl).host.includes("account-d.");
    return isDemo
        ? "https://apps-d.docusign.com/api/webforms/v1.1"
        : "https://apps.docusign.com/api/webforms/v1.1";
}

/**
 * Create a Web Form instance and return a URL you can redirect/open (hosted flow).
 * Required scopes on your JWT app: signature impersonation webforms_read webforms_instance_read webforms_instance_write
 */
export async function createWebFormInstanceUrl(
    client: DocusignClient,
    formId: string,
    opts?: {
        clientUserId?: string;
        returnUrl?: string;                // where to send the user after submission
        formValues?: Record<string, unknown>;
        tags?: string[];
        expirationOffset?: number;         // seconds until token expires (server may bound it)
    }
): Promise<{
    url: string;              // ready-to-open URL (short-lived)
    instanceId: string;
    tokenExpiresAt: string;   // ISO timestamp
    formUrl: string;
    instanceToken: string;
}> {
    const { accountId } = await client.resolve();
    const base = webFormsBase(client.getAuthBaseUrl());

    const r = await client.authFetch(
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
