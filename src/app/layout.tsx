'use client';
import "./globals.css";
import Providers from "@/providers/provider";
import { WagmiProvider } from "wagmi";
import {config} from "@/config/config"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from 'sonner'
import { ThemeProvider } from 'styled-components';
import { theme } from '../styles/theme';

const queryClient = new QueryClient()


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`antialiased`}
      >
        <ThemeProvider theme={theme}>
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
        <Providers>
        {children}
        </Providers>
        </QueryClientProvider>
        </WagmiProvider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
