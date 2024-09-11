import MainHeader from '@/components/main-header/main-header';
import './globals.css';

export const metadata = {
  title: 'Next.js Food App',
  description: 'Delicious meals, shared by a food-loving community.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <MainHeader />
        {children}
      </body>
    </html>
  );
}
