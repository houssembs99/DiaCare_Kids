"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

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
    isLoading: true,
});

const BRANDING_STORAGE_KEY = 'diacare_platform_branding_v2'; // Forced refresh with v2

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

    // Initial load
    useEffect(() => {
        try {
            const saved = localStorage.getItem(BRANDING_STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                setBrandingState(prev => ({ ...prev, ...parsed }));
            }
        } catch (err) {
            console.error("Error loading branding:", err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Side effect: Save to local storage whenever branding changes AND not during initial load
    useEffect(() => {
        if (!isLoading) {
            try {
                localStorage.setItem(BRANDING_STORAGE_KEY, JSON.stringify(branding));
                console.log("Branding saved to localStorage:", branding);
            } catch (err) {
                console.error("Error saving branding to localStorage:", err);
            }
        }
    }, [branding, isLoading]);

    const updateBranding = useCallback((updates) => {
        setBrandingState(prev => {
            const newState = { ...prev, ...updates };
            console.log("Updating branding context with:", updates);
            return newState;
        });
    }, []);

    return (
        <BrandingContext.Provider value={{ branding, updateBranding, isLoading }}>
            {children}
        </BrandingContext.Provider>
    );
}

export function useBranding() {
    return useContext(BrandingContext);
}
