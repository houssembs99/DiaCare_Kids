import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Providers } from "@/components/Providers";
import "./globals.css";

export const metadata = {
  title: "DiaCare Kids | Le suivi du diabète intelligent",
  description: "Plateforme intelligente de suivi du diabète chez l’enfant avec éducation en Réalité Augmentée.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="antialiased selection:bg-primary/10 transition-colors duration-500">
        <Providers>
          <Navbar />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
