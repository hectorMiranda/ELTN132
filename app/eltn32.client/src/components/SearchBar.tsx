import React, { useState } from 'react';

export default function SearchBar() {
  const [q, setQ] = useState('');

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Search: "${q}"`);
  };

  return (
    <form onSubmit={onSubmit} className="flex items-center gap-2">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search topics..."
        className="px-3 py-1.5 border rounded-md text-sm w-60"
        aria-label="Search"
      />
      <button type="submit" className="px-3 py-1.5 bg-slate-900 text-white rounded-md text-sm">
        Search
      </button>
    </form>
  );
}