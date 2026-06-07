"use client";

import { LanguageProvider } from "@/lib/LanguageContext";
import { LogoProvider } from "@/lib/LogoContext";

export function Providers({ children }) {
    return (
        <LanguageProvider>
            <LogoProvider>
                {children}
            </LogoProvider>
        </LanguageProvider>
    );
}
