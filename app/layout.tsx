import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "SurfSense - A Personal NotebookLM and Perplexity-like AI Assistant for Everyone.",
	description:
		"Have your own private NotebookLM and Perplexity with better integrations.",
	manifest: "/manifest.json",
	viewport: {
		themeColor: "#000000",
		width: 'device-width',
		initialScale: 1
	},
	appleWebApp: {
		capable: true,
		statusBarStyle: "black",
		title: "SurfSense"
	},
	icons: {
		icon: "/icons/icon-512x512.png",
		shortcut: "/icons/icon-192x192.png",
		apple: "/icons/icon-192x192.png",
	}
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={cn(
				"min-h-screen bg-background font-sans antialiased",
				inter.className
			)}>
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
					{children}
					<Toaster />
				</ThemeProvider>
			</body>
		</html>
	);
}
