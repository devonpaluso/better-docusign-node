import { DocusignClient } from "./client";

/**
 * @deprecated Use client.createWebFormInstanceUrl() instead
 * Create a Web Form instance and return a URL you can redirect/open (hosted flow).
 * Required scopes on your JWT app: signature impersonation webforms_read webforms_instance_read webforms_instance_write
 */
export async function createWebFormInstanceUrl(
    client: DocusignClient,
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
    return client.createWebFormInstanceUrl(formId, opts);
}
