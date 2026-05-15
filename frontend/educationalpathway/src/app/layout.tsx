import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/providers/auth-context";
import { ThemeProvider } from "@/providers/theme-context";
import { Toaster } from "react-hot-toast";

import { GoogleOAuthProvider } from "@react-oauth/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const plusJakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-plus-jakarta", weight: ["400", "500", "600", "700", "800"] });

export const metadata: Metadata = {
  title: "Path Finder",
  description: "Your journey to academic success starts here.",
  icons: {
    icon: "/pathfinder.png",
    apple: "/pathfinder.png",
  },
};

import { SWRProvider } from "@/providers/swr-provider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

  if (!googleClientId) {
    console.warn(
      "NEXT_PUBLIC_GOOGLE_CLIENT_ID is not defined. Google OAuth will fail. " +
        "Add the environment variable to .env.local with your client ID.",
    );
  }

  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${plusJakarta.variable} font-sans antialiased text-foreground bg-background`}
      >
        <SWRProvider>
          {googleClientId ? (
            <GoogleOAuthProvider clientId={googleClientId}>
              <ThemeProvider>
                <AuthProvider>
                  {children}
                  <Toaster position="top-right" />
                </AuthProvider>
              </ThemeProvider>
            </GoogleOAuthProvider>
          ) : (
            <ThemeProvider>
              <AuthProvider>
                {children}
                <Toaster position="top-right" />
              </AuthProvider>
            </ThemeProvider>
          )}
        </SWRProvider>
      </body>
    </html>
  );
}

