import type {Metadata} from 'next';
import { Inter } from 'next/font/google'; // Changed from Geist_Sans to Inter
import './globals.css';
import { Toaster } from "@/components/ui/toaster"; // Import Toaster

const inter = Inter({ // Changed from geistSans to inter
  variable: '--font-inter', // Changed CSS variable name
  subsets: ['latin'],
});

// Geist Mono is not explicitly used, but kept for consistency if needed.
// const geistMono = Geist_Mono({ 
//   variable: '--font-geist-mono',
//   subsets: ['latin'],
// });

export const metadata: Metadata = {
  title: 'CalorieSnap - AI Calorie Counter',
  description: 'Estimate food calories from images and track your nutritional intake with CalorieSnap.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}> {/* Apply updated font variable to html */}
      <body className={`antialiased`}> 
        {children}
        <Toaster />
      </body>
    </html>
  );
}
