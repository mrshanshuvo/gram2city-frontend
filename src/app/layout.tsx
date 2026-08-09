import type { Metadata } from 'next';
import { Urbanist } from 'next/font/google';
import './globals.css';
import { Providers } from './Providers';

const urbanist = Urbanist({ subsets: ['latin'], variable: '--font-urbanist' });

export const metadata: Metadata = {
  title: {
    default: 'Gram2City — Express Nationwide Logistics & Parcel Delivery',
    template: '%s | Gram2City Logistics',
  },
  description:
    'Gram2City bridges the gap between village and city with fast, reliable, nationwide door-to-door parcel delivery and merchant logistics in Bangladesh.',
  keywords: [
    'parcel delivery',
    'logistics Bangladesh',
    'express courier',
    'Gram2City',
    'doorstep pickup',
    'COD merchant wallet',
    'rider delivery',
  ],
  authors: [{ name: 'Gram2City Logistics' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://gram2city.com',
    siteName: 'Gram2City Logistics',
    title: 'Gram2City — Express Nationwide Logistics & Parcel Delivery',
    description:
      'Bridging the gap between village and city with fast, reliable, nationwide door-to-door parcel delivery.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gram2City — Express Logistics',
    description: 'Fast, reliable door-to-door parcel delivery across Bangladesh.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${urbanist.variable} font-urbanist`} suppressHydrationWarning>
        <div id="root" className="font-urbanist">
          <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  );
}
