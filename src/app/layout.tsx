import type { Metadata, Viewport } from "next";
import { Anton, Archivo, JetBrains_Mono } from "next/font/google";
import "./globals.css";

/**
 * Type system.
 * Display is Anton: a condensed heavy grotesque that carries the sports-poster
 * weight the brand needs. UI is Archivo, a variable grotesque from the same
 * family tree, so emphasis never requires a second family. Numbers get a mono
 * with tabular figures because scores, distances and prize pools must align.
 */
const anton = Anton({
  variable: "--font-anton",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-mono-jb",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("http://localhost:3000"),
  title: {
    default: "PadelParty. Encuentra con quién jugar",
    template: "%s · PadelParty",
  },
  description:
    "Publica que te falta un jugador, entra en partidos abiertos cerca de ti y compite en los torneos de tu club.",
  openGraph: {
    type: "website",
    locale: "es_ES",
    siteName: "PadelParty",
    title: "PadelParty. Encuentra con quién jugar",
    description:
      "Publica que te falta un jugador, entra en partidos abiertos cerca de ti y compite en los torneos de tu club.",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a1a4f",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${anton.variable} ${archivo.variable} ${jetbrains.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        {/* Fixed, pointer-events-none: one GPU composite, not a per-frame repaint. */}
        <div className="grain" aria-hidden="true" />
      </body>
    </html>
  );
}
