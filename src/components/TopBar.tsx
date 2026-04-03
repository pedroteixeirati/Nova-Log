import React from 'react';
import { Search, Bell, History, Plus, User as UserIcon } from 'lucide-react';
import { NavItem } from '../types';
import { useFirebase } from '../context/FirebaseContext';
import { canAccess } from '../lib/permissions';

interface TopBarProps {
  onNavigate: (item: NavItem) => void;
}

export default function TopBar({ onNavigate }: TopBarProps) {
  const { user, userProfile } = useFirebase();
  const canCreateExpense = canAccess(userProfile, 'expenses', 'create');

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'dev': return 'bg-tertiary/20 text-tertiary';
      case 'owner': return 'bg-primary-fixed text-primary';
      case 'admin': return 'bg-primary/20 text-primary';
      case 'financial': return 'bg-secondary/20 text-secondary';
      case 'operational': return 'bg-tertiary-container text-on-tertiary-container';
      case 'driver': return 'bg-secondary/20 text-secondary';
      default: return 'bg-surface-container text-on-surface-variant';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'dev': return 'Desenvolvedor';
      case 'owner': return 'Proprietario';
      case 'admin': return 'Administrador';
      case 'financial': return 'Financeiro';
      case 'operational': return 'Operacional';
      case 'driver': return 'Motorista';
      case 'viewer': return 'Visualizador';
      default: return role;
    }
  };

  return (
    <header className="fixed top-0 right-0 left-64 h-16 z-40 bg-surface/80 backdrop-blur-md flex items-center justify-between px-8 border-none">
      <div className="flex items-center gap-8">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
          <input 
            type="text" 
            placeholder="Buscar frota..." 
            className="bg-surface-container rounded-full py-1.5 pl-10 pr-4 text-xs focus:ring-2 focus:ring-primary outline-none w-64 transition-all border-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-3 mr-4 pr-4 border-r border-outline-variant">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-on-surface leading-none mb-1">
                {user.email?.endsWith('@novalog.test') 
                  ? user.email.split('@')[0] 
                  : user.email}
              </p>
              {userProfile?.tenantName && (
                <p className="text-[10px] text-on-surface-variant uppercase tracking-wider mb-1">
                  {userProfile.tenantName}
                </p>
              )}
              {userProfile ? (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter ${getRoleBadge(userProfile.role)}`}>
                  {getRoleLabel(userProfile.role)}
                </span>
              ) : (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter bg-surface-container text-on-surface-variant">
                  Carregando perfil
                </span>
              )}
            </div>
            <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant">
              <UserIcon className="w-4 h-4" />
            </div>
          </div>
        )}
        <button className="p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors">
          <History className="w-5 h-5" />
        </button>
        <button className="p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors">
          <Bell className="w-5 h-5" />
        </button>
        {canCreateExpense && (
          <button
            onClick={() => onNavigate('expenses')}
            className="bg-primary text-on-primary px-5 py-2 rounded-full font-semibold text-sm flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Nova Despesa
          </button>
        )}
      </div>
    </header>
  );
}
