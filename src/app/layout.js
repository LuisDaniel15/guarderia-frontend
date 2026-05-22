'use client';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import './globals.css';

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const isLogin  = pathname === '/login';

  return (
    <html lang="es">
      <body>
        {isLogin ? (
          children
        ) : (
          <div className="layout">
            <Sidebar />
            <main className="main-content">
              {children}
            </main>
          </div>
        )}
      </body>
    </html>
  );
}