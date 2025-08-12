import React from "react";
import { parseReturnUrl } from "@better-docusign/web";

export default function ReturnPage() {
    const info = parseReturnUrl(window.location.href);
    return (
        <div style={{ padding: 16 }}>
            <h3>Return from Docusign</h3>
            <pre>{JSON.stringify(info, null, 2)}</pre>
        </div>
    );
}
