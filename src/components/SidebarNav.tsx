import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Wallet, 
  Calendar, 
  FolderTree,
  FileText,
  Target, 
  User,
  LogOut,
} from 'lucide-react';
import { MessageSquare } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Logo from './Logo';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

type NavItemProps = {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isActive?: boolean;
  onClick?: () => void;
};

const NavItem = ({ href, icon, children, isActive, onClick }: NavItemProps) => {
  if (onClick) {
    return (
      <button 
        onClick={onClick}
        className={`flex items-center gap-3 p-2 rounded-md w-full text-left ${
          isActive 
            ? 'bg-minhagrana-primary text-white' 
            : 'hover:bg-gray-100 text-gray-700'
        }`}
      >
        <span className="w-5 h-5">{icon}</span>
        <span>{children}</span>
      </button>
    );
  }

  return (
    <Link 
      to={href} 
      className={`flex items-center gap-3 p-2 rounded-md ${
        isActive 
          ? 'bg-minhagrana-primary text-white' 
          : 'hover:bg-gray-100 text-gray-700'
      }`}
    >
      <span className="w-5 h-5">{icon}</span>
      <span>{children}</span>
    </Link>
  );
};

interface SidebarNavProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SidebarNav({ className, ...props }: SidebarNavProps) {
  const location = useLocation();
  const currentPath = location.pathname;
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className={cn("pb-12", className)} {...props}>
      <div className="space-y-4 py-4">
        <div className="flex flex-col items-center justify-center mb-6 mt-2">
          <Logo />
        </div>
        <div className="px-3 py-2">
          
          <div className="space-y-1">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => navigate('/dashboard')}
            >
              <span className="w-5 h-5"><LayoutDashboard /></span>
              <span>Dashboard</span>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => navigate('/transactions')}
            >
              <span className="w-5 h-5"><Wallet /></span>
              <span>Transações</span>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => navigate('/future-transactions')}
            >
              <span className="w-5 h-5"><Calendar /></span>
              <span>Transações Futuras</span>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => navigate('/categories')}
            >
              <span className="w-5 h-5"><FolderTree /></span>
              <span>Categorias</span>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => navigate('/goals')}
            >
              <span className="w-5 h-5"><Target /></span>
              <span>Metas</span>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => navigate('/relatorios-detalhados')}
            >
              <span className="w-5 h-5"><FileText /></span>
              <span>Relatórios Detalhados</span>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => navigate('/profile')}
            >
              <span className="w-5 h-5"><User /></span>
              <span>Perfil</span>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-red-500 hover:text-red-600"
              onClick={handleLogout}
            >
              <span className="w-5 h-5"><LogOut /></span>
              <span>Sair</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
