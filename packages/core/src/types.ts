// You can replace these with OpenAPI-derived types later.
// For now we use a minimal structural subset that matches Docusign.
export interface EnvelopeDefinition {
    emailSubject?: string;
    documents?: Array<{
        documentBase64?: string;
        name?: string;
        fileExtension?: string;
        documentId?: string;
    }>;
    recipients?: {
        signers?: Array<{
            name?: string;
            email?: string;
            recipientId?: string;
            clientUserId?: string;
            routingOrder?: string;
            tabs?: Tabs;
            embeddedRecipientStartURL?: string;
        }>;
    };
    status?: "created" | "sent" | "completed" | string;
}

export interface Tabs {
    signHereTabs?: SignHere[];
    [k: string]: any;
}

export interface SignHere {
    anchorString?: string;
    anchorUnits?: string;
    anchorYOffset?: string;
    anchorXOffset?: string;
    xPosition?: string;
    yPosition?: string;
    documentId?: string;
    pageNumber?: string;
}

export interface RecipientViewRequest {
    userName?: string;          // NOTE: Docusign expects userName (camel case)
    email?: string;
    clientUserId?: string;
    returnUrl?: string;
    authenticationMethod?: string; // e.g. "none"
    pingUrl?: string;
    pingFrequency?: string;
    [k: string]: any;
}

// Shared DTOs for our thin-path helpers
export interface EmbeddedSigningInput {
    emailSubject: string;
    document: {
        base64: string;
        name: string;
        fileExtension?: string;
    };
    signer: { name: string; email: string; clientUserId: string };
    returnUrl: string;  // Required - supports {envelopeId} placeholder
    pingUrl?: string;
    pingFrequency?: string;
}
export interface EmbeddedSigningResult {
    envelopeId: string;
    url: string;
}

// Convenience builder for 1-doc / 1-signer envelopes with an anchor-based SignHere
export function envelopeFromPdf(params: {
    emailSubject: string;
    documentBase64: string;
    documentName: string;
    fileExtension?: string;
    signer: { name: string; email: string; clientUserId: string };
}): EnvelopeDefinition {
    const signHere: SignHere = {
        anchorString: "/sn1/",
        anchorUnits: "pixels",
        anchorYOffset: "0",
        anchorXOffset: "0",
    };
    const tabs: Tabs = { signHereTabs: [signHere] };
    return {
        emailSubject: params.emailSubject,
        documents: [
            {
                documentBase64: params.documentBase64,
                name: params.documentName,
                fileExtension: params.fileExtension ?? "pdf",
                documentId: "1",
            },
        ],
        recipients: {
            signers: [
                {
                    name: params.signer.name,
                    email: params.signer.email,
                    recipientId: "1",
                    clientUserId: params.signer.clientUserId,
                    routingOrder: "1",
                    tabs,
                },
            ],
        },
        status: "sent",
    };
}
