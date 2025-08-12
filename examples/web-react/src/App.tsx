import React from "react";
import { BrowserRouter, NavLink, Route, Routes } from "react-router-dom";
import Embedded from "./pages/Embedded";
import Hosted from "./pages/Hosted";
import ReturnPage from "./pages/Return";
import EmailPage from "./pages/Email";

export default function App() {
    return (
        <BrowserRouter>
            <nav className="nav">
                <NavLink to="/" end>Embedded</NavLink>
                <NavLink to="/hosted">Hosted (Web Forms)</NavLink>
                <NavLink to="/email">Email</NavLink>
                <NavLink to="/docusign/return">Return</NavLink>
            </nav>
            <div className="page">
                <Routes>
                    <Route path="/" element={<Embedded />} />
                    <Route path="/hosted" element={<Hosted />} />
                    <Route path="/email" element={<EmailPage />} />
                    <Route path="/docusign/return" element={<ReturnPage />} />
                </Routes>
            </div>
        </BrowserRouter>
    );
}
