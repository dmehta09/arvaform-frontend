import { ThemeProvider } from '@/components/theme-provider';
import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

// Configure modern fonts for ArvaForm
const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
  preload: true,
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  display: 'swap',
  preload: true,
});

// ArvaForm metadata configuration
export const metadata: Metadata = {
  title: {
    default: 'ArvaForm - Advanced Form Builder',
    template: '%s | ArvaForm',
  },
  description:
    'Create, customize, and deploy advanced forms with conditional logic, integrations, and analytics. The modern form builder for teams and enterprises.',
  keywords: ['form builder', 'forms', 'survey', 'conditional logic', 'integrations', 'analytics'],
  authors: [{ name: 'ArvaForm Team' }],
  creator: 'ArvaForm',
  publisher: 'ArvaForm',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env['NEXT_PUBLIC_APP_URL'] || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'ArvaForm - Advanced Form Builder',
    description:
      'Create, customize, and deploy advanced forms with conditional logic, integrations, and analytics.',
    siteName: 'ArvaForm',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ArvaForm - Advanced Form Builder',
    description:
      'Create, customize, and deploy advanced forms with conditional logic, integrations, and analytics.',
    creator: '@arvaform',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add verification codes when available
    // google: '',
    // yandex: '',
    // yahoo: '',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning>
      <body className="font-sans antialiased bg-background text-foreground">
        <ThemeProvider>
          {/* Main content */}
          <main>{children}</main>
        </ThemeProvider>

        {/* Global scripts and third-party integrations can be added here */}
      </body>
    </html>
  );
}
