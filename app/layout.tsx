import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import PageLoading from "@/components/page-loading";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Define metadata for the application (used for SEO and browser tabs)
export const metadata: Metadata = {
  title: "palettelab",
  description: "generate color palettes",
};

/**
 * Root layout component for the Next.js application.
 * Wraps all pages and provides global structure, fonts, and providers.
 *
 * @param {Readonly<{ children: React.ReactNode }>} props - Component props.
 * @param {React.ReactNode} props.children - The content of the specific page being rendered.
 * @returns {JSX.Element} The root HTML structure of the application.
**/
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Set language and suppress hydration warnings (common practice with theme providers)
    <html lang="en" suppressHydrationWarning>
      {/* Apply font variables and antialiasing to the body */}
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Wrap the application with the ThemeProvider */}
        <ThemeProvider
            attribute="class" // Use class-based theme switching (adds 'light' or 'dark' to html tag)
            defaultTheme="dark" // Set the default theme
            enableSystem // Allow theme to follow system preference
            disableTransitionOnChange // Prevent transitions when theme changes initially
          >
          {/* Include the page loading indicator */}
          <PageLoading />
          {/* Render the actual page content */}
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
