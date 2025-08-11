import type { EmbeddedSigningInput, EmbeddedSigningResult } from "@better-docusign/core";

export async function createEmbeddedSigningUrl(_: EmbeddedSigningInput): Promise<EmbeddedSigningResult> {
    // Placeholder; implement real flow (JWT → userinfo → createEnvelope → recipientView) here.
    return { envelopeId: "TBD", url: "https://example.com/sign" };
}
