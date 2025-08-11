import { FC } from "react";
import { EchoBridgeProvider, Widget, FileExplorer, EchoBridgeTheme } from "@echobridge/react";
import { EchoBridgeClient } from "@echobridge/client";
import { useOktaAuth } from "@okta/okta-react";
import { Outlet } from "react-router-dom";
import { RequireAuth } from "./RequireAuth.tsx";

export const MainOutlet: FC = () => {
    return (
        <RequireAuth>
            <MainOutletContent />
        </RequireAuth>
    );
}

const echoBridgeClient = new EchoBridgeClient({ server: 'http://localhost:7008' });

export const MainOutletContent: FC = () => {
    const { authState } = useOktaAuth();
    //Thanks, Okta!
    const accessToken = authState?.accessToken?.accessToken

    // if (!accessToken) {
    //     return <OktaLoading />
    // }

    return (
        <EchoBridgeProvider client={echoBridgeClient} token={accessToken}>
            <Outlet />
            <EchoBridgeTheme>
                <Widget />
                <FileExplorer />
            </EchoBridgeTheme>
        </EchoBridgeProvider>
    );
}