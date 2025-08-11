import "dotenv/config";
import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import { JwtAuthProvider, DocusignClient, createEmbeddedSigningUrl } from "@better-docusign/api";
import { createWebFormInstanceUrl } from "@better-docusign/api/webforms";
import type { EmbeddedSigningInput } from "@better-docusign/core";

const app = express();
app.use(bodyParser.json({ limit: "10mb" }));

/** Build a DocuSign client using env. */
function makeDs() {
    const auth = new JwtAuthProvider({
        // you renamed this — good:
        integrationKey: process.env.DOCUSIGN_INTEGRATION_KEY!,
        userId: process.env.DOCUSIGN_USER_ID!,
        privateKeyPath: process.env.DOCUSIGN_PRIVATE_KEY_PATH!,
        authBaseUrl:
            process.env.DOCUSIGN_ENV === "prod"
                ? "https://account.docusign.com"
                : "https://account-d.docusign.com",
        // include Web Forms scopes if you'll call that API:
        scopes: ["signature", "impersonation", "webforms_read", "webforms_instance_read", "webforms_instance_write"]
    });
    return new DocusignClient(auth);
}

/** Embedded flow (iframe/new tab) — caller provides returnUrl template. */
app.post("/api/docusign/embedded-url", async (req: Request, res: Response) => {
    try {
        const { signer, documentBase64, documentName, returnUrl } = req.body as Partial<EmbeddedSigningInput> & {
            returnUrl?: string;
        };
        if (!signer?.name || !signer?.email || !signer?.clientUserId) return res.status(400).json({ error: "Missing signer" });
        if (!documentBase64 || !documentName) return res.status(400).json({ error: "Missing documentBase64/documentName" });
        if (!returnUrl) return res.status(400).json({ error: "Missing returnUrl" });

        const ds = makeDs();

        const { envelopeId, url } = await createEmbeddedSigningUrl(
            ds,
            {
                emailSubject: "Please sign",
                documentBase64,
                documentName,
                signer: { name: signer.name!, email: signer.email!, clientUserId: signer.clientUserId! }
            },
            {
                makeReturnUrl: (envId) =>
                    returnUrl.includes("{envelopeId}")
                        ? returnUrl.replace("{envelopeId}", encodeURIComponent(envId))
                        : returnUrl
            }
        );

        res.json({ envelopeId, url });
    } catch (e: any) {
        res.status(500).json({ error: e?.message || String(e) });
    }
});

/** Hosted flow via Web Forms — returns a URL to open/redirect to. */
app.post("/api/docusign/webforms/instance", async (req: Request, res: Response) => {
    try {
        const { formId, clientUserId, returnUrl, formValues, tags, expirationOffset } = req.body || {};
        if (!formId) return res.status(400).json({ error: "Missing formId" });

        const ds = makeDs();
        const out = await createWebFormInstanceUrl(ds, String(formId), {
            clientUserId,
            returnUrl,
            formValues,
            tags,
            expirationOffset
        });

        res.json(out); // { url, instanceId, tokenExpiresAt, ... }
    } catch (e: any) {
        res.status(500).json({ error: e?.message || String(e) });
    }
});

app.get("/", (_: Request, res: Response) => {
    res.send('ok');
});

app.listen(3000, () => console.log("Example listening on http://localhost:3000"));
