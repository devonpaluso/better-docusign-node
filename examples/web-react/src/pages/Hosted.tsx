import React, { useState } from "react";

export default function Hosted() {
    const [formId, setFormId] = useState("");
    const [returnUrl, setReturnUrl] = useState(`${window.location.origin}/docusign/return`);
    const [status, setStatus] = useState<string>("");

    const start = async () => {
        try {
            if (!formId) return alert("Enter a Web Form ID");
            setStatus("Creating Web Form instance…");

            const r = await fetch("/api/docusign/webforms/instance", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ formId, returnUrl })
            });
            if (!r.ok) throw new Error(await r.text());
            const { url } = await r.json();

            setStatus("Opening hosted form…");
            window.open(url, "_blank", "noopener,noreferrer");
            setStatus("");
        } catch (err: any) {
            console.error(err);
            setStatus(`Failed: ${err?.message || String(err)}`);
            alert(`Failed: ${err?.message || String(err)}`);
        }
    };

    return (
        <div style={{ padding: 16 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12 }}>
                <input
                    value={formId}
                    onChange={e => setFormId(e.target.value)}
                    placeholder="Web Form ID"
                    style={{ minWidth: 280 }}
                />
                <input
                    value={returnUrl}
                    onChange={e => setReturnUrl(e.target.value)}
                    placeholder="Return URL after submit"
                    style={{ minWidth: 360 }}
                />
                <button onClick={start}>Open hosted form</button>
                <span>{status}</span>
            </div>
            <p style={{ color: "#666" }}>
                Requires a published Web Form in your DocuSign account and JWT scopes:
                <code> signature impersonation webforms_read webforms_instance_read webforms_instance_write</code>.
            </p>
        </div>
    );
}
