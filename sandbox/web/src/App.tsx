import { FC, useCallback } from 'react'
import { Route, Routes, useNavigate } from "react-router-dom";
import { OktaAuth, toRelativeUrl } from "@okta/okta-auth-js";
import { LoginCallback, Security } from "@okta/okta-react";
import { OktaLoading } from "./pages/OktaLoading.tsx";
import { MainOutlet } from "./components/MainOutlet.tsx";
import { HomePage } from "./pages/HomePage.tsx";
import { WorkflowDialog } from "./components/WorkflowDialog.tsx";
import { OnboardPage } from "./pages/OnboardPage.tsx";
import { DemoPage } from "./pages/DemoPage.tsx";


const oktaAuth = new OktaAuth({
    clientId: '0oahei787p5aVp9Pc5d7',
    issuer: 'https://dev-48250771.okta.com/oauth2/default',
    redirectUri: window.location.origin + '/login/callback',
    scopes: ['openid', 'profile', 'email', 'offline_access'],
    tokenManager: {
        autoRenew: true
    },
    pkce: true
});

const App: FC = () => {

    const navigate = useNavigate();
    const restoreOriginalUri = useCallback((_oktaAuth: any, originalUri: string) => {
        navigate(toRelativeUrl(originalUri || '/', window.location.origin))
    }, []);

    return (
        <Security oktaAuth={oktaAuth} restoreOriginalUri={restoreOriginalUri}>
            <div style={{ width: '100%', height: '100vh', overflow: 'auto' }}>
                <Routes>
                    <Route path="/login/callback" element={<LoginCallback loadingElement={<OktaLoading />} />} />
                    <Route path="/" element={<MainOutlet />}>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/demo" element={<DemoPage />} />
                        <Route path="/test" element={<WorkflowDialog />} />
                        <Route path="/onboard" element={<OnboardPage />} />
                    </Route>
                </Routes>
            </div>
        </Security>
    )
}

export default App
