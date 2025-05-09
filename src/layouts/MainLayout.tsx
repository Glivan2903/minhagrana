import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '@/components/Header';
import { SidebarNav } from '@/components/SidebarNav';
import { useAuth } from '@/contexts/AuthContext';
import Logo from '@/components/Logo';
import WhatsAppButton from '@/components/WhatsAppButton';

export const MainLayout = () => {
  const { user, signOut } = useAuth();
  
  return (
    <div className="flex min-h-screen bg-minhagrana-background">
      <div className="w-64 bg-white border-r border-gray-200 fixed inset-y-0 left-0 z-40">
        {/* <div className="p-4 border-b border-gray-200">
          <Logo />
        </div> */}
        <SidebarNav />
      </div>
      <div className="flex-1 flex flex-col ml-64">
        <Header 
          username={user?.user_metadata?.username || 'Usuário'} 
          onLogout={signOut} 
        />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
      {/* WhatsApp button positioned at bottom right corner */}
      <div className="fixed right-6 bottom-6 z-50">
        <WhatsAppButton />
      </div>
    </div>
  );
};
