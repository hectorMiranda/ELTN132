import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import * as gtag from '../lib/analytics';

const MENU = [
  { title: 'Binary to Decimal', path: '/binary-to-decimal' },
  { title: 'Decimal to Binary', path: '/decimal-to-binary' },
  { title: 'Boolean Expressions', path: '/boolean-expressions' },
  { title: 'Boolean Algebra', path: '/boolean-algebra' },
  { title: 'Associative Rules', path: '/associative-rules' },
  { title: 'Logic Gates', path: '/logic-gates' },
  { title: 'K Map', path: '/k-map' },
  { title: 'MSI', path: '/msi' },
  { title: 'SPI', path: '/spi' },
];

export default function Sidebar() {
  const router = useRouter();

  const handleMenuClick = (item: { title: string; path: string }) => {
    gtag.event({
      action: 'click',
      category: 'Navigation',
      label: item.title,
    });
  };

  return (
    <nav className="flex flex-col h-full">
          <div className="px-6 py-4 text-lg font-semibold border-b border-slate-800">Logic Tools for ELTN132</div>

      <ul className="p-4 space-y-1 overflow-auto">
        {MENU.map((item) => {
          const active = router.pathname === item.path;
          return (
            <li key={item.path}>
              <Link
                href={item.path}
                onClick={() => handleMenuClick(item)}
                className={`block rounded-md px-3 py-2 text-sm ${
                  active ? 'bg-slate-700 font-medium' : 'hover:bg-slate-800'
                }`}
              >
                {item.title}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}