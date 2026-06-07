"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

const BrandingContext = createContext({
    branding: {
        logoUrl: null,
        description: "Redonner le sourire aux petits champions à travers l'innovation et l'éducation intelligente.",
        phone: "+216 71 000 000",
        email: "hello@diacarekids.tn",
        address: "Hôpital des Enfants, Tunis",
        website: "www.diacarekids.com"
    },
    updateBranding: () => {},
    isLoading: false,
});

const BRANDING_STORAGE_KEY = 'diacare_platform_branding';

export function BrandingProvider({ children }) {
    const [branding, setBrandingState] = useState({
        logoUrl: null,
        description: "Redonner le sourire aux petits champions à travers l'innovation et l'éducation intelligente.",
        phone: "+216 71 000 000",
        email: "hello@diacarekids.tn",
        address: "Hôpital des Enfants, Tunis",
        website: "www.diacarekids.com"
    });
    const [isLoading, setIsLoading] = useState(true);

    // Load persisted branding on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem(BRANDING_STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                setBrandingState(prev => ({ ...prev, ...parsed }));
            }
        } catch (err) {
            console.error("Error loading branding:", err);
        }
        setIsLoading(false);
    }, []);

    const updateBranding = (updates) => {
        setBrandingState(prev => {
            const newState = { ...prev, ...updates };
            try {
                localStorage.setItem(BRANDING_STORAGE_KEY, JSON.stringify(newState));
            } catch (err) {
                console.error("Error saving branding:", err);
            }
            return newState;
        });
    };

    return (
        <BrandingContext.Provider value={{ branding, updateBranding, isLoading }}>
            {children}
        </BrandingContext.Provider>
    );
}

export function useBranding() {
    return useContext(BrandingContext);
}
