import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import { AppStateProvider } from "@/context/AppStateContext";
import { ToastProvider } from "@/context/ToastContext";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "flow-state",
  description: "Kanban, todos, and notes for solo devs.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${jetbrainsMono.variable} h-full`}>
      <body className="h-full antialiased">
        <AppStateProvider>
          <ToastProvider>{children}</ToastProvider>
        </AppStateProvider>
      </body>
    </html>
  );
}
