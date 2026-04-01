"use client";

import { LanguageProvider } from "@/lib/LanguageContext";

export function Providers({ children }) {
    return (
        <LanguageProvider>
            {children}
        </LanguageProvider>
    );
}
