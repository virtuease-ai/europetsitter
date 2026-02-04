import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Inter } from 'next/font/google';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AuthProvider } from '@/contexts/AuthContext';
import type { Metadata } from 'next';
import '../globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'EuroPetSitter - Trouvez votre petsitter en Belgique',
    template: '%s | EuroPetSitter'
  },
  description: 'Plateforme de mise en relation entre propriétaires d\'animaux et petsitters professionnels en Belgique. Sans commission, profils vérifiés.',
  keywords: ['petsitter', 'garde animaux', 'belgique', 'chien', 'chat', 'hébergement animaux'],
  authors: [{ name: 'EuroPetSitter' }],
  openGraph: {
    type: 'website',
    locale: 'fr_BE',
    url: 'https://europetsitter.be',
    siteName: 'EuroPetSitter',
    title: 'EuroPetSitter - Trouvez votre petsitter en Belgique',
    description: 'Plateforme de mise en relation entre propriétaires d\'animaux et petsitters professionnels',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EuroPetSitter',
    description: 'Trouvez le petsitter parfait pour votre compagnon',
  },
  robots: {
    index: true,
    follow: true,
  }
};

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <AuthProvider>
            <Header />
            <main>{children}</main>
            <Footer />
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
