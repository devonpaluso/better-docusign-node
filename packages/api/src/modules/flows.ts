import type { 
    EmbeddedSigningInput, EmbeddedSigningResult, 
    EnvelopeDefinition, Tabs, SignHere, RecipientViewRequest 
} from "@better-docusign/core";
import { DocusignClient } from "./client";

/** 
 * @deprecated Use client.createEmbeddedSigningUrl() instead
 */
export async function createEmbeddedSigningUrl(
    client: DocusignClient,
    input: EmbeddedSigningInput,
    opts?: { makeReturnUrl?: (envelopeId: string) => string }
): Promise<EmbeddedSigningResult> {
    // For backward compatibility, handle the old makeReturnUrl callback
    if (opts?.makeReturnUrl) {
        const signHere: SignHere = { anchorString: "/sn1/", anchorUnits: "pixels", anchorYOffset: "0", anchorXOffset: "0" };
        const tabs: Tabs = { signHereTabs: [signHere] };

        const def: EnvelopeDefinition = {
            emailSubject: input.emailSubject,
            documents: [{ 
                documentBase64: (input as any).documentBase64 || input.document?.base64, 
                name: (input as any).documentName || input.document?.name, 
                fileExtension: ((input as any).fileExtension || input.document?.fileExtension) ?? "pdf", 
                documentId: "1" 
            }],
            recipients: { signers: [{ name: input.signer.name, email: input.signer.email, recipientId: "1", clientUserId: input.signer.clientUserId, routingOrder: "1", tabs }] },
            status: "sent"
        };

        const { envelopeId } = await client.createEnvelope(def);

        const computedReturnUrl = opts.makeReturnUrl(envelopeId);
        
        const viewReq: RecipientViewRequest = {
            userName: input.signer.name,
            email: input.signer.email,
            clientUserId: input.signer.clientUserId,
            returnUrl: computedReturnUrl,
            authenticationMethod: "none" as any,
            pingUrl: input.pingUrl,
            pingFrequency: input.pingFrequency
        };

        const { url } = await client.createRecipientView(envelopeId, viewReq);
        return { envelopeId, url };
    }
    
    return client.createEmbeddedSigningUrl(input);
}
