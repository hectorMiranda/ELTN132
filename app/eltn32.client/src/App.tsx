import React, { ReactNode } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Footer from './components/Footer';

interface AppProps {
  children?: ReactNode;
}

export default function AppLayout({ children }: AppProps) {
  return (
    <div className="min-h-screen flex">
      <aside className="hidden md:flex md:flex-col w-64 bg-slate-900 text-white">
        <Sidebar />
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="sticky top-0 z-20 bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Header />
          </div>
        </header>

        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>

        <footer className="bg-white border-t">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <Footer />
          </div>
        </footer>
      </div>
    </div>
  );
}