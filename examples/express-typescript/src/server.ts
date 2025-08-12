import "dotenv/config";
import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import { JwtAuthProvider, DocusignClient } from "@better-docusign/api";

const app = express();
app.use(bodyParser.json());

const auth = new JwtAuthProvider({
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
const docusign = new DocusignClient(auth);


/** Embedded flow (iframe/new tab) — caller provides returnUrl template. */
app.post("/api/docusign/embedded-url", async (req: Request, res: Response) => {
    try {
        const { signer, documentBase64, documentName, returnUrl } = req.body;
        if (!signer?.name || !signer?.email || !signer?.clientUserId) return res.status(400).json({ error: "Missing signer" });
        if (!documentBase64 || !documentName) return res.status(400).json({ error: "Missing documentBase64/documentName" });
        if (!returnUrl) return res.status(400).json({ error: "Missing returnUrl" });

        const { envelopeId, url } = await docusign.createEmbeddedSigningUrl({
            emailSubject: "Please sign",
            document: {
                base64: documentBase64,
                name: documentName
            },
            returnUrl,
            signer: {
                name: signer.name!,
                email: signer.email!,
                clientUserId: signer.clientUserId!
            }
        });

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

        const out = await docusign.createWebFormInstanceUrl(String(formId), {
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

/** Email (remote) signing — DocuSign emails the signer. */
app.post("/api/docusign/send-email", async (req: Request, res: Response) => {
    try {
        const { documentBase64, documentName, signer } = req.body;
        if (!documentBase64 || !documentName) return res.status(400).json({ error: "Missing documentBase64/documentName" });
        if (!signer?.name || !signer?.email) return res.status(400).json({ error: "Missing signer {name,email}" });

        const { envelopeId } = await docusign.sendForEmailSigning({
            emailSubject: "Please sign",
            documents: [{ documentBase64, name: documentName, fileExtension: "pdf", documentId: "1" }],
            recipients: { signers: [{ name: signer.name, email: signer.email, recipientId: "1" /* no clientUserId! */ }] }
            // status will be set to "sent" by the helper
        });
        res.json({ envelopeId, delivery: "email" });
    } catch (e: any) {
        res.status(500).json({ error: e?.message || String(e) });
    }
});

/** Poll envelope status */
app.get("/api/docusign/envelopes/:id", async (req: Request, res: Response) => {
    try {
        const out = await docusign.getEnvelope(req.params.id);
        res.json(out); // { envelopeId, status, statusChangedDateTime, ... }
    } catch (e: any) {
        res.status(500).json({ error: e?.message || String(e) });
    }
});

app.get("/", (_: Request, res: Response) => {
    res.type("html").send(`
<!doctype html>
<html>
<head><meta charset="utf-8"><title>Better DocuSign Demo</title></head>
<body style="font-family:sans-serif; margin:40px;">
  <h1>Better DocuSign</h1>
  <ul>
    <li>POST base64 PDF to <code>/api/docusign/embedded-url</code> with a <code>returnUrl</code>.</li>
    <li>POST to <code>/api/docusign/webforms/instance</code> with a <code>formId</code> for hosted Web Form link.</li>
    <li>POST to <code>/api/docusign/send-email</code> to send via email; GET <code>/api/docusign/envelopes/:id</code> to poll status.</li>
  </ul>
</body>
</html>`);
});

app.listen(3000, () => console.log("Example listening on http://localhost:3000"));
