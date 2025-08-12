import type { EnvelopeDefinition } from "@better-docusign/core";
import { DocusignClient } from "./client";

/**
 * @deprecated Use client.sendForEmailSigning() instead
 * Send an envelope for email/remote signing.
 * IMPORTANT: recipients.signers must NOT include clientUserId for email flow.
 */
export async function sendForEmailSigning(
    client: DocusignClient,
    def: EnvelopeDefinition
): Promise<{ envelopeId: string }> {
    return client.sendForEmailSigning(def);
}
