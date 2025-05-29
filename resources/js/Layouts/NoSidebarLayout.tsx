import React, { ReactNode } from 'react';

export default function NoSidebarLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#fffbea] flex flex-col">
      {/* Optional: Tambahkan header/topbar jika perlu */}
      <main className="flex-1 flex flex-col items-center justify-center">
        {children}
      </main>
    </div>
  );
}
