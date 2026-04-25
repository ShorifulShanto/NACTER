import type {Metadata} from 'next';
import './globals.css';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'NECTAR — Fresh Cold-Pressed Juice',
  description: 'A luxury functional beverage brand inspired by classic flavors with healthier ingredients',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@1,400;1,700&family=Inter:wght@300;400;500&family=Nunito:wght@700;800;900&family=Poppins:wght@300;400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-black text-white selection:bg-primary selection:text-white">
        <FirebaseClientProvider>
          {children}
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
