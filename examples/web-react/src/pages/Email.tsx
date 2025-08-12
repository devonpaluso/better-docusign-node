import React, { useEffect, useRef, useState } from "react";

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

export default function EmailPage() {
    const [name, setName] = useState("Jane Signer");
    const [email, setEmail] = useState("jane@example.com");
    const [status, setStatus] = useState<string>("");
    const [envelopeId, setEnvelopeId] = useState<string>("");
    const [envStatus, setEnvStatus] = useState<string>("");
    const [lastChanged, setLastChanged] = useState<string>("");
    const fileRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        let t: number | undefined;
        async function poll() {
            if (!envelopeId) return;
            try {
                const r = await fetch(`/api/docusign/envelopes/${encodeURIComponent(envelopeId)}`);
                if (r.ok) {
                    const j = await r.json();
                    setEnvStatus(j.status);
                    setLastChanged(j.statusChangedDateTime || "");
                    // stop polling on terminal statuses
                    if (["completed", "declined", "voided"].includes(String(j.status).toLowerCase())) {
                        if (t) clearInterval(t);
                        t = undefined;
                    }
                }
            } catch {}
        }
        if (envelopeId) {
            poll();
            t = window.setInterval(poll, 5000);
        }
        return () => { if (t) clearInterval(t); };
    }, [envelopeId]);

    const sendEmail = async () => {
        try {
            const file = fileRef.current?.files?.[0];
            setStatus("Preparing PDF…");
            const documentBase64 = file
                ? await fileToBase64(file)
                : await fetchSampleToBase64("/sample.pdf");

            setStatus("Sending via Docusign email…");
            const r = await fetch("/api/docusign/send-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    documentBase64,
                    documentName: file?.name || "sample.pdf",
                    signer: { name, email }
                })
            });
            if (!r.ok) throw new Error(await r.text());
            const j = await r.json();
            setEnvelopeId(j.envelopeId);
            setStatus("Sent. Polling status…");
        } catch (err: any) {
            console.error(err);
            setStatus(`Failed: ${err?.message || String(err)}`);
            alert(`Failed: ${err?.message || String(err)}`);
        }
    };

    return (
        <div style={{ padding: 16 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12 }}>
                <input value={name}  onChange={e => setName(e.target.value)}  placeholder="Signer name" />
                <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Signer email" type="email" />
                <input ref={fileRef} type="file" accept="application/pdf" />
                <button onClick={sendEmail}>Send for signing (email)</button>
                <span>{status}</span>
            </div>

            {envelopeId && (
                <div style={{ marginTop: 12 }}>
                    <div><b>Envelope ID:</b> {envelopeId}</div>
                    <div><b>Status:</b> {envStatus || "…"}</div>
                    {lastChanged && <div><b>Last update:</b> {new Date(lastChanged).toLocaleString()}</div>}
                    <p style={{ color: "#666" }}>We’ll stop polling when the envelope is completed/declined/voided.</p>
                </div>
            )}
        </div>
    );
}
