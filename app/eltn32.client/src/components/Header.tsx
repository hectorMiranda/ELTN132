import React from 'react';
import SearchBar from './SearchBar';
import AuthLogin from './AuthLogin';

export default function Header() {
  return (
    <div className="flex items-center justify-between h-14">
      <div className="flex items-center gap-4">
        <button className="md:hidden p-2 rounded bg-slate-100">Menu</button>
        <SearchBar />
      </div>

      <div className="flex items-center gap-3">
        <AuthLogin />
      </div>
    </div>
  );
}