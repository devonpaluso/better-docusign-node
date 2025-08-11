import React, { useCallback, useMemo, useRef, useState } from "react";
import { createEmbeddedUrlViaBackend, parseReturnUrl } from "@better-docusign/web";

function bytesToBase64(buf: ArrayBuffer) {
    let binary = "";
    const bytes = new Uint8Array(buf);
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
}

async function fileToBase64(f: File) {
    return bytesToBase64(await f.arrayBuffer());
}

async function fetchSampleToBase64(url: string) {
    const buf = await fetch(url).then(r => r.arrayBuffer());
    return bytesToBase64(buf);
}

export default function App() {
    const [name, setName] = useState("Jane Signer");
    const [email, setEmail] = useState("jane@example.com");
    const [cuid, setCuid] = useState("user-123");
    const [status, setStatus] = useState<string>("");
    const [signingUrl, setSigningUrl] = useState<string>("");
    const fileRef = useRef<HTMLInputElement>(null);

    // If the SPA routes back to /docusign/return, show the result
    const returnInfo = useMemo(() => {
        if (location.pathname.startsWith("/docusign/return")) {
            return parseReturnUrl(location.href);
        }
        return null;
    }, []);

    const start = useCallback(async () => {
        try {
            setStatus("Preparing PDF…");
            const file = fileRef.current?.files?.[0];
            const documentBase64 = file
                ? await fileToBase64(file)
                : await fetchSampleToBase64("/sample.pdf"); // optional fallback if you add public/sample.pdf

            setStatus("Requesting embedded URL…");
            const { url } = await createEmbeddedUrlViaBackend("/api/docusign/embedded-url", {
                emailSubject: "Please sign",
                documentBase64,
                documentName: file?.name || "sample.pdf",
                signer: { name, email, clientUserId: cuid },
                returnUrl: `${window.location.origin}/docusign/return?envelopeId={envelopeId}`
            });

            setSigningUrl(url);
            setStatus("");
        } catch (err: any) {
            console.error(err);
            setStatus(`Failed: ${err?.message || String(err)}`);
            alert(`Failed: ${err?.message || String(err)}`);
        }
    }, [name, email, cuid]);

    if (returnInfo) {
        return (
            <pre style={{ padding: 16 }}>{JSON.stringify(returnInfo, null, 2)}</pre>
        );
    }

    return (
        <div style={{ display: "grid", gridTemplateRows: "auto 1fr", height: "100vh", fontFamily: "system-ui, sans-serif" }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", padding: 12, borderBottom: "1px solid #eee" }}>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Signer name" />
                <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Signer email" type="email" />
                <input value={cuid} onChange={e => setCuid(e.target.value)} placeholder="clientUserId" />
                <input ref={fileRef} type="file" accept="application/pdf" />
                {!status && !signingUrl && <button onClick={start}>Start signing</button>}
                <span>{status}</span>
            </div>

            <div style={{ height: "100%", width: '100%', position: "relative" }}>
                {signingUrl ? (
                    <iframe
                        src={signingUrl}
                        style={{ width: "100%", height: "100%", border: 0, display: "block" }}
                        allow="clipboard-read; clipboard-write"
                    />
                ) : (
                    <div style={{ padding: 16, color: "#666" }}>
                        Choose a PDF (or drop <code>public/sample.pdf</code>) and click <b>Start signing</b>.
                    </div>
                )}
            </div>
        </div>
    );
}
