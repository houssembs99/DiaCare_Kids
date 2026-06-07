"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

const LogoContext = createContext({
    logoUrl: null,
    setLogoUrl: () => {},
    isLoading: false,
});

const LOGO_STORAGE_KEY = 'diacare_platform_logo';

export function LogoProvider({ children }) {
    const [logoUrl, setLogoUrlState] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load persisted logo on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem(LOGO_STORAGE_KEY);
            if (saved) setLogoUrlState(saved);
        } catch {}
        setIsLoading(false);
    }, []);

    const setLogoUrl = (url) => {
        setLogoUrlState(url);
        try {
            if (url) {
                localStorage.setItem(LOGO_STORAGE_KEY, url);
            } else {
                localStorage.removeItem(LOGO_STORAGE_KEY);
            }
        } catch {}
    };

    return (
        <LogoContext.Provider value={{ logoUrl, setLogoUrl, isLoading }}>
            {children}
        </LogoContext.Provider>
    );
}

export function useLogo() {
    return useContext(LogoContext);
}
