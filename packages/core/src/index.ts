// Fill with real exports later. Safe placeholder so builds succeed.
export const CORE_VERSION = "0.1.0";

// Example shared DTOs (adjust as you wire in OpenAPI types)
export interface EmbeddedSigningInput {
    emailSubject: string;
    documentBase64: string;
    documentName: string;
    fileExtension?: string;
    signer: { name: string; email: string; clientUserId: string };
    returnUrl: string;
    pingUrl?: string;
    pingFrequency?: string;
}
export interface EmbeddedSigningResult {
    envelopeId: string;
    url: string;
}
