import { FC, PropsWithChildren, useEffect } from "react";
import { useOktaAuth } from "@okta/okta-react";
import { toRelativeUrl } from "@okta/okta-auth-js";
import { OktaLoading } from "../pages/OktaLoading.tsx";

export const RequireAuth: FC<PropsWithChildren> = ({ children }) => {
    const { oktaAuth, authState } = useOktaAuth();
    useEffect(() => {
        if (!authState) {
            return;
        }

        if (!authState?.isAuthenticated) {
            const originalUri = toRelativeUrl(window.location.href, window.location.origin);
            oktaAuth.setOriginalUri(originalUri);
            oktaAuth.signInWithRedirect();
        }
    }, [oktaAuth, authState]);

    if (!authState || !authState.isAuthenticated) {
        return <OktaLoading />
    }

    return <>{children}</>;

}