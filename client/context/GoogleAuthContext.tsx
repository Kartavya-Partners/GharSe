"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { ReactNode } from "react";

// Get the Google Client ID from environment variable
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

interface GoogleAuthProviderProps {
    children: ReactNode;
}

export function GoogleAuthProvider({ children }: GoogleAuthProviderProps) {
    // Only render provider if client ID is configured
    if (!GOOGLE_CLIENT_ID) {
        console.warn("Google Client ID not configured. Google login will not work.");
        return <>{children}</>;
    }

    return (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            {children}
        </GoogleOAuthProvider>
    );
}
