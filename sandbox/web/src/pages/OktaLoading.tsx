import { FC } from "react";
import oktaLogo from '../assets/okta.svg'


export const OktaLoading: FC = () => {
    return (
        <div style={{ display: 'flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
            <img alt={''} style={{ width: 250, marginBottom: 100 }} src={oktaLogo} />
        </div>
    );
}