import type { EmbeddedSigningInput, EmbeddedSigningResult } from "@better-docusign/core";

export async function createEmbeddedUrlViaBackend(
    endpoint: string,
    input: EmbeddedSigningInput
): Promise<EmbeddedSigningResult> {
    const r = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input)
    });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
}

export function openInIframe(container: HTMLElement, url: string) {
    const iframe = document.createElement("iframe");
    iframe.src = url;
    iframe.allow = "clipboard-read; clipboard-write";
    iframe.style.width = "100%";
    iframe.style.height = "100%";
    iframe.style.border = "0";
    container.appendChild(iframe);
    return iframe;
}

export function openInNewTab(url: string) {
    window.open(url, "_blank", "noopener,noreferrer");
}

export function parseReturnUrl(u: string) {
    const url = new URL(u, window.location.origin);
    const event = url.searchParams.get("event") || url.searchParams.get("eventCode") || "";
    const params: Record<string,string> = {};
    url.searchParams.forEach((v, k) => (params[k] = v));
    return { event, ...params };
}
