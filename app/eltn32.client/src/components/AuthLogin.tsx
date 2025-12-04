import React, { useState } from 'react';

export default function AuthLogin() {
  const [username, setUsername] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoggedIn(true);
  };

  if (loggedIn) {
    return <div className="text-sm font-medium">Hello, {username || 'User'}</div>;
  }

  return (
    <form onSubmit={submit} className="flex items-center gap-2">
      <button type="submit" className="px-3 py-1.5 bg-slate-900 text-white rounded-md text-sm">
        Login
      </button>
    </form>
  );
}