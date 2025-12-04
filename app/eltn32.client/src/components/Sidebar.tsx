import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

const MENU = [
  { title: 'Binary to Decimal', path: '/binary-to-decimal' },
  { title: 'Decimal to Binary', path: '/decimal-to-binary' },
  { title: 'Boolean Expressions', path: '/boolean-expressions' },
  { title: 'Boolean Algebra', path: '/boolean-algebra' },
  { title: 'Boolean Algebra Identities', path: '/boolean-algebra-identities' },
  { title: 'De Morgan Identities', path: '/de-morgan-identities' },
  { title: 'Associative Rules', path: '/associative-rules' },
  { title: 'Logic Gates', path: '/logic-gates' },
  { title: 'K Map', path: '/k-map' },
  { title: 'MSI', path: '/msi' },
  { title: 'SPI', path: '/spi' },
];

export default function Sidebar() {
  const router = useRouter();

  return (
    <nav className="flex flex-col h-full">
      <div className="px-6 py-4 text-lg font-semibold border-b border-slate-800">Logic Tools</div>

      <ul className="p-4 space-y-1 overflow-auto">
        {MENU.map((item) => {
          const active = router.pathname === item.path;
          return (
            <li key={item.path}>
              <Link
                href={item.path}
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